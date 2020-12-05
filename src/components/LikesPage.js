import React, { Component } from 'react';
import firebaseAxios from './firebaseAxios';
import ResultsViewer from './ResultsViewer';
import Spinner from './Spinner';
import * as u from './utils';
import '../styles/LikesPage.css';

class LikesPage extends Component {
  state = {
    likedPosts: [],
    loading: true,
    oldestTimestampInBatch: null,
    reachedEnd: false
  };

  // likesChecker = () => {
  //   console.log('checking FB likes...')

  //   let startAt = 0;
  //   firebaseAxios.get(`/likes.json?orderBy="timestamp"&startAt=${startAt}&limitToFirst=5`).then(({ data }) => {
  //     data
  //       ? this.setState({ likedPosts: u.decryptPosts(data), loading: false })
  //       : this.setState({ likedPosts: [], loading: false });
  //   });
  // };

  moreButtonHandler = () => {
    console.log('mbh in likes!')
    const { likedPosts, oldestTimestampInBatch } = this.state;
    const { token } = this.props;
    firebaseAxios.get(`/likes.json?auth=${token}&orderBy="timestamp"&endAt=${oldestTimestampInBatch - 1}&limitToLast=40`).then(({ data }) => {
      if (data) {
        const decryptedPosts = u.decryptPosts(data);
        const batchSortedByTimestamp = decryptedPosts.sort((a, b) => b.timestamp - a.timestamp);
        const newestTimestampInBatch = batchSortedByTimestamp[batchSortedByTimestamp.length - 1].timestamp;
        const updatedLikedPosts = [...likedPosts, ...batchSortedByTimestamp]
        this.setState({ likedPosts: updatedLikedPosts, loading: false, oldestTimestampInBatch: newestTimestampInBatch })
      } else {
        this.setState({ loading: false, reachedEnd: true });
      }
    }).catch(err => console.log(err));

  };

  render() {
    const { likedPosts, loading, reachedEnd } = this.state;
    const { filtersBundled, token } = this.props;
    let moreStripVisibilityClass;
    if (reachedEnd) moreStripVisibilityClass = 'moreStripHidden';
    return (
      <div className="LikesPage">
        <ResultsViewer posts={likedPosts} filtersBundled={filtersBundled} likesChecker={this.likesChecker} loading={loading} token={token} />
        {likedPosts.length > 0 ?
          <div className={`MoreStrip ${moreStripVisibilityClass}`}>
            {loading
              ? <Spinner spinnerType='small' />
              : <span id="button" onClick={this.moreButtonHandler}>Load More</span>
            }
          </div>
          : null}
      </div>
    )
  }

  componentDidUpdate() {
    console.log('LikesPage UPDATED!')
  }

  // 1606235057600
  // 1605375181148


  componentDidMount() {

    const { token } = this.props;
    var d = new Date();
    var n = d.getTime();
    firebaseAxios.get(`/likes.json?auth=${token}&orderBy="timestamp"&endAt=${n}&limitToLast=40`).then(({ data }) => {
      const decryptedPosts = u.decryptPosts(data);
      const batchSortedByTimestamp = decryptedPosts.sort((a, b) => b.timestamp - a.timestamp);
      const oldestTimestampInBatch = batchSortedByTimestamp[batchSortedByTimestamp.length - 1].timestamp;
      data
        ? this.setState({ likedPosts: batchSortedByTimestamp, loading: false, oldestTimestampInBatch: oldestTimestampInBatch })
        : this.setState({ likedPosts: [], loading: false });
    }).catch(err => console.log(err));

  };

};

export default LikesPage;