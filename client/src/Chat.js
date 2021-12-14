// CREDITS: https://codepen.io/josefrichter/pen/OjBEMN
// (c) Josef.Richter [at] me.com

// the same thing in Vue.js here: https://codepen.io/josefrichter/pen/qXMWNW?editors=1111

// each message needs unique ID, read:
// https://www.automationfuel.com/react-keys-index/
// https://medium.com/@robinpokorny/index-as-a-key-is-an-anti-pattern-e0349aece318
// outside CodePen use https://github.com/dylang/shortid to generate them

import './Chat.css';
import React from 'react';

var timeout = 5000;

class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      chatInput: '',
      cache: [],
      flushed: true,
      lastEdit: Date.now()
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.askBot = this.askBot.bind(this);

  }

  handleChange(event) {
    this.setState({chatInput: event.target.value, lastEdit: Date.now()});
  }

  handleSubmit(event) {
    this.addMessage({
      id: Math.floor(Math.random()*1000000),
      userId: 1,
      content: this.state.chatInput
    });

    // cache message
    this.setState({cache: [...this.state.cache, this.state.chatInput]})
    if (this.state.flushed) {
      // flush cache after 6 seconds
      this.setState({flushed: false});
      setTimeout(() => {
        this.askBot();
      }, timeout);
    }
    // Clear the input box
    this.setState({ chatInput: '' });
    // Prevent page reload
    event.preventDefault();
  }

  addMessage(newMessage) {

    // https://stackoverflow.com/questions/26253351/correct-modification-of-state-arrays-in-reactjs
    this.setState({ messages: [newMessage, ...this.state.messages] })
  }

  askBot() {
    // check to see if typed recently
    var time = Date.now() - this.state.lastEdit;
    if (time < timeout) {
      setTimeout(() => {
        this.askBot();
      }, timeout - time);
      return;
    }

    // console.log(this.state.cache)
    fetch("http://localhost:5000/ask-bot", {
      method: "POST",
      // mode: 'no-cors',
      headers: {
        "accepts":"application/json",
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.cache)
    })
      .then(res => {
      if (res.status != 200) {
        console.log(res.status);
        return;
      }
      return res.json();
    })
      .then(data => {
      this.printMessages(data);
    })
      .catch(err=>{
      console.log(err)
    })

    //this.printMessages(this.state.cache);
    // console.log("test");

    // flush cache
    this.setState({cache: [], flushed: true});
  }

  printMessages(messages) {
    if (messages.length <= 0) {
      return;
    }

    this.addMessage({
      id: Math.floor(Math.random()*1000000),
      userId: 2,
      content: messages.shift()
    });

    setTimeout(() => {
      this.printMessages(messages);
    }, 200);
  }

  componentDidMount() {
    // console.log(shortId.generate());
    // preload old data if needed
    this.addMessage({
      id: Math.floor(Math.random()*1000000),
      userId:2,
      content:'Hey :)'
    });

  }

  render() {
    return (
      <div id="chat">
        <div id="chat-inner">
          <div id="messages">
              {this.state.messages.map((message, i) =>
                <span className={"message " + (message.userId == 1 ? 'ours' : 'theirs')} key={message.id}>{message.content}</span>
              )}
          </div>
          <form onSubmit={this.handleSubmit}>
            <input
              type="text"
              value={this.state.chatInput}
              onChange={this.handleChange} />
          </form>
        </div>
      </div>
    );
  }
}

export default Chat;
