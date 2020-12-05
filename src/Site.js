import React, { Component } from 'react';
import { Router, Redirect } from "@reach/router";
import './styles/Site.css';
import ResultsPage from "./components/ResultsPage";
import LikesPage from "./components/LikesPage";
import ArtistsPage from "./components/ArtistsPage";
import ArtistPage from "./components/ArtistPage";
import TagsPage from './components/TagsPage';
import NavBar from './components/NavBar';
import FilterBar from './components/FilterBar';
import firebaseAxios from './components/firebaseAxios.js';
import * as api from './components/api';
import * as u from './components/utils';
import _, { uniq } from 'lodash';

class Site extends Component {
  state = {
    loggedIn: false,
    token: null,
    userId: null,
    error: null,
    latestId: null,
    posts: [],
    tags: {
      desired: [],
      disallowed: []
    },
    showFilterBar: false,
    filterBy: [],
    typedFilter: '',
    lastPageReached: false,
    resultsPagesLoaded: 0,
    loading: true,
    tagBeingAdded: {},
    tempDisalloweds: []
  };

  handleAddOrRemoveTag = (tag, type) => {
    const { typedFilter } = this.state;
    if ((type === 'tempDisalloweds' && typedFilter.length > 0) || (type !== 'tempDisalloweds')) {
      let updatedArr, arr = this.state[type]
      !arr.includes(tag) ? updatedArr = [...arr, tag] : updatedArr = arr.filter(tagInArr => tagInArr !== tag);
      this.setState({ [type]: updatedArr }, () => type == 'tempDisalloweds' ? this.clearTypedFilter() : null);
    }
  }

  clearTypedFilter = () => {
    this.setState({
      typedFilter: ''
    })
  }

  clearFilters = () => {
    this.setState({
      filterBy: [],
      tempDisalloweds: [],
      typedFilter: ''
    })
  };

  toggleFilterBar = () => {
    this.setState(prevState => {
      return {
        showFilterBar: !prevState.showFilterBar
      }
    });
  };

  handleInputChange = (e) => {
    this.setState({
      typedFilter: e.target.value
    })
  }

  handleInputClear = () => {
    this.setState({
      typedFilter: ''
    })
  }

  handleGetMorePosts = () => {
    const { resultsPagesLoaded } = this.state;
    const { token } = this.props;
    console.log('firing Site > handleGetMorePosts...')

    this.setState({
      loading: true
    }, () => {
      u.fetchDecryptedPageOfPosts(`/sessionStorage/page_${resultsPagesLoaded + 1}.json`, this.state.posts, token)
        .then(({ isLastPage, allPostsSorted, reqError }) => {
          !reqError ?
            this.setState({ posts: allPostsSorted, resultsPagesLoaded: resultsPagesLoaded + 1, lastPageReached: isLastPage, loading: false })
            : this.setState({ loading: false });
        }).catch(err => console.log('🧿🧿'));
    })

  }

  refreshTags = () => {
    const { token } = this.props;
    u.getAndDecryptTagsFromFB(token).then(({ tags }) => {
      this.setState({
        tags: {
          desired: u.sortObjectsByName(tags.decryptedDesired),
          disallowed: u.sortStringsByName(tags.decryptedDisallowed)
        }
      })
    })
  }

  render() {
    const { posts, tags, showFilterBar, filterBy, typedFilter, lastPageReached, loading, tempDisalloweds } = this.state;
    const filtersBundled = { filterBy, typedFilter, tempDisalloweds };
    const { token, handleLogout } = this.props;
    return (
      <div className="Site">

        <Router>
          <ResultsPage path="/" posts={posts} filtersBundled={filtersBundled} lastPageReached={lastPageReached} loading={loading} handleGetMorePosts={this.handleGetMorePosts} token={token} />
          <LikesPage path="/likes" filtersBundled={filtersBundled} token={token} />
          <ArtistsPage path="/artists" filtersBundled={filtersBundled} token={token} />
          <ArtistPage path="/artist/:artist_name" filtersBundled={filtersBundled} token={token} />
          <Redirect from="/redirect/:artist_name" to="/artist/:artist_name" />
          <TagsPage path="/tags" tags={tags} refreshTags={this.refreshTags} token={token} />
        </Router>
        <FilterBar tags={tags} handleAddOrRemoveTag={this.handleAddOrRemoveTag} handleInputChange={this.handleInputChange} handleInputClear={this.handleInputClear} clearFilters={this.clearFilters} clearTypedFilter={this.clearTypedFilter} filtersBundled={filtersBundled} showFilterBar={showFilterBar} />
        <NavBar toggleFilterBar={this.toggleFilterBar} handleLogout={handleLogout} />
      </div >
    );
  };

  componentDidUpdate() {
    console.log('Site did update!')
  }

  componentDidMount() {
    const { token } = this.props;
    firebaseAxios.get(`/newestIdLastSession.json?auth=${token}`)
      .then(({ data }) => {
        const { newestIdLastSession } = data; // 4221069 4166059
        console.log(newestIdLastSession, ' / / / / / / / / ')
        api.fetchThumbs(newestIdLastSession, token).then(res => { // <<<

          u.fetchDecryptedPageOfPosts(`/sessionStorage/page_1.json`, this.state.posts, token)
            .then(({ isLastPage, allPostsSorted, reqError }) => {
              !reqError ?
                this.setState({ posts: allPostsSorted, resultsPagesLoaded: 1, lastPageReached: isLastPage, loading: false })
                : this.setState({ loading: false });
            }).catch(err => console.log('🧿'));

        }); // <<<

        u.getAndDecryptTagsFromFB(token).then(({ tags }) => {
          this.setState({
            tags: {
              desired: u.sortObjectsByName(tags.decryptedDesired),
              disallowed: u.sortObjectsByName(tags.decryptedDisallowed)
            }
          })
        });

      });
  };

}

export default Site;