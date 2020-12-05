import React, { Component } from 'react';
import './App.css';
import firebaseAxios from './components/firebaseAxios.js';
import * as api from './components/api';

class App extends Component {

  state = {
    latestId: null,
    posts: [],
    fixingImages: false,
    videoData: null
  };

  buttonHandler = () => {
    console.log('buttonHandler')
    firebaseAxios.get('/videoData/4188994.json').then(({ data }) => {
      const fetchedChunks = [];
      for (let key in data) {
        fetchedChunks.push({ ...data[key] })
      }
      const sortedChunks = fetchedChunks.sort((a, b) => (a.chunkId > b.chunkId) ? 1 : ((b.chunkId > a.chunkId) ? -1 : 0));
      console.log(sortedChunks)
      const concattedString = sortedChunks.reduce((acc, el) => {
        return acc.concat(el.chunkString)
      }, '');
      // const encodedString = new Buffer.from(concattedString, 'base64');
      console.log(concattedString.length)
      console.log(concattedString[0]);
      console.log(concattedString[concattedString.length - 1]);

      // const encodedString = window.btoa(concattedString);
      // console.log(typeof encodedString)
      // console.log(encodedString.length)

      this.setState({
        videoData: concattedString
      });

    })
  };

  render() {
    const { posts, videoData } = this.state;

    if (!posts.length) {
      return null;
    } else {
      return (
        <>
          <div className="App" style={{ border: "1px solid darkblue", width: "75%", margin: "0 auto" }}>
            <button onClick={this.buttonHandler}>CLICK</button>
            {/* <video autoplay controls src={`data:video/mp4;base64,${testVid}`}>
            </video> */}
            {this.state.videoData !== null ?
              <video width="320" height="240" controls>
                <source src={`data:video/mp4;base64,${this.state.videoData}`} type="video/mp4"></source>
              </video>
              : null}

            {/* {posts.map(post => {
              // const image = new Image();
              // image.src = `data:image/jpeg;base64,${post.imgAsBase64}`
              return (
                <div>
                  <img src={`data:image/${post.fileExt};base64,${post.fileAsBase64}`} style={{ height: "100vh", width: "auto" }} />
                </div>
              )
            })} */}

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

        // api.fetchPosts(newestIdLastSession);

        setTimeout(() => {
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
