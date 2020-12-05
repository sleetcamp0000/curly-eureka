import React, { Component } from 'react';
import { Router } from "@reach/router";
import './styles/App.css';
import ResultsPage from "./components/ResultsPage";
import PostPage from "./components/PostPage";
import firebaseAxios from './components/firebaseAxios.js';
import * as api from './components/api';

class App extends Component {
  state = {
    postBeingViewed: null,
    latestId: null,
    posts: [],
    resultsPage: null
  };

  // passPost = post => {
  //   console.log('passingPost!')
  //   // this.setState({
  //   //   currentPost: post
  //   // });
  // };

  fetchId = (postId) => {
    this.setState({
      postBeingViewed: postId
    })
  }

  handleNavClick = direction => {
    const { resultsPage } = this.state;
    if (direction === 'left') {
      this.setState({
        resultsPage: resultsPage - 1
      });
    } else {
      this.setState({
        resultsPage: resultsPage + 1
      });
    }
  }

  render() {
    const { posts, postBeingViewed } = this.state;
    return (
      <div className="App">
        <Router>
          <ResultsPage path="/" fetchId={this.fetchId} posts={posts} handleNavClick={this.handleNavClick} />
          <PostPage path="/posts/:postId" post={posts.filter(el => el.postId === postBeingViewed)[0]} />
        </Router>
      </div>
    );
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.resultsPage !== this.state.resultsPage) {
      api.fetchPageImages(this.state.resultsPage).then(res => {
        this.setState({
          posts: res.data.postsContentArr
        })
      })
    }
  };

  componentDidMount() {
    firebaseAxios.get('/latestId.json')
      .then(({ data }) => {
        const newestIdLastSession = Object.values(data)[0];
        this.setState({
          newestIdLastSession: 4166059 // 4166059 // 70 pages @ c. 2500 posts per half day, 40 posts per results page
        }, () => console.log(this.state.latestId));
      })
      .then(() => { ////////

        const { newestIdLastSession } = this.state;

        // api.fetchThumbs(newestIdLastSession); // newestIdLastSession

        setTimeout(() => {
          api.fetchPageImages(1).then(res => {
            console.log(res.headers)
            this.setState({
              posts: res.data.postsContentArr,
              resultsPage: 1
            })
          })
        }, 5000)


        // const timerFunc = () => {
        //   console.log('setInterval firing...')
        //   firebaseAxios.get('/sessionStorage.json')
        //     .then(({ data }) => {
        //       console.log(data.page_1 !== null, ' <--')
        //       if (data.page_1 !== null) {
        //         console.log('clearing interval!');
        //         timerStop();
        //         api.fetchPageImages(1).then(res => {
        //           console.log(res, ' <-- res on resultsPage')
        //         })
        //       }
        //     }).catch(err => {
        //       console.log(err, ' <-- err in componentDidMount setTimeout');
        //     });
        // }

        // const timer = setInterval(timerFunc, 1000);

        // const timerStop = () => {
        //   clearInterval(timer);
        // }

      }); ////////
  };

}

export default App;