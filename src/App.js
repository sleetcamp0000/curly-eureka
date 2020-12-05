import React, { Component } from 'react';
import { Router, Redirect } from "@reach/router";
import Auth from "./Auth";
import Site from "./Site";
import './styles/App.css';

class App extends Component {

  state = {
    loggedIn: false,
    token: null,
    userId: null
  }

  updateLoggedIn = (data) => {
    const { idToken, localId, expiresIn } = data; // idToken is the token, localId is the user id
    // upon successful login, could call a setTimeout function using the expiresIn value on {data}, that then causes highest state props of 'loggedIn'
    // to equal false, token (idToken) to equal null and userId (localId) to equal null (for automatic logout after one hour) - auth will expire on FB after 3600
    // OR! could make a manual 'log-out' button that does the same, immediately.
    this.setState({
      loggedIn: true,
      token: idToken,
      userId: localId
    }, () => {
      setTimeout(() => {
        this.setState({
          loggedIn: false,
          token: null,
          userId: null
        })
      }, expiresIn * 1000)
    })
  };

  handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.setState({
      loggedIn: false,
      token: null,
      userId: null
    })
  }

  render() {
    const { loggedIn } = this.state;
    return (
      <div className="App">
        {loggedIn
          ? <Site path="/" token={this.state.token} handleLogout={this.handleLogout} />
          : <Auth path="/" updateLoggedIn={this.updateLoggedIn} />}
      </div >
    );
  };

  componentDidMount() {
    const token = localStorage.getItem('token');
    const persistentUserId = localStorage.getItem('userId');

    console.log(token);
    console.log(persistentUserId);
    // localStorage.removeItem('token');
    console.log(localStorage)

    if (!token) {
      this.handleLogout()
    } else {
      const expirationDate = new Date(localStorage.getItem('expirationDate'));
      const persistentUserId = localStorage.getItem('userId');
      const timeRemaining = ((expirationDate.getTime() - new Date().getTime()));
      console.log('timeRemaining: ' + timeRemaining)
      if (expirationDate <= new Date()) { // HAD a valid token, but it has since expired
        this.handleLogout()
      } else { // HAD a valid token, AND the current time is still less than the expirationDate
        this.setState({
          loggedIn: true,
          token: token,
          userId: persistentUserId
        },
          // () => {
          //   setTimeout(() => {
          //     this.setState({
          //       loggedIn: false,
          //       token: null,
          //       userId: null
          //     })
          //   }, (expirationDate.getTime() - new Date().getTime()))
          // }
        )
      }
    };

  }

}

export default App;
