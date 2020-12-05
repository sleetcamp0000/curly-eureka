import React, { Component } from 'react';
import firebaseAxios from './firebaseAxios.js';
import Spinner from './Spinner';

class PostPage extends Component {
  state = {
    loading: true,
    element: null
  };

  render() {
    const { post } = this.props;
    return (
      <img src={`data:image/${post.fileExt};base64,${post.fileAsBase64}`} style={{ height: "100vh", width: "auto" }} />
    )
  }

  componentDidUpdate() {
    console.log('PostPage did update');
  };

  componentDidMount() {
    console.log('PostPage did mount');
  };

  // <img src={`data:image/${post.fileExt};base64,${post.fileAsBase64}`} style={{ height: "100vh", width: "auto" }} />


};

export default PostPage;