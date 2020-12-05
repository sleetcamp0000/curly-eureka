import React, { Component } from 'react';
import './App.css';
import firebaseAxios from './firebaseAxios.js';
import * as api from './api';

class App extends Component {

  state = {
    latestId: null,
    posts: [],
    fixingImages: false,
    videoData: null
  };
  render() {
    const { posts, videoData } = this.state;

    if (!posts.length) {
      return null;
    } else {
      return (
        <>
          <div className="App" style={{ border: "1px solid darkblue", width: "75%", margin: "0 auto" }}>
            {posts.map(post => <img src={post.thumbURL} style={{ height: "20vh", width: "auto", margin: '5px 5px' }} />)}
          </div>
        </>
      );
    }


  };

  componentDidUpdate(prevProps, prevState) { };

  componentDidMount() {
    console.log('COMPONENT DID MOUNT!')
    firebaseAxios.get('/latestId.json')
      .then(({ data }) => {
        const newestIdLastSession = Object.values(data)[0];
        this.setState({
          newestIdLastSession: 4166059 // 4166059 // 70 pages @ c. 2500 posts per half day, 40 posts per results page
        }, () => console.log(this.state.latestId));
      })
      .then(() => {
        const { newestIdLastSession } = this.state;

        api.fetchPosts(newestIdLastSession);

        setInterval(() => {
          console.log('setInterval firing...')
          firebaseAxios.get('/sessionStorage.json')
            .then(({ data }) => {
              const posts = Object.values(data);
              const uniquePosts = Array.from(new Set(posts.map(a => a.postId))).map(postId => {
                return posts.find(a => a.postId === postId)
              }); // remove any duplicates as exist on Firebase DB.
              const click_me = () => {
                /*
    https://dev.to/marinamosti/removing-duplicates-in-an-array-of-objects-in-js-with-sets-3fep

    // turn {data} into an array of post objects, NOT INCL. their Firebase hash key prop.
    const posts = Object.values(data);
    // map over this array, creating an array of just the postIds.
    // create a new Set from this array of postIds. Set ONLY ALLOWS UNIQUE VALUES in it
    // Doing this removes duplicates, creating an array of only unique postIds
    // Create an interable Array from this set of unique postIds
    // Map over this iterable Array, creating an array of the post objects it can find in 'posts' 
    // that have postIds equal to the postIds in the Set Array.
    const uniquePosts = Array.from(new Set(posts.map(a => a.postId))).map(postId => {
    return posts.find(a => a.postId === postId)
    });
                 */
              }; // <--- HOW uniquePosts WORKS --->
              const postsSorted = [...uniquePosts].sort((a, b) => Number(a.postId) - Number(b.postId)); // sort posts by postId ascending without mutating
              this.setState({
                posts: postsSorted
              })
            }).catch(err => {
              console.log(err, ' <-- err in componentDidMount setTimeout');
            });
        }, 3000);

      });
  };

};

export default App;
