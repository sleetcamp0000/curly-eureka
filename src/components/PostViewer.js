import React, { Component } from 'react';
import '../styles/PostViewer.css';
import Spinner from './Spinner';
import PostInfo from './PostInfo';
import * as api from './api';
import firebaseAxios from './firebaseAxios';
import * as u from './utils';

class PostViewer extends Component {
  state = {
    loading: true,
    post: null,
    infoVisible: false,
    liked: false,
    canGoLeft: true,
    canGoRight: true
  };

  toggleInfo = () => {
    const { loading } = this.state;
    if (loading == false) {
      this.setState(prevState => {
        return {
          infoVisible: !prevState.infoVisible
        }
      });
    }
  };

  toggleLike = (postId) => {
    const { loading } = this.state;
    const { token } = this.props;
    console.log('toggleLike clicked...')
    if (loading == false) {
      console.log('and reaches here!')
      const { postData } = this.props;
      const encryptedPostObj = {
        matchingOn: postData.matchingOn ? postData.matchingOn.map(el => u.encryptToJSON(el)) : null,
        postId: postData.postId,
        postTags: postData.postTags.map(el => u.encryptToJSON(el)),
        thumbURL: u.encryptToJSON(postData.thumbURL),
        timestamp: Date.now()
      };
      // firebaseAxios.get(`/artists.json?auth=${token}&orderBy="artist"&equalTo=${artistEncrypted}`)
      const queryParams = `?orderBy="postId"&equalTo="${postId}"&auth=${token}`;
      firebaseAxios.get(`/likes.json` + queryParams).then(({ data }) => {
        console.log(data);
        if (JSON.stringify(data) === '{}') {
          console.log('Doesnt exist on /likes!')
          firebaseAxios.post(`/likes.json?auth=${token}`, encryptedPostObj).then(() => {
            this.setState({
              liked: true
            })
          })
        } else {
          const keyToDelete = Object.keys(data)[0];
          firebaseAxios.delete(`/likes/${keyToDelete}.json?auth=${token}`).then(() => {
            this.setState({
              liked: false
            });
          })
        }
      })
    };
  };

  render() {
    const { post, infoVisible, liked, canGoLeft, canGoRight } = this.state;
    const { postData, matchingOn, closePostViewer, changePostId, token } = this.props;
    let visibilityClass, leftChevronClass, rightChevronClass;
    let heartIconClass = 'far fa-heart icon';
    let heartSpanClass = 'artistHeartNotLiked';
    if (liked) {
      heartIconClass = 'fas fa-heart icon';
      heartSpanClass = 'artistHeartLiked';
    };
    // typedFilter.length > 0 ? addButtonClass = 'clickable' : addButtonClass = 'unclickable';
    if (!canGoLeft) leftChevronClass = 'chevronUnclickable';
    if (!canGoRight) rightChevronClass = 'chevronUnclickable';

    return (
      <div className="PostViewer">

        <div className="ToolbarContainer">

          <div className="container BackButtonContainer">
            <span onClick={closePostViewer}>
              <i class="fas fa-arrow-alt-circle-left"></i>
            </span>
          </div>

          <div className="container LeftButtonContainer">
            <span onClick={() => changePostId('left')} className={leftChevronClass}>
              <i class="fas fa-chevron-left"></i>
            </span>
          </div>

          <div className="container LikeButtonContainer">
            <span className={heartSpanClass} onClick={() => post ? this.toggleLike(post.postId) : null}>
              <i class={heartIconClass}></i>
            </span>
          </div>

          <div className="container RightButtonContainer">
            <span onClick={() => changePostId('right')} className={rightChevronClass}>
              <i class="fas fa-chevron-right"></i>
            </span>
          </div>

          <div className="container InfoButtonContainer">
            <span onClick={this.toggleInfo}>
              <i class="fas fa-info-circle"></i>
            </span>
          </div>
        </div>

        <div className={`InfoDivContainer`}>
          {
            this.state.loading
              ? null
              : <PostInfo post={post} token={token} thumbURL={postData.thumbURL} postTags={postData.postTags} matchingOn={matchingOn || null} infoVisible={infoVisible} />
          }
        </div>

        <div className="ContentContainer">
          {
            this.state.loading
              ? <div className="SpinnerComponentContainer"><Spinner spinnerType='big' /></div>
              :
              // <div className="Content">
              // {
              (post.type == 'image'
                ? <img src={`data:image/${post.fileExt};base64,${post.fileAsBase64}`} className="PostViewerImage" />
                : <video className="PostViewerVideo" controls loop><source src={`data:video/mp4;base64,${post.fileAsBase64}`} type="video/mp4"></source></video>
              )
            // }
            // {/* </div> */}
          }
        </div>

      </div>
    )
  };

  componentDidUpdate(prevProps, prevState) {
    const { postId, posts, token } = this.props;
    if (this.props.postId !== this.state.post.postId && this.state.loading !== true) {
      this.setState({
        loading: true
      }, () => {
        api.fetchPost(postId, token).then(({ data }) => { // fetch postdata from BE with postId, see if post is liked on FB
          const queryParams = `&orderBy="postId"&equalTo="${postId}"`;
          const canGoLeft = posts.map(obj => obj.postId).indexOf(postId) - 1 > -1;
          const canGoRight = posts.map(obj => obj.postId).indexOf(postId) + 1 <= posts.length - 1;
          firebaseAxios.get(`/likes.json?auth=${token}` + queryParams).then(res => {
            this.setState({ post: data.scrapedPost, loading: false, liked: JSON.stringify(res.data) !== '{}', canGoLeft, canGoRight });
          });
        })
      })
    }
    // }
  }

  componentDidMount() {
    const { postId, posts, token } = this.props;
    console.log('PostViewer did mount with id ' + postId)
    api.fetchPost(postId, token).then(({ data }) => {
      const queryParams = `&orderBy="postId"&equalTo="${postId}"`;
      const canGoLeft = posts.map(obj => obj.postId).indexOf(postId) - 1 > -1;
      const canGoRight = posts.map(obj => obj.postId).indexOf(postId) + 1 <= posts.length - 1;
      firebaseAxios.get(`/likes.json?auth=${token}` + queryParams).then(res => {
        this.setState({ post: data.scrapedPost, loading: false, liked: JSON.stringify(res.data) !== '{}', canGoLeft, canGoRight });
      });
    })
  };

};

export default PostViewer;

// <img src={`data:image/${post.fileExt};base64,${post.fileAsBase64}`} className="PostViewerImage" />
// <video width="320" height="240" controls><source src={testvid} type="video/mp4"></source></video>
// <video width="320" height="240" controls><source src={`data:video/mp4;base64,${this.state.videoData}`} type="video/mp4"></source></video>