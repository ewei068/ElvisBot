// CREDITS: https://codepen.io/josefrichter/pen/OjBEMN
// (c) Josef.Richter [at] me.com

// the same thing in Vue.js here: https://codepen.io/josefrichter/pen/qXMWNW?editors=1111

// each message needs unique ID, read:
// https://www.automationfuel.com/react-keys-index/
// https://medium.com/@robinpokorny/index-as-a-key-is-an-anti-pattern-e0349aece318
// outside CodePen use https://github.com/dylang/shortid to generate them

import './Chat.css';
import React from 'react';


class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      chatInput: '',
      cache: [],
      flushed: true
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.askBot = this.askBot.bind(this);

  }

  handleChange(event) {
    this.setState({chatInput: event.target.value});
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
      }, 6000);
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
    /* var allMsg = "";
    for (const msg of this.state.cache) {
      allMsg += msg + " ";
    } */
    /* this.addMessage({
      id: Math.floor(Math.random()*1000000),
      userId: 2,
      content: allMsg
    }); */
    this.printMessages(this.state.cache);
    console.log("test");

    // flush cache
    this.setState({cache: [], flushed: true});
    /* setTimeout(() => {
      this.addMessage({
        id: Math.floor(Math.random()*1000000),
        userId: 2,
        content: "Hello World!"
      });
    }, 1000);*/
    /* fetch("https://api.api.ai/v1/query?v=20170828", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 546cfca2e8d14b48ace60e1d273fc40a",
        "Content-Type": "application/json;charset=UTF-8"
      },
      body: JSON.stringify({
        query: question,
        "lang": "en",
        "sessionId": this.props.sessionId
      })
    })
      .then(res => {
      return res.json()
    })
      .then(data => {
      const msg = data.result.fulfillment.speech || "eh?" // say something if the response is empty
      that.addMessage({
        id: Math.floor(Math.random()*1000000),
        userId: 2,
        content: msg
      });
    }) */
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
    }, 100);
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
