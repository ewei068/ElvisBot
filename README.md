# ElvisBot
iMessage chatbot webapp that I built as a Christmas gift for my girlfriend, which mimicks the way I text. The frontend was done with React, backend with flask, and model was GPT-2.

## Project Details

### Data
Data was collected from iMessage conversations between my girlfriend and I. Because of that, all of the training data in this project is kept private. If you would like to try out this project yourself, you will need a Mac and iMessage conversations of your own to train on. Data collection was done in `notebooks/messages.ipynb`. I queried my local Mac iMessage sqlite database, then filtered out the messages between my girlfriend and I. I also removed all blank messages, non-text messages (image, videos, etc), and reaction messages.

The data was then formatted in `notebooks/data_formatting.ipynb`. To format the data for training, messages occuring multiple times were concatenated together separated by a special `<|brk|>` token. This is so the model would hopefully recognize that multiple messages were sent at the same time. I could then split responses by this special token to display multiple message responses on the frontend. Messages were also ordered in a question response format such that each row would contain one of my girlfriend's messages followed by my response. Bringing this together, a dialogue looking like:

**Person A:** Hello \
**Person A:** How are you? \
**Person B:** I'm doing fine.

Would be formatted as:
| questions      | answers |
| ----------- | ----------- |
| Hello <\|brk\|> How are you? | I'm doing fine. |

### Model
To train the model, I used a special version of GPT-2, Dialo-GPT, which is trained for dialogue, and its respecitve tokenizer. The code for this can be found in `notebooks/GPT_2_train.ipynb`.

To tokenize the text, three special tokens, `<|startoftext|>`, `<|endoftext|>`, and `<|answer|>` were added. Together, a row of data looking like 
| questions      | answers |
| ----------- | ----------- |
| Hello <\|brk\|> How are you? | I'm doing fine. |

Would be changed to

`<startoftext|>Hello <|brk|> How are you? <|answer|> I'm doing fine.<|endoftext|>`

Before being passed into the tokenizer. After tokenization, labels of any tokens prior to and including the `<|answer|>` token were set to -100 so cross-entropy loss would ignore those labels. This is because the model is only trying to generate tokens after the `<|answer|>` token, so the loss function shouldn't be computed on any tokens prior to that. Additionally, the attention masks of any tokens after the <|answer|>` were be set to 0 so the model doesn't "look ahead" during training time to see what to generate.

### Web Application
The frontend of this project was created with React, and the design intended to mimic the appearance of iMessages. To support multiple messages at once, the app would cache all incoming messages and then flush the cache after 5 seconds of no typing. Then, the backend model would be queried to generate and display a response. The code for the frontend can be found in `client/`.

The backend of this project was a simple flask app with two endpoints. One endpoint served the static built frontend React app, and the other queried the saved model. Honestly, a backend for this project wouldn't even be needed despite the fact that pytorch was required to run the model. The code for the backend can be found in `server/`.

The app was intended to be deployed on AWS. However, AWS EC2 free servers have too little RAM to store the large GPT-2 model. This resulted in incredibly slow query time. Seeing as this is an app intended for just one person (my girlfriend), I decided to just host the app locally while I search for an inexpensive way to deploy the large model.

## Results
Some example conversations from the webapp are displayed here (the grey is the bot, the blue is me communicating with the bot):

**Conversation 1**
![alt text](https://github.com/ewei068/ElvisBot/blob/256f0cd583c069f486343b8adf49c9879072b1ce/example-conv1.jpg?raw=true)
This was a fairly standard conversation that I had with the bot. The bot is able to properly mimic my speech patterns and respond appropriately to my prompts. It even remembers that I like Minecraft.

**Conversation 2**
![alt text](https://github.com/ewei068/ElvisBot/blob/256f0cd583c069f486343b8adf49c9879072b1ce/example-conv2.jpg?raw=true)
Here we can see the bot having a standard conversation that mimics something that my girlfriend and I might have talked about. We now see one of the weaknesses of the bot: it seems to copy my exact response to a prompt rather than generate a new answer. This is likely due to my forgoing of the attention mask during training. Again, this works fine for generating realistic conversation, but it doesn't seem to synthesize much new dialogue.

**Conversation 3**
![alt text](https://github.com/ewei068/ElvisBot/blob/256f0cd583c069f486343b8adf49c9879072b1ce/example-conv3.jpg?raw=true)
In this conversation, we see the bot challenged with fairly new prompts not seen in the training data (my girlfriend never shamed me for playing League, unfortunately). The bot is able to reply with somewhat coherent answers, which actually pleasantly surprised me.

## Running the App and Making Changes

### Data
Because the data and model for this app is kept private, you will have to generate your own training data and model. To gather data, you will need a Mac and iMessage data (or you can get data from other sources). Collect the data in `notebooks/messages.ipynb`. You will also have to change the iMessage database path and handle ID to the path to your local iMessage database and the handle ID of the person who's texts to emulate respectively. You may also have to add a filter for chat ID if you were part of any group chats with the person in question.

Next, format the data in `notebooks/data_formatting.ipynb`. This notebook should be able to be run without any changes.

### Model
The model was trained in `notebooks/GPT_2_train.ipynb`. This notebook was run in Google Colab, so you may have to change some things around if not running the model in Google Colab. Other than that, parameters of the model or the GPT-2 corpus itself can be changed to your liking. Once the model is trained and saved, create a new directory `model/` in the project root, then move all saved model files to that directory.

### Frontend
Make sure npm is installed on your device. Once that's installed, navigate to `client/` and run `npm install` to install all the node dependencies. Run `npm start` to view the frontend webapp (it may not be fully functional without the backend). When changes are made, run `npm run build` to build the static app so the backend can serve it. More detailed instructions can be found in `client/README.md`.

### Backend
Make sure python3, pip3, and virtualenv are installed on your device. To start your virtual environment, navigate to `server/` and run the following commands:
1. `virtualenv venv`
2. `source venv/bin/activate`
3. `pip3 install -r requirements.txt`

Then, run the app with `flask run`. You can make changes in `app.py`. If any changes are made on the frontend, make sure you rebuild the frontend and re-run `flask run`. Finally, if any dependencies are changed, run `pip3 freeze > requirements.txt` before pushing new commits.

## Credits
iMessage data collection: https://towardsdatascience.com/heres-how-you-can-access-your-entire-imessage-history-on-your-mac-f8878276c6e9 \
Tokenization for dialogue: https://discuss.huggingface.co/t/gpt2-for-qa-pair-generation/759/7 \
Training GPT-2 in pytorch: https://reyfarhan.com/posts/easy-gpt2-finetuning-huggingface/ \
React iMessage webapp: https://codepen.io/josefrichter/pen/OjBEMN
