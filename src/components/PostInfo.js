import React, { Component } from 'react';
import Spinner from './Spinner';
import firebaseAxios from './firebaseAxios.js';
import { Link } from "@reach/router";
import * as u from './utils';
import '../styles/PostInfo.css';

class PostInfo extends Component {
  state = {
    loading: true,
    artists: []
  };

  // refactoring toggleArtistSaved in PostInfo.js, to use the same ‘orderBy/equalTo’ FB request logic we used in the componentDidMount - just for a single artist
  toggleArtistSaved = (artistTag, thumbURL) => {
    console.log(thumbURL, ' ~~~~~~~~~~~~~~~')
    const { artists } = this.state;
    const { postId } = this.props.post;
    const { token } = this.props;
    const updatedArtists = artists.filter(obj => obj.artist !== artistTag);
    const artistEncrypted = JSON.stringify(u.encryptToJSON(artistTag));
    firebaseAxios.get(`/artists.json?orderBy="artist"&equalTo=${artistEncrypted}&auth=${token}`).then(({ data }) => {
      JSON.stringify(data) == '{}'
        ? firebaseAxios.post(`/artists.json?auth=${token}`, { artist: u.encryptToJSON(artistTag), likedThumb: u.encryptToJSON(thumbURL), mostRecentPostId: postId }).then(() => {
          updatedArtists.push({ artist: artistTag, liked: true });
          this.setState({
            artists: updatedArtists
          });
        })
        : firebaseAxios.delete(`/artists/${Object.keys(data)[0]}.json?auth=${token}`).then(() => {
          updatedArtists.push({ artist: artistTag, liked: false });
          this.setState({
            artists: updatedArtists
          });
        })
    });
  };

  render() {
    const { loading, artists } = this.state;
    const { post, matchingOn, postTags, thumbURL, infoVisible } = this.props;
    const { artistTags, postId } = post;

    let visibilityClass;
    if (!infoVisible) visibilityClass = 'InfoDivHidden';

    let toRender;

    if (loading) {
      toRender =
        <div className="SpinnerContainer">
          <div className="SpinnerComponentContainer"><Spinner spinnerType='big' /></div>
        </div>
    };
    if (!loading) {
      toRender =
        <>
          <div className="topLeft">
            <span className="iconSpan">
              <i class="fas fa-palette icon"></i>
            </span>
          </div>
          <div className="bottomLeft">
            <span className="iconSpan">
              <i class="fas fa-tags icon"></i>
            </span>
          </div>
          <div className="topRight">
            <ul>
              {
                artistTags
                  ? artistTags.map(artistTag => {
                    let heartIconClass = 'far fa-heart icon';
                    let heartSpanClass = 'artistHeartNotLiked';
                    if (artists.filter(el => el.artist == artistTag)[0].liked == true) { ///
                      heartIconClass = 'fas fa-heart icon';
                      heartSpanClass = 'artistHeartLiked';
                    };

                    return (
                      <li>
                        <Link to={`/redirect/${artistTag}?type=all`}>
                          <span className="artistTag"><p>{artistTag}</p></span>
                        </Link>
                        <span className={heartSpanClass} onClick={() => this.toggleArtistSaved(artistTag, thumbURL)}><i class={heartIconClass} /></span>
                      </li>
                    )
                  })
                  : <li>
                    <span><p>(none)</p></span>
                  </li>
              }
            </ul>
          </div>
          <div className="bottomRight">
            <ul>
              {
                postTags.map(tag => {
                  let tagSpanClassName = "tagSpan"
                  if (matchingOn !== null) matchingOn.includes(tag) ? tagSpanClassName = "tagSpan bold" : tagSpanClassName = "tagSpan";
                  return (
                    <li>
                      <span className={tagSpanClassName}>{tag}</span>
                    </li>
                  )
                })
              }
            </ul>
          </div>
          <div className="postIdFooter">
            <li>id: {postId}</li>
          </div>
        </>
    }

    return (
      <div className="PostInfoContainer">
        <div className={`PostInfo ${visibilityClass}`}>
          {toRender}
        </div>
      </div>
    );
  };

  componentDidMount() {
    const { artistTags } = this.props.post;
    const { token } = this.props

    if (artistTags) {
      const artistReqPromises = artistTags.map(artist => { // make this dryer?
        const artistEncrypted = JSON.stringify(u.encryptToJSON(artist));
        return new Promise((resolve, reject) => {
          try {
            return firebaseAxios.get(`/artists.json?auth=${token}&orderBy="artist"&equalTo=${artistEncrypted}`).then(({ data }) => {
              return resolve({ artist: artist, artistEncrypted: artistEncrypted, getResult: data });
            })
          } catch (e) {
            console.log('🐊')
          };
        });
      });

      const artistsOnMount = [];
      Promise.all(artistReqPromises).then(arrayOfReqResponses => {
        arrayOfReqResponses.forEach(reqResponse => {
          const postArtist = { artist: reqResponse.artist };
          JSON.stringify(reqResponse.getResult) == '{}' ? postArtist.liked = false : postArtist.liked = true;
          artistsOnMount.push(postArtist);
        })
      }).then(() => {
        this.setState({
          artists: artistsOnMount,
          loading: false
        });
      })
    } else {
      this.setState({
        artists: [],
        loading: false
      });
    }
  };

};

export default PostInfo;






  // firebaseAxios.get(`/artists.json`).then(({ data }) => {
  //   let artistLikedOrNot = (artistTag, artistLikedOrNot) => false;
  //   const artistsOnMount = [];
  //   if (data) {
  //     const artistsOnFB = Object.entries(data).map(entry => u.decryptFromJSON(entry[1].artist))
  //     artistLikedOrNot = (artistTag, artistsOnFB) => artistsOnFB.includes(artistTag);
  //   };

  //   if (artistTags) {
  //     artistTags.forEach(artistTag => artistsOnMount.push({
  //       artist: artistTag,
  //       liked: artistLikedOrNot
  //     }));
  //     this.setState({
  //       artists: artistsOnMount,
  //       loading: false
  //     });
  //   } else {
  //     this.setState({
  //       artists: [],
  //       loading: false
  //     });
  //   }
  // });