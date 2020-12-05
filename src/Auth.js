import React, { Component } from 'react';
import axios from 'axios';
// import { apiKey } from './firebaseConfig';
import Spinner from './components/Spinner';
import './styles/Auth.css';

class Auth extends Component {

  state = {
    email: {},
    password: {},
    loginPending: false,
    error: null
  }

  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  handleClick = () => {
    const { email, password } = this.state;
    const { updateLoggedIn } = this.props;
    const authData = { email, password, returnSecureToken: true };

    this.setState({
      loginPending: true,
      error: null
    }, () => {
      axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.REACT_APP_API_KEY}`, authData)
        .then(({ data }) => {
          console.log(data, ' <--- data in .then of Auth')
          const expirationDate = new Date(new Date().getTime() + (data.expiresIn * 1000))
          localStorage.setItem('token', data.idToken);
          localStorage.setItem('expirationDate', expirationDate);
          updateLoggedIn(data);
        })
        .catch(err => {
          console.log(err);
          this.setState({
            loginPending: false,
            error: err.toString()
          })
        })
    })

  };

  render() {
    const { loginPending, error } = this.state;
    return (
      <div className="Auth">
        {!loginPending ?
          <form onSubmit={(event) => event.preventDefault()}>
            <div><input className="emailInput" type="text" id="email" onChange={(event) => this.handleChange(event)}></input></div>
            <div className="passwordInput"><input type="password" id="password" onChange={(event) => this.handleChange(event)}></input></div>
            <div className="submitButtonContainer"><button className="authSubmitButton" onClick={this.handleClick}>SUBMIT</button></div>
            {error ? <h3 style={{ color: "red" }}>{error}</h3> : null}
          </form>
          : <Spinner spinnerType="big" />
        }
      </div>
    )
  }

}

export default Auth;

