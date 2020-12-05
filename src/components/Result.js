import React from 'react';
import '../styles/Result.css';

const Result = props => {
  const { post, index } = props;
  let resultClass = 'imageResult';
  if (post.postTags.includes('webm')) resultClass = 'videoResult'
  let fadeDelay = 50 * (index + 1);
  return (
    <img src={post.thumbURL} className={resultClass} alt={post.postId} style={{ animation: `fadein 500ms ease-in-out ` }}/>
    // ${fadeDelay}ms both
  )
};

export default Result;