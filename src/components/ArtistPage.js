import React, { Component } from 'react';
import firebaseAxios from './firebaseAxios';
import ResultsViewer from './ResultsViewer';
import Spinner from './Spinner';
import * as u from './utils';
import * as api from './api';
import '../styles/ArtistPage.css';

class ArtistPage extends Component {
  state = {
    artistPosts: [],
    artistPagesLoaded: 0,
    lastPageReached: false,
    loading: true,
    error: false
  };

  moreButtonHandler = () => {
    const { artistPagesLoaded } = this.state;
    const { artist_name, token } = this.props;

    this.setState({
      loading: true
    }, () => {
      u.fetchDecryptedPageOfPosts(`/artistThumbs/page_${artistPagesLoaded + 1}.json`, this.state.artistPosts, token)
        .then(({ isLastPage, allPostsSorted, reqError }) => {
          if (!reqError) {
            this.setState({ artistPosts: allPostsSorted, artistPagesLoaded: artistPagesLoaded + 1, lastPageReached: isLastPage, loading: false })
          } else { this.setState({ loading: false, error: true }) };
        }).catch(err => { console.log('🐙 🐙'); this.setState({ loading: false, error: true }); });
    })

  };

  render() {
    const { artistPosts, loading, lastPageReached } = this.state;
    const { filtersBundled, token } = this.props;
    return (
      <div className="ArtistPage">
        <ResultsViewer posts={artistPosts} filtersBundled={filtersBundled} loading={loading} token={token} />
        {lastPageReached
          ? null
          : (
            artistPosts.length > 0 ?
              <div className="MoreStrip">
                {loading
                    ? <Spinner spinnerType='small' />
                    : <span id="button" onClick={this.moreButtonHandler}>Load More</span>
                }
              </div>
            : null
            )
        }
      </div>
    )
  }

  componentDidUpdate() {
    console.log('ArtistPage UPDATED!')
  }

  componentDidMount() {
    const { artist_name, token } = this.props;
    const params = new URLSearchParams(this.props.location.search);
    const typeParam = params.get('type');
    const mostRecentId = params.get('mostRecentId')

    api.fetchArtistThumbs(artist_name, mostRecentId, token).then(res => {
      console.log(res.data.msg)
      console.log('time to get page 1')

      u.fetchDecryptedPageOfPosts(`/artistThumbs/page_1.json`, this.state.artistPosts, token)
        .then(({ isLastPage, allPostsSorted, reqError }) => {
          if (!reqError) {
            this.setState({ artistPosts: allPostsSorted, artistPagesLoaded: 1, lastPageReached: isLastPage, loading: false })

            if (typeParam == 'new') { // Got 1st page of thumbs back from FB, time to update artist`s mostRecentPostId
              const artistEncrypted = JSON.stringify(u.encryptToJSON(artist_name));
              firebaseAxios.get(`/artists.json?auth=${token}&orderBy="artist"&equalTo=${artistEncrypted}`).then(({ data }) => {
                if (JSON.stringify(data) !== '{}') firebaseAxios.patch(`/artists/${Object.keys(data)[0]}.json?auth=${token}`, {
                  "mostRecentPostId": allPostsSorted[0].postId
                })
              });
            };

          } else { this.setState({ loading: false, error: true }) };
        }).catch(err => { console.log('🐙 '); this.setState({ loading: false, error: true }); });

    })

  };

};

export default ArtistPage;