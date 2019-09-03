import React, { Component } from 'react';
import 'whatwg-fetch';
import {
  getFromStorage,
  setInStorage,
} from '../../utils/storage';
import M from "materialize-css";
import { Redirect } from "react-router-dom";

class Home extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      token: '',
      signInError: '',
      signInEmail:'',
      signInPassword: '',
      redirect: false,
      userId: '',
    }

    this.onTextboxChangeSignInEmail = this.onTextboxChangeSignInEmail.bind(this);
    this.onTextboxChangeSignInPassword = this.onTextboxChangeSignInPassword.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
    this.onLogOut = this.onLogOut.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    M.AutoInit();
    const obj = getFromStorage('the_main_app');
    if (obj && obj.token) {
      const {
        token
      } = obj;
      fetch('/api/account/verify?token=' + token)
        .then(res => res.json())
        .then(json => {
          if (this._isMounted) {
            if (json.success) {
              this.setState({
                token,
                isLoading: false,
                redirect: true
              });
            } else {
              this.setState({
                isLoading: false,
              });
            }
          }
        });
    } else {
      if (this._isMounted) {
        this.setState({
          isLoading: false,
        });
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  setRedirect = () => {
    this.setState({
      redirect: true
    })
  }
  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to='/messages' />
    }
  }

  onTextboxChangeSignInEmail(event) {
    this.setState({
      signInEmail: event.target.value,
    });
  }

  onTextboxChangeSignInPassword(event) {
    this.setState({
      signInPassword: event.target.value,
    });
  }

  onSignIn() {
    const {
      signInEmail,
      signInPassword
    } = this.state;

    fetch('/api/account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: signInEmail,
          password: signInPassword
        })
      })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setInStorage('the_main_app', { token: json.token });
          setInStorage('user_id', { userId: json.userId });
          this.setState({
            signInError: '',
            isLoading: false,
            signInEmail: '',
            signInPassword: '',
            token: json.token,
            redirect: true,
            userId: json.userId,
          })
        } else {
          this.setState({
            signInError: json.message,
            isLoading: false
          })
        }
      });
  }

  onLogOut() {
    this.setState({
      isLoading: true,
    })
    const obj = getFromStorage('the_main_app');
    if (obj && obj.token) {
      const {token} = obj;
      fetch('/api/account/logout?token=' + token)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          this.setState({
            token: '',
            isLoading: false,
          });
        } else {
          this.setState({
            isLoading:false,
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
      isLoading,
      token,
      signInError,
      signInEmail,
      signInPassword,
    } = this.state

    if (isLoading) {
      return (<div><p>Loading...</p></div>);
    }
      return(
      <div className="row">
        {
          (signInError) ? (
            <p>{signInError}</p>
          ) : (null)
        }
        {this.renderRedirect()}
        <div className="col s6 offset-s3">
          <div className="input-field col s12">
            <input id="email" type="email" value={signInEmail} onChange={this.onTextboxChangeSignInEmail}></input>
            <label htmlFor="email">Email</label>
          </div>
          <div className="input-field col s12">
            <input id="password" type="password" value={signInPassword} onChange={this.onTextboxChangeSignInPassword}></input>
            <label htmlFor="password">Password</label>
          </div>
          <div className="input-field col s12">
            <div className="center-align">
              <button className="waves-effect waves-light btn" onClick={this.onSignIn}>Sign In</button>
            </div>
          </div>
        </div>
      </div>)
  }
}

export default Home;
