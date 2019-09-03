import React, {
  Component
} from 'react';
import {
  Redirect
} from "react-router-dom";
import 'whatwg-fetch';
import {
  getFromStorage,
  setInStorage,
  deleteFromStorage,
} from '../../utils/storage';

import M from "materialize-css";

import { w3cwebsocket as W3CWebSocket } from "websocket";

var host = '';

if (window.location.host.indexOf('localhost') != -1) {
  host = '127.0.0.1'
} else {
  host = window.location.host.split(':')[0]
}

const client = new W3CWebSocket('ws://' + host + ':8000');

class Messages extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    const obj = getFromStorage('the_main_app');

    if (obj && obj.token) {
      this.state = {
        isLoading: true,
        token: obj,
        messages: [],
        submitComment: '',
      }
    } else {
      this.state = {
        isLoading: true,
        token: '',
        messages: [],
        submitComment: '',
      }
    }

    this.onLogOut = this.onLogOut.bind(this);
  }

  componentWillMount() {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      window.location.reload();
    };
  }

  componentDidMount() {
    this._isMounted = true;
    M.AutoInit();
    
    const obj = getFromStorage('the_main_app');
    if (obj && obj.token) {
      const {
        token
      } = obj;
      fetch('/api/message/list')
      .then(res => res.json())
      .then(json => {
        if (this._isMounted) {
          if (json.success) {
            this.setState({
              token,
              isLoading: false,
              messages: json.message,
            });
          } else {
            this.setState({
              isLoading: false,
            });
          }
        }
      });
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

	_renderObject(){
    const {
      token,
      messages
    } = this.state
		return Object.entries(messages).map(([key, value], i) => {
			return (
				<div className="card blue darken-4" key={key}>
          <div className="card-content white-text">
            <span className="card-title"><b>{value.author}</b></span>
            <p>{value.message}</p>
          </div>
          <div className="card-action">
          {value.hasOwnProperty('comments') ? (
            Object.entries(value.comments).map(([key1, value1], j) => {
              return (
                <div className="card blue darken-3" key={key1}>
                  <div className="card-content white-text">
                    <span className="card-title card-title-font-change"><b>{value1.author}</b></span>
                    <p>{value1.comment}</p>
                  </div>
                  <div className="card-action">
                  {value1.hasOwnProperty('subComments') ? (
                    Object.entries(value1.subComments).map(([key2, value2], k) => {
                      return (
                        <div className="card blue darken-2" key={key2}>
                          <div className="card-content white-text">
                            <span className="card-title"><b>{value2.author}</b></span>
                            <p>{value2.subComment}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : ('')
                  }
                  <div className="card blue darken-2">
                    <div className="card-content white-text">
                      <div className="row">
                        <div className="input-field col s12">
                          <input id={key1+"_sub_comment"} type="text"></input>
                          <label htmlFor={key1+"_sub_comment"}>Sub Comment</label>
                          <span className="suffix">
                            <button id={key1} className="waves-effect waves-light pink btn-small" onClick={e => this.handleSubClick(e)}>Submit</button>
                          </span>
                        </div>
                        {/* <div className="input-field col s12">
                          <div className="center-align">
                            <button id={key1} className="waves-effect waves-light btn" onClick={e => this.handleSubClick(e)}>Submit</button>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )
            })
          ) : ('')
          }
          <div className="card blue darken-3">
              <div className="card-content white-text">
                <div className="row">
                  <div className="input-field col s12">
                    <input id={key+"_comment"} type="text"></input>
                    <label htmlFor={key+"_comment"}>Comment</label>
                    <span className="suffix">
                      <button id={key} className="waves-effect waves-light pink btn-small" onClick={e => this.handleClick(e)}>Submit</button>
                    </span>
                  </div>
                  {/* <div className="input-field col s12">
                    <div className="center-align">
                      <button id={key} className="waves-effect waves-light btn" onClick={e => this.handleClick(e)}>Submit</button>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
				</div>
			)
		})
  }

  someMethod() {
    // Force a render without state change...
    this.forceUpdate();
  }
  
  handleClick(e) {
    const obj = getFromStorage('user_id');
    const {
      userId
    } = obj;

    e.preventDefault()
    console.log(e.target.id);
    const messageId = e.target.id;
    const comment = document.getElementById(e.target.id + '_comment').value;
    if (comment) {
      console.log(comment);
      fetch('/api/comment/new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            messageId: messageId,
            comment: comment
          })
        })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            client.send('Server Change.');
            window.location.reload();
          } else {
            console.log(json);
            // window.location.reload();
          }
        });
    }
  }

  handleSubClick(e) {
    const obj = getFromStorage('user_id');
    const {
      userId
    } = obj;

    e.preventDefault()
    console.log(e.target.id);
    const commentId = e.target.id;
    const comment = document.getElementById(e.target.id + '_sub_comment').value;
    if (comment) {
      console.log(comment);
      fetch('/api/sub_comment/new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            commentId: commentId,
            sub_comment: comment
          })
        })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            client.send('Server Change.');
            window.location.reload();
          } else {
            console.log(json);
            // window.location.reload();
          }
        });
    }
  }

  handleClickMessage(e) {
    const obj = getFromStorage('user_id');
    const {
      userId
    } = obj;

    e.preventDefault()
    console.log(e.target.id);
    const message = document.getElementById('message').value;
    if (message) {
      fetch('/api/message/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          message: message
        })
      })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          client.send('Server Change.');
          window.location.reload();
        } else {
          console.log(json);
          window.location.reload();
        }
      });
    }
  }

  onTextboxSubmitComment(event) {
    this.setState({
      submitComment: event.target.value,
    });
  }

  onLogOut() {
    this.setState({
      isLoading: true,
    })
    const obj = getFromStorage('the_main_app');
    if (obj && obj.token) {
      const {
        token
      } = obj;
      fetch('/api/account/logout?token=' + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token: '',
              isLoading: false,
            });
            deleteFromStorage('the_main_app');
            client.close();
          } else {
            this.setState({
              isLoading: false,
            });
          }
        });
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }
  render() {

    const {
      token,
      messages
    } = this.state

    if (!token) {
      return <Redirect to = "/" />
    }

    if (!messages) {
      return ( 
        <div>
          <p>No Messages</p>
          <button onClick={this.onLogOut}>Log Out</button>
        </div>
        )
    }


    return(
      <div className="row">
        <div className="col s2 offset-s10">
          <button className="waves-effect waves-light btn" onClick={this.onLogOut}>Log Out</button>
        </div>
        <div className="col s12">
        {
          this._renderObject()
        }
        </div>
        <div className="col s12">
          <div className="input-field col s12">
            <input id="message" type="text"></input>
            <label htmlFor="message">Message</label>
          </div>
          <div className="input-field col s12">
            <div className="center-align">
              <button className="waves-effect waves-light btn" onClick={e => this.handleClickMessage(e)}>Submit</button>
            </div>
          </div>
        </div>
      </div>
      )
  }
}

export default Messages;
