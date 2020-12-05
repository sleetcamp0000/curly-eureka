import React, { Component } from 'react';
import ResultsViewer from './ResultsViewer';
import Spinner from './Spinner';
import firebaseAxios from './firebaseAxios';
import '../styles/ResultsPage.css';

class ResultsPage extends Component {

  state = {
  };

  confirmButtonHandler = (newestIdThisSession) => { // 4166059
    console.log(newestIdThisSession, ' < < < < < < < newestIdLastSession')
    const { token } = this.props;
    let r = window.confirm(`Sure you wish to confirm? The DB will be updated with the postId of the first result on this page. Subsequent uses of this app will only seek posts posted AFTER this postId.`);
    if (r == true) {
      firebaseAxios.patch(`/newestIdLastSession.json?auth=${token}`, {
        'newestIdLastSession': parseInt(newestIdThisSession)
      });
    }
  };

  moreButtonHandler = () => {
    console.log('firing ResultsPage > moreButtonHandler...')
    this.props.handleGetMorePosts();
  };

  render() {
    const { posts, filtersBundled, lastPageReached, loading, token } = this.props;

    return (
      <div className="ResultsPage">
        <ResultsViewer posts={posts} filtersBundled={filtersBundled} loading={loading} token={token} />
        {lastPageReached
          ? <div className="CaughtUpStrip">You're all caught up. Confirm? <button onClick={() => this.confirmButtonHandler(posts[0].postId)}>CONFIRM</button></div>
          : (
            posts.length > 0 ?
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
    );
  };

};

export default ResultsPage;


