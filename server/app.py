from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify
import os
from flask_cors import CORS

import torch
from transformers import AutoModelWithLMHead, AutoTokenizer

model = AutoModelWithLMHead.from_pretrained('../model/')
tokenizer = AutoTokenizer.from_pretrained('../model/')
model.eval()

app = Flask("ElvisBot", template_folder=os.path.abspath('../client/build'), static_folder=os.path.abspath('../client/build/static'))
CORS(app)
delim = " <|brk|> "

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/ask-bot", methods = ['POST'])
def ask_bot():
    # print(jsonify(request.data))
    messages = request.get_json(force=True)
    prompt = "<|startoftext|>"
    for message in messages:
        prompt += message + delim
    prompt = prompt[:-len(delim)] + " <|answer|>"
    # print(prompt)

    answer = invoke_model(prompt)
    if len(answer) <= 0:
        return jsonify("Hello World!")
    answers = answer.split("<|answer|> ")
    if (len(answers) >= 1):
        answer = answers[1]
    else:
        answer = answers[0]

    return jsonify(answer.split(delim))

def invoke_model(prompt):
    generated = torch.tensor(tokenizer.encode(prompt, truncation=True, max_length=768)).unsqueeze(0)
    with torch.no_grad():
      sample_outputs = model.generate(
                                      generated,
                                      # bos_token_id=random.randint(1,30000),
                                      do_sample=True,
                                      max_length = 300,
                                      # top_k=50,
                                      # top_p=0.95
                                      num_return_sequences=1
                                      )

    return tokenizer.decode(sample_outputs[0], skip_special_tokens=True)
    # print(tokenizer.decode(sample_outputs[0], skip_special_tokens=True))
