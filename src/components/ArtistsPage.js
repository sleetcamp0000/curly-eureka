import React, { Component } from 'react';
import firebaseAxios from './firebaseAxios';
import ResultsViewer from './ResultsViewer';
import ArtistCard from './ArtistCard';
import Spinner from './Spinner';
import { Link } from "@reach/router";
import * as u from './utils';
import * as api from './api';
import '../styles/ArtistsPage.css';

class ArtistsPage extends Component {
  state = {
    artists: [],
    loading: true,
    error: false
  };

  likesChecker = () => {
    console.log('checking FB likes...')
    const { token } = this.props;
    let startAt = 0;
    firebaseAxios.get(`/likes.json?auth=${token}&orderBy="timestamp"&startAt=${startAt}&limitToFirst=40`).then(({ data }) => {
      data
        ? this.setState({ likedPosts: u.decryptPosts(data), loading: false })
        : this.setState({ likedPosts: [], loading: false });
    });

  }

  render() {
    const { artists, loading, error } = this.state;
    return (
      <div className="ArtistsPage">
        {
          !loading ? (!error ?
            artists.map(artistObj => {
              return (
                <ArtistCard artist={artistObj.artist} likedThumb={artistObj.likedThumb} newPostsSinceLastPerused={artistObj.newPostsSinceLastPerused} mostRecentPostId={artistObj.mostRecentPostId} />
              )
            })
            : <h1>Error :(</h1>)
            : <div className="SpinnerComponentContainer"><Spinner spinnerType='big' /></div>
        }
        <div className="artistsPageBottomBuffer" />
      </div>
    )
  }

  componentDidUpdate() {
    console.log('ArtistsPage UPDATED!')
  }

  componentDidMount() {
    const { token } = this.props;
    firebaseAxios.get(`/artists.json?auth=${token}`).then(({ data }) => {
      if (data) {

        const decryptedArtists = Object.values(data).map(artistObj => {
          return { artist: u.decryptFromJSON(artistObj.artist), likedThumb: u.decryptFromJSON(artistObj.likedThumb), mostRecentPostId: artistObj.mostRecentPostId }
        });

        this.setState({
          artists: decryptedArtists.sort((a, b) => a.artist.localeCompare(b.artist)),
        })

        decryptedArtists.forEach(artistObj => { // check if any new posts for each artist
          api.fetchArtistMostRecentId(artistObj.artist, token).then((res) => {
            if (res) {
              const data2 = res.data;
              const artistToUpdate = this.state.artists.find(el => el.artist == artistObj.artist);
              artistToUpdate.newPostsSinceLastPerused = data2.mostRecentPostId !== artistObj.mostRecentPostId
              const artistsMinusThisOne = this.state.artists.filter(el => el.artist !== artistObj.artist);
              const updatedArtists = [...artistsMinusThisOne, artistToUpdate].sort((a, b) => a.artist.localeCompare(b.artist))
              this.setState({
                artists: updatedArtists,
                loading: false,
                error: false
              })
            } else {
              console.log('Error on the BE!')
              this.setState({
                error: true,
                loading: false
              })
            }
          }
          )
        })

      } else {
        this.setState({
          artists: [],
          loading: false
        })
      }
    }).catch(err => { });

  };

};

export default ArtistsPage;