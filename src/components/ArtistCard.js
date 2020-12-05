import React, { Component } from 'react';
import { Link } from "@reach/router";
import '../styles/ArtistCard.css';

const ArtistCard = ({ artist, likedThumb, newPostsSinceLastPerused, mostRecentPostId }) => {
  
  let newPostsLinkClass;
  newPostsSinceLastPerused ? newPostsLinkClass = 'klickable' : newPostsLinkClass = 'unklickable';

  const generateFontSize = () => {
    let num, max, limit, multiplyer;
    if (window.screen.width < 768) { max = 30; limit = 8; multiplyer = 1 - ((0.07 * (artist.length - limit)) * 0.4); } 
    else { max = 40; limit = 11; multiplyer = 0.8; }
    const smallerIfLonger = (max - (artist.length - limit)) * multiplyer;
    artist.length < limit ? num = max : num = smallerIfLonger;
    return num;
  };

  // more letters over the limit they are, the smaller you want the multiplyer to be

  return (
    <div className="ArtistCard">

  <div className="Left">
      <img src={likedThumb} className="likedThumbImg" />
  </div>

  <div className="RightTop">
    <div className="ArtistName" style={{fontSize: `${generateFontSize()}px`}}>
      {`${artist} `}
    </div>
       {/*
      {newPostsSinceLastPerused ? <i class="fas fa-certificate newPostsIcon"> NEW!</i> : null} */}
  </div>

  <div className="RightBottom">

    <div className="AllContainer">
      <span className="link">
        <Link to={`/artist/${artist}?type=all`} id="link">
          All
        </Link>
      </span>
    </div>

    <div className="NewContainer">
      <span className={`link ${newPostsLinkClass}`}>
        <Link to={`/artist/${artist}?type=new&mostRecentId=${mostRecentPostId}`} id="link">
          New
          {<span>{newPostsSinceLastPerused ? <i class="fas fa-exclamation newPostsIcon"></i> : null}</span>}
        </Link>
      </span>
    </div>
    
  </div>









    </div >
  )
}

export default ArtistCard;



// newPostsSinceLastPerused