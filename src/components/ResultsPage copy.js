import React, { Component } from 'react';
import '../styles/ResultsPage.css';
import Result from './Result';
import Spinner from './Spinner';
import PostViewer from './PostViewer';

class ResultsPage extends Component {

  state = {
    postBeingViewed: false,
    postId: null,
    postData: null
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

  render() {
    const { postBeingViewed, postId, postData } = this.state;
    const { posts, handleNavClick, filterBy, typedFilter } = this.props;
    const postsViaTypedFilter = posts.filter(obj => obj.postTags.filter(s => s.includes(typedFilter)).length !== 0);
    if (!posts.length) {
      return <div className="SpinnerComponentContainer"><Spinner spinnerType='big'/></div>;
    } else {
      return (
        <>
          <div className="ResultsPage">
            {postBeingViewed ? <PostViewer closePostViewer={this.closePostViewer} postId={postId} matchingOn={posts.filter(post => post.postId === postId)[0].matchingOn} postData={postData} /> : null}
            {
              postsViaTypedFilter.filter(post => filterBy.every(filterTag => post.postTags.includes(filterTag))).map(post => <span onClick={() => this.openPostViewer(post.postId, post)}><Result post={post} /></span>)
            }
          </div>
        </>
      );
    }


  };


};

export default ResultsPage;


