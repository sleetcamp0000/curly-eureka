import React, { Component } from 'react';
import './App.css';
import firebaseAxios from './firebaseAxios.js';
import * as api from './api';

class App extends Component {

  state = {
    latestId: null,
    posts: [],
  };

  render() {
    return (
      <div className="App">
      </div>
    );
  };

  componentDidUpdate(prevProps, prevState) { };

  componentDidMount() {
    firebaseAxios.get('/latestId.json')
      .then(({ data }) => {
        const retrievedLatestId = Object.values(data)[0];
        this.setState({
          latestId: 4166059
        });
      })
      .then(() => {
        const { latestId } = this.state;

        const recursivelyGetPosts = (func, id) => {
          console.log('reaching recursivelyGetPosts', id)
          return func(id).then(({ response }) => {
            console.log('response.status: ', response.status)
            if (response.status !== 404) {
              return recursivelyGetPosts(func, id + 1)
            } else {
              console.log('[ HERE ]')
              return;
            };

          });
        };

        recursivelyGetPosts(api.getLatestPosts, latestId);
      });
  };

};

export default App;
