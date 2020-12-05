import React, { Component } from 'react';
import * as u from './utils';
import '../styles/TagsPage.css';
import Spinner from './Spinner';
import firebaseAxios from './firebaseAxios.js';

class TagsPage extends Component {
  state = {
    tags: {},
    loading: true,
    tagEditing: null,
    newDependant: '',
    newTag: {
      category: 'disallowed',
      tag: '',
      type: 'A',
      dependants: [],
      newDependant: '',
      isArtist: false
    },
    savingToFB: false,
    saveToFBStatus: 'inactive'
  };

  undoAllChanges = () => {
    this.handleClearNewTag();
    this.setState({
      tags: this.props.tags,
      loading: false,
      tagEditing: null,
      newDependant: ''
    })
  }

  saveToDB = () => {
    const { tags, savingToFB } = this.state;
    const { token } = this.props;
    const { refreshTags } = this.props;

    let r = window.confirm(`Sure you want to overwrite changes to the DB?`);
    if (r == true) {
      const desiredEncrypted = tags.desired.map(tagObj => {
        return {
          tag: u.encryptToJSON(tagObj.tag),
          type: tagObj.type,
          dependants: tagObj.dependants ? tagObj.dependants.map(dependant => u.encryptToJSON(dependant)) : null
        }
      });
      const disallowedEncrypted = tags.disallowed.map(tagObj => {
        return {
          tag: u.encryptToJSON(tagObj.tag),
          isArtist: tagObj.isArtist
        }
      });

      this.setState({
        savingToFB: true,
        saveToFBStatus: 'pending'
      }, () => {
        let desiredHashes, disallowedHashes;
        const getPromise = (endpoint) => firebaseAxios.get(endpoint);
        const postPromise = (endpoint, data) => firebaseAxios.post(endpoint, data)
        const deletePromise = (endpoint) => firebaseAxios.delete(endpoint)

        return Promise.all([getPromise(`/tags/desiredTags.json?auth=${token}`), getPromise(`/tags/disallowedTags.json?auth=${token}`)]).then(values => {
          desiredHashes = Object.keys(values[0].data);
          disallowedHashes = Object.keys(values[1].data);
          return Promise.all([postPromise(`/tags/desiredTags.json?auth=${token}`, desiredEncrypted), postPromise(`/tags/disallowedTags.json?auth=${token}`, disallowedEncrypted),
          ])
        }).then(() => { //delete other ones
          const deleteSurplusDesireHashesPromises = desiredHashes.map(hash => deletePromise(`/tags/desiredTags/${hash}.json?auth=${token}`));
          const deleteSurplusDisallowedHashesPromises = disallowedHashes.map(hash => deletePromise(`/tags/disallowedTags/${hash}.json?auth=${token}`));
          const allDeleteSurplusHashesPromises = deleteSurplusDesireHashesPromises.concat(deleteSurplusDisallowedHashesPromises);
          return Promise.all(allDeleteSurplusHashesPromises)
        }).then(() => {
          refreshTags();
          this.setState({ saveToFBStatus: 'success' }, () => {
            setTimeout(() => { this.setState({ savingToFB: false, saveToFBStatus: 'inactive' }) }, 3000)
          })
        }).catch(err => {
          console.log(err, ' <-- at end of saveToDB promise chain');
          this.setState({ saveToFBStatus: 'failure' }, () => {
            setTimeout(() => {
              this.setState({ savingToFB: false, saveToFBStatus: 'inactive' })
              this.undoAllChanges();
            }, 3000)
          })
        })

      })

    };




  }

  handleClearNewTag = () => {
    this.setState({
      newTag: {
        category: 'disallowed',
        tag: '',
        type: 'A',
        dependants: [],
        newDependant: '',
        isArtist: false
      }
    })
  }

  newToggleCategory = () => {
    console.log('toggling cat')
    const { newTag } = this.state;
    let updatedCategory = newTag.category == 'desired' ? 'disallowed' : 'desired';
    this.setState({
      newTag: {
        category: updatedCategory,
        tag: '',
        type: 'A',
        dependants: [],
        newDependant: '',
        isArtist: false
      }
    })
  }

  newAddOrRemoveDependant = (action, dependant) => {
    const { newTag } = this.state;
    if (action == 'add') {
      if (newTag.newDependant.length < 1) {
        window.alert(`Please enter a dependant first!`);
      } else {
        const updatedDependants = u.sortStringsByName([...newTag.dependants, newTag.newDependant]);
        this.setState({
          newTag: { ...newTag, dependants: updatedDependants, newDependant: '' }
        });
      }
    };
    if (action == 'remove') {
      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      const updatedDependants = [...newTag.dependants].filter(el => el !== dependant);
      this.setState({
        newTag: { ...newTag, dependants: updatedDependants }
      })
    };


  };

  newHandleInputChange = (e, type) => {
    console.log(type)
    const { newTag } = this.state;
    if (type == 'tag') { this.setState({ newTag: { ...newTag, tag: e.target.value } }) };
    if (type == 'dependant') { this.setState({ newTag: { ...newTag, newDependant: e.target.value } }) };
  }

  newHandleToggleType = () => {
    const { newTag } = this.state;
    let updatedType;
    newTag.type == 'A' ? updatedType = 'B' : updatedType = 'A';
    this.setState({
      newTag: { ...newTag, type: updatedType }
    })
  }

  newToggleIsArtist = () => {
    const { newTag } = this.state;
    this.setState(prevState => {
      return {
        newTag: { ...newTag, isArtist: !prevState.newTag.isArtist }
      }
    });
  }

  newAddTag = () => {
    const { newTag, tags } = this.state;
    const allTags = tags.desired.map(el => el.tag).concat(tags.disallowed.map(el => el.tag));
    const tagAlreadyExists = allTags.includes(newTag.tag);
    if (tagAlreadyExists) {
      window.alert(`Cannot add - tag already being used! Check both 'desired' and 'disallowed' categories...`);
    } else if (newTag.tag.length < 1) {
      window.alert(`Please enter some tag data first!`)
    } else {
      if (newTag.category == 'desired') {
        const newDesiredTag = { tag: newTag.tag, type: newTag.type, dependants: newTag.dependants.length > 0 ? newTag.dependants : null }
        this.setState({
          tags: { ...tags, desired: [newDesiredTag, ...tags.desired] }
        }, () => { this.handleClearNewTag() });
      };
      if (newTag.category == 'disallowed') {
        const newDesiredTag = { tag: newTag.tag, isArtist: newTag.isArtist }
        this.setState({
          tags: { ...tags, disallowed: [newDesiredTag, ...tags.disallowed] }
        }, () => { this.handleClearNewTag() });
      };
    }
  };

  handleEditAndCancel = (e, tag) => {
    console.log(e.target.innerText)
    if (e.target.innerText == 'edit') {
      this.setState({
        tagEditing: tag
      });
    } else {
      const { tags } = this.state;
      const tagsMinusOneJustEditing = tags.desired.filter(el => el.tag !== tag);
      const tagInOriginalForm = this.props.tags.desired.find(el => el.tag == tag);
      this.setState({
        tags: { ...tags, desired: u.sortObjectsByName([...tagsMinusOneJustEditing, tagInOriginalForm]) },
        tagEditing: null
      });
    }
  };

  handleSave = () => {
    this.setState({
      tagEditing: null
    });
  };

  handleDelete = (tag, type) => {
    let r = window.confirm(`Sure you want to delete this ${type} tag?`);
    if (r == true) {
      const { tags } = this.state;
      let tagsMinusOneBeingDeleted, updatedTags;
      if (type == 'desired') { tagsMinusOneBeingDeleted = tags.desired.filter(el => el.tag !== tag); updatedTags = { ...tags, desired: tagsMinusOneBeingDeleted } };
      if (type == 'disallowed') { tagsMinusOneBeingDeleted = tags.disallowed.filter(el => el.tag !== tag); updatedTags = { ...tags, disallowed: tagsMinusOneBeingDeleted } };
      this.setState({
        tags: updatedTags
      });
    };
  };

  handleDependantInputChange = e => {
    this.setState({
      newDependant: e.target.value
    })
  }

  toggleType = () => {
    console.log('toggling type!')
    const { tagEditing, tags } = this.state;
    const tagToAlter = { ...tags.desired.find(el => el.tag == tagEditing) }; //
    const tagsMinusOneJustEditing = tags.desired.filter(el => el.tag !== tagEditing); //
    let updatedType;
    tagToAlter.type == 'A' ? updatedType = 'B' : updatedType = 'A';
    tagToAlter.type = updatedType;
    console.log(tagToAlter)
    this.setState(prevState => {
      return {
        tags: { ...tags, desired: u.sortObjectsByName([...tagsMinusOneJustEditing, tagToAlter]) }
      }
    })
  }

  addOrRemoveDependant = (tag, action, dependant) => { // change to be a func that either ADDS a dependant or REMOVES a dependant, based on an input that indicates which it should do
    const { tags, newDependant } = this.state; //
    const tagToAlter = tags.desired.find(el => el.tag == tag); //
    const tagsMinusOneJustEditing = tags.desired.filter(el => el.tag !== tag); //
    let updatedDependants;
    if (action == 'add') {
      tagToAlter.dependants
        ? updatedDependants = ([...tagToAlter.dependants].concat(newDependant))
        : updatedDependants = [newDependant];
    } else { // remove a dependant
      updatedDependants = [...tagToAlter.dependants].filter(el => el !== dependant)
    }
    const updatedTag = { ...tagToAlter, dependants: updatedDependants.length ? u.sortStringsByName(updatedDependants) : null }; //
    this.setState({ //
      tags: { ...tags, desired: u.sortObjectsByName([...tagsMinusOneJustEditing, updatedTag]) }, //
      newDependant: '' //
    }) //
  }

  render() {
    const { tags, loading, tagEditing, newDependant, newTag, saveToFBStatus } = this.state;
    let saveToDBButtonContent, isArtistClass;
    if (saveToFBStatus == 'inactive') saveToDBButtonContent = <span><i class="far fa-save" id="master"></i>Save Changes To DB</span>;
    if (saveToFBStatus == 'pending') saveToDBButtonContent = <Spinner spinnerType='small blueSpinner' />;
    if (saveToFBStatus == 'success') saveToDBButtonContent = <i class="fas fa-check-circle" style={{ color: "green" }}></i>;
    if (saveToFBStatus == 'failure') saveToDBButtonContent = <i class="fas fa-times-circle" style={{ color: "red" }}></i>;
    let saveToDBClass;
    if (saveToFBStatus !== 'inactive') saveToDBClass = 'tagsUnclickable'
    if (!newTag.isArtist) isArtistClass = 'isntArtistButton';
    return (

      <div className="TagsPage">
        {
          !loading ? (
            <div className="TagsPageContainer">

              <div className="masterButtonsContainer">

                {/* <div className="row"> */}

                <div className="wrenchIconContainer col-md-2" id="cont">
                  <span><i class="fas fa-wrench"></i></span>
                </div>

                <div className="undoButtonContainer col-md-4" id="cont">
                  <button className="undoAllChangesButton" onClick={this.undoAllChanges}>
                    <i class="fas fa-undo-alt" id="master"></i>Undo All Changes
                  </button>
                </div>

                <div className="saveToDBButtonContainer col-md-4" id="cont">
                  <button className={`saveToDBButton ${saveToDBClass}`} onClick={this.saveToDB}>
                    {saveToDBButtonContent}
                  </button>
                </div>

                <div className="emptyContainer col-md-2" id="cont"></div>

                {/* </div> */}

              </div>

              <div className="tagAdderLabel">Add a new tag ↓</div>

              <div className="tagAdderContainer">

                <div className={`tagAdder category-${newTag.category}`}>

                  <div className="tagAdderUpper">
                    <div className="categoryButtonContainer" id="c"><button id={`cat-${newTag.category}`} onClick={this.newToggleCategory}>{newTag.category}</button></div>
                    <div className="tagInputContainer"><input type="text" value={newTag.tag} onChange={(event) => this.newHandleInputChange(event, 'tag')}></input></div>
                    <div className="addButtonContainer" id="c"><button onClick={this.newAddTag}>Add tag</button></div>
                    {newTag.category == 'disallowed' ?
                      <div className="isArtistButtonContainer" id="c"><button onClick={this.newToggleIsArtist} className={isArtistClass}>is artist</button></div>
                      : null
                    }
                  </div>

                  {/* {newTag.category == 'desired' ? */}
                  <div className="tagAdderLower">
                    <div className={`typeButtonContainer`} id="c"><button className={`type${newTag.type}`} onClick={this.newHandleToggleType}>{newTag.type}</button></div>
                    <div className="newDependantInputContainer"><input type="text" placeholder="add a dependant..." value={newTag.newDependant} onChange={(event) => this.newHandleInputChange(event, 'dependant')}></input></div>
                    <div className="dependantAddButtonContainer" id="c"><button onClick={() => this.newAddOrRemoveDependant('add')}><span><i class="far fa-check-circle"></i></span></button></div>
                    <div className="dependantsLabelContainer">dependants: </div>
                    <div className="dependantsTagsContainer">
                      {newTag.dependants.map(dependant => {
                        return (
                          <div className="newDependantTagContainer">
                            <button
                              onClick={() => this.newAddOrRemoveDependant('remove', dependant)}>
                              <span><i class="far fa-times-circle"></i></span>
                            </button><span>{dependant}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {/* // : null} */}

                </div>

              </div>

              <div className="typeColumnsContainer">
                {!loading ?
                  <div className="typeColumns">
                    <div className="desiredTagsContainer col-md-6">
                      <div id="desiredHeading">DESIRED</div>

                      {tags.desired.map(tagObj => {
                        let disabledButtonClass, beingEditedDesiredClass;
                        tagEditing == tagObj.tag ? beingEditedDesiredClass = 'beingEditedDesired' : disabledButtonClass = 'tagsUnclickable';
                        return (
                          <div className={`desiredTagCardContainer ${beingEditedDesiredClass}`}>
                            <div className="desiredTagCardGrid">

                              <div className="desiredNameContainer">{tagObj.tag}</div>
                              <div className="typeContainer">type: <button className={`type${tagObj.type} ${disabledButtonClass}`} onClick={this.toggleType}>{tagObj.type}</button></div>
                              <div className="dependantsLabelContainer">dependants:</div>
                              <div className="actionButtonsContainer d-flex justify-content-between">
                                <button
                                  className={`${disabledButtonClass}`}
                                  onClick={(event) => this.handleEditAndCancel(event, tagObj.tag)}>revert</button>
                                <button
                                  className={`${disabledButtonClass}`} onClick={this.handleSave}>save</button>
                                <button onClick={(event) => this.handleEditAndCancel(event, tagObj.tag)}>edit</button>
                                <button id="desiredDelete" onClick={(event) => this.handleDelete(tagObj.tag, 'desired')}>delete</button>
                              </div>
                              <div className="dependantsContainer">
                                {tagObj.dependants ? tagObj.dependants.map(dependant => {
                                  return (
                                    <div className="dependantButtonContainer">
                                      <button
                                        className={`${disabledButtonClass}`}
                                        onClick={() => this.addOrRemoveDependant(tagObj.tag, 'remove', dependant)}>
                                        <span><i class="far fa-times-circle"></i></span>
                                      </button><span id="name">{dependant}</span>
                                    </div>
                                  )
                                }) : <span id="noneLabel">none</span>}
                              </div>

                            </div>
                            {tagEditing == tagObj.tag ?
                              <div className="dependantInputContainer">
                                <div className="dependantInputLabel">add dep:</div>
                                <div className="dependantInput d-flex justify-content-around">
                                  <input type="text" onChange={(event) => this.handleDependantInputChange(event)} value={newDependant}></input>
                                  <button onClick={() => this.addOrRemoveDependant(tagObj.tag, 'add')}><span><i class="far fa-check-circle"></i></span></button>
                                </div>
                              </div>
                              : null}
                          </div>
                        )
                      })}

                    </div>

                    <div className="disallowedTagsContainer col-md-6">
                      <div id="disallowedHeading">DISALLOWED</div>
                      {tags.disallowed.map(tagObj => {
                        return (
                          <div className={`disallowedTagCardContainer`}>
                            <div className="disallowedTagCardGrid">
                              <div className="disallowedNameContainer">{tagObj.tag} {tagObj.isArtist ? `(artist)` : null}
                              </div>
                              <div className="disallowedDeleteButtonContainer">
                                <button id="desiredDelete" onClick={(event) => this.handleDelete(tagObj.tag, 'disallowed')}>delete</button>
                              </div>
                            </div>
                          </div>

                        )
                      })}
                    </div>

                  </div>
                  : null}

              </div>
            </div>)
            : <div className="SpinnerComponentContainer"><Spinner spinnerType='big' /></div>}
      </div>
    )
  }

  componentDidMount() {
    const { token } = this.props;
    u.getAndDecryptTagsFromFB(token).then(({ tags }) => {
      this.setState({
        tags: {
          desired: u.sortObjectsByName(tags.decryptedDesired),
          disallowed: u.sortObjectsByName(tags.decryptedDisallowed)
        },
        loading: false
      })
    })
  };

}

export default TagsPage;