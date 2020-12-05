import React, { Component } from 'react';
import '../styles/ResultsPage.css';
import Result from './Result';
import Spinner from './Spinner';
import PostViewer from './PostViewer';

class ResultsViewer extends Component {

  state = {
    postBeingViewed: false,
    postId: null,
    postData: null,
    loading: true
  };

  openPostViewer = (postId, postData) => {
    this.setState({
      postBeingViewed: true,
      postId: postId,
      postData: postData
    })
  };

  closePostViewer = () => {
    this.setState({
      postBeingViewed: false,
      postId: null,
      postData: null
    })
  }

  changePostId = direction => {
    const { posts } = this.props;
    const currentIndex = posts.map(obj => obj.postId).indexOf(this.state.postId);
    if (direction == 'left') {
      if (currentIndex - 1 > -1) {
        this.setState({
          postId: posts[currentIndex - 1].postId
        })
      }
    } else if (direction == 'right') {
      if (currentIndex + 1 <= posts.length - 1) {
        this.setState({
          postId: posts[currentIndex + 1].postId
        })
      }
    }
  };

  render() {
    const { postBeingViewed, postId, postData } = this.state;
    const { posts, loading, token } = this.props;
    const { filterBy, typedFilter, tempDisalloweds } = this.props.filtersBundled;
    const postsViaTypedFilter = posts.filter(obj => obj.postTags.filter(s => s.includes(typedFilter)).length !== 0);
    const postsViaTempDisalloweds = postsViaTypedFilter.filter(el => el.postTags.every(tag => tempDisalloweds.indexOf(tag) == -1));
    const postsToDisplay = postsViaTempDisalloweds.filter(post => filterBy.every(filterTag => post.postTags.includes(filterTag)));

    let pair = [];
    const columnsOfPosts = postsToDisplay.reduce((acc, post, i) => {
      if (i % 2 === 0) {
        if (i !== 0) acc.push(pair);
        pair = [];
        pair.push(<span className="thumbSpan" onClick={() => this.openPostViewer(post.postId, post)}><Result post={post} index={i}/></span>);
      } else {
        pair.push(<span className="thumbSpan" onClick={() => this.openPostViewer(post.postId, post)}><Result post={post} index={i}/></span>);
      };
      if (i === postsToDisplay.length - 1) acc.push(pair);
      return acc;
    }, []);


    if (!posts.length && loading) {
      return <div className="SpinnerComponentContainer"><Spinner spinnerType='big'/></div>;
    } else if (!posts.length && !loading) {
      return (
        <div className="SpinnerComponentContainer">
          <div className="nothingToShowMessage">
        <i class="far fa-clock"></i>
          <h1>No posts to show. Check back later! </h1>
          </div>
        </div>
      )
    } else {
      return (
        <div className="ResultsViewerContainer">

        <div className="ResultsViewer">
          {postBeingViewed ? <PostViewer closePostViewer={this.closePostViewer} changePostId={this.changePostId} postId={postId} matchingOn={posts.filter(post => post.postId === postId)[0].matchingOn} postData={postData} posts={posts} token={token} /> : null}
          <div class="row">
            {columnsOfPosts.map(pairOfPosts => <div className="col-md-6 d-flex justify-content-start" id="xylo">{pairOfPosts[0]}{pairOfPosts[1]}</div>)}
          </div>
        </div>

        </div>

      );
    }

  };

  /*
  
       <div class="row greenrow">

          <div class="col-md-6">
            <span></span>
            <span></span>
          </div>

          <div class="col-md-6">
            <span></span>
            <span></span>
          </div>

        </div>
  
  */

  // componentDidUpdate(prevProps, prevState) {
  //   console.log('ResultsViewer UPDATED!')
  //   if (this.state.postBeingViewed == false && prevState.postBeingViewed == true) {
  //     if (this.props.likesChecker) {
  //       this.props.likesChecker();
  //     }
  //   }

  // if (this.props !== prevProps) {
  //   console.log('ResultsViewer NOW RECEIVING CHANGED SET OF POSTS')
  // } 
  // const { posts } = this.props;
  // const { postId } = this.state;

  //   // if (!posts.filter(post => post.postId === postId)[0]) {
  //   //   this.setState({
  //   //     postBeingViewed: false,
  //   //     postId: null,
  //   //     postData: null
  //   //   })
  //   // }
  // }

  // }


};

export default ResultsViewer;


