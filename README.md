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
To train the model, I used a special version of GPT-2, Dialo-GPT, which is trained for dialogue, and its respecitve tokenizer. To tokenize the text, three special tokens, `<|startoftext|>`, `<|endoftext|>`, and `<|answer|>` were added. Together, a row of data looking like 
| questions      | answers |
| ----------- | ----------- |
| Hello <\|brk\|> How are you? | I'm doing fine. |

Would be changed to

`<startoftext|>Hello <|brk|> How are you? <|answer|> I'm doing fine.<|endoftext|>`

Before being passed into the tokenizer. After tokenization, labels of any tokens prior to and including the `<|answer|>` were set to -100 so cross-entropy loss would ignore those labels. This is because the model is only trying to generate tokens after the `<|answer|>` token, so the loss function shouldn't be computed on any tokens prior to that. 

It should also be noted that typically, we would want to also mask the attention of any tokens after the `<|answer|>` token, so that the model wouldn't "look ahead" at the answer during training time. However, I found better results by forgoing this. This made the end result more pattern-matchy, but it seemed to generate more cohesive responses which was good enough for the purposes of this project.

### Web Application
The frontend of this project was created with React, and the design intended to mimic the appearance of iMessages. To support multiple messages at once, the app would cache all incoming messages and then flush the cache after 5 seconds of no typing. Then, the backend model would be queried to generate and display a response.

The backend of this project was a simple flask app with two endpoints. One endpoint served the static built frontend React app, and the other queried the saved model. Honestly, a backend for this project wouldn't even be needed despite the fact that pytorch was required to run the model.

The app was intended to be deployed on AWS. However, AWS EC2 free servers have too little RAM to store the large GPT-2 model. This resulted in incredibly slow query time. Seeing as this is an app intended for just one person (my girlfriend), I decided to just host the app locally while I search for an inexpensive way to deploy the large model.

### Results
Some example conversations from the webapp are displayed here: (TBD)
