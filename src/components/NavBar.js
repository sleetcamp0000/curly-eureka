import React, { Component } from 'react';
import { Link } from "@reach/router";
import '../styles/NavBar.css';

const NavBar = props => {
  const { tags, toggleFilterBar } = props;
  return (
    <div className="NavBar">
      <div className="buttonsContainer">

        <div className="container homeButtonContainer">
          <span>
            <Link to={`/`} style={{textDecoration: 'none'}}>
              <i class="fas fa-home icon"></i>
            </Link>
          </span>
        </div>

        <div className="container filtersButtonContainer">
          <span>
            <i class="fas fa-layer-group icon" onClick={() => toggleFilterBar()}></i>
          </span>
        </div>

        <div className="container likesButtonContainer">
          <span>
            <Link to={`/likes`} style={{textDecoration: 'none'}}>
              <i class="fas fa-heart icon"></i>
            </Link>
          </span>
        </div>

        <div className="container artistsButtonContainer">
          <span>
            <Link to={`/artists`} style={{textDecoration: 'none'}}>
              <i class="fas fa-palette icon"></i>
            </Link>
          </span>
        </div>

        <div className="container tagsButtonContainer">
          <span>
            <Link to={`/tags`} style={{textDecoration: 'none'}}>
              <i class="fas fa-tags icon"></i>
            </Link>
          </span>
        </div>

        <div className="container logoutButtonContainer">
          <span>
            {/* <Link to={`/`} onClick={() => props.handleLogout()}> */}
            <i class="fas fa-sign-out-alt" onClick={() => props.handleLogout()}></i>
            {/* </Link> */}
          </span>
        </div>


      </div>
    </div>
  )
}

export default NavBar;
