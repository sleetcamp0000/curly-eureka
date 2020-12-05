import { render } from '@testing-library/react';
import React, { Component } from 'react';
import '../styles/FilterBar.css';

class FilterBar extends Component {

  state = {
    tagInspecting: null,
    showingCategory: 'desired',
    displayInfo: false,
    addingTag: false,
    tagBeingAdded: {
      tag: '',
      tagType: null,
      dependants: []
    },
    typedDependant: '',
    canSendTagToFB: false
  };

  changeShowing = type => {
    this.setState({
      showingCategory: type
    })
  }

  handleAddTag = (type) => {
    if (type == 'desired') {
      const { tagBeingAdded } = this.state;
      this.setState({
        showingCategory: 'desired',
        addingTag: true,
        tagBeingAdded: { ...tagBeingAdded, tag: this.props.typedFilter }
      })
    } else if (type == 'disallowed') {
      this.setState({
        showingCategory: 'disallowed'
      }, () => {
        this.handleConfirmAdd('DISALLOWED');
      })
    };
  }

  handleTagType = tagType => {
    const { tagBeingAdded } = this.state;
    this.setState({
      tagBeingAdded: { ...tagBeingAdded, tagType: tagType }
    })
  };

  handleDependantChange = e => {
    this.setState({
      typedDependant: e.target.value
    })
  }

  handleAddDependantClick = dependant => {
    const { tagBeingAdded } = this.state;
    const updatedDependants = [...tagBeingAdded.dependants];
    updatedDependants.push(dependant);
    this.setState({
      tagBeingAdded: { ...tagBeingAdded, dependants: updatedDependants },
      typedDependant: ''
    })
  }

  confirmButtonCanBeClicked = () => {
    const { tagBeingAdded } = this.state;
    const typeSelected = tagBeingAdded.tagType !== null;
    const atLeastOneDependant = tagBeingAdded.dependants.length > 0;
    let verdict;
    typeSelected && atLeastOneDependant ? verdict = true : verdict = false;
    return verdict;
  };

  handleDependantRemove = dependant => {
    const { tagBeingAdded } = this.state;
    const dependantsMinusThisOne = tagBeingAdded.dependants.filter(el => el !== dependant);
    console.log(dependantsMinusThisOne, ' <---')
    this.setState({
      tagBeingAdded: { ...tagBeingAdded, dependants: dependantsMinusThisOne }
    })
  };

  handleCancel = () => {
    this.props.handleInputClear();
    this.setState({
      addingTag: false,
      tagBeingAdded: {
        tag: '',
        tagType: null,
        dependants: []
      },
      typedDependant: '',
      canSendTagToFB: false
    })
  };

  handleConfirmAdd = (type) => {
    let tagAdderShouldStillShow = type !== 'DISALLOWED';
    console.log(tagAdderShouldStillShow)
    this.setState({
      addingTag: tagAdderShouldStillShow
    }, () => {
      setTimeout(() => {
        let r = window.confirm(`Sure you want to add this ${type} tag?`);
        if (r == true) {
          console.log('Pressed OK, check if TAG already exists on FB. If so, say so, and cancel. If not, encrypt tagBeingAdded and add to FB!')
          const { tags } = this.props;
          const allTags = tags.desired.map(el => el.tag).concat(tags.disallowed);
          const tagAlreadyExists = allTags.includes(this.props.typedFilter);
          if (tagAlreadyExists) {
            window.alert(`Tag already exists in ${type}!`)
            this.handleCancel();
          } else {
            console.log('Can add, gonna add to FB!')
            this.handleCancel();
            // encode tagBeingAdded if type == 'DESIRED' or typedFilter if type == 'DISALLOWED' and send to either /tags/desired.json or /tags/disallowed.json
          }
        } else {
          console.log('Pressed Cancel.')
          this.handleCancel();
        }
      }, 200)
    })
  };

  handleDeleteTag = (tag, type) => {
    //
  };

  handleDisplayInfo = (tag, type) => {
    this.setState({
      tagInspecting: tag,
      displayInfo: true
    })

  };

  render() {
    const { tags, handleFilterClick, filterBy, handleInputChange, typedFilter } = this.props;
    const { addingTag, tagBeingAdded, typedDependant, showingCategory, displayInfo, tagInspecting } = this.state;
    const sortedDesiredTags = tags.desired.sort((a, b) => (a.tag > b.tag) ? 1 : ((b.tag > a.tag) ? -1 : 0));
    const sortedDisallowedTags = tags.disallowed.sort((a, b) => (a > b) ? 1 : ((b > a) ? -1 : 0));

    let visibilityClass, addButtonClass;
    // showFilterBar ? visibilityClass = 'FilterBarVisible' : visibilityClass = 'FilterBarHidden'
    typedFilter.length > 0 ? addButtonClass = 'clickable' : addButtonClass = 'unclickable';

    const tagInspectingInfo = tags.desired.concat(tags.disallowed).find(el => el.tag ? el.tag == tagInspecting : el == tagInspecting); // if a desired tag, it'll be an object, if it's a disallowed tag, it'll just be a string


    return (
      <div className={`FilterBar ${visibilityClass}`}>

        <div className="tagSearchContainer">
          <span><i class="fas fa-search"></i></span>
          <input type="text" onChange={(event) => handleInputChange(event)} value={typedFilter} />
          <span>
            <button className={`addButton ${addButtonClass}`} onClick={() => this.handleAddTag('desired')}>Add Desired</button>
            <button className={`addButton ${addButtonClass}`} onClick={() => this.handleAddTag('disallowed')}>Add Disallowed</button>
          </span>
        </div>


        <div className="tagCategorySwitcher">
          <span>
            <button onClick={() => this.changeShowing('desired')}>Desired</button>
            <button onClick={() => this.changeShowing('disallowed')}>Disallowed</button>
          </span>
        </div>

        {displayInfo ?
          <div className="tagInfoDisplayer">
            {/* <p>{tagInspectingInfo}</p> */}
            <button>Edit</button>
            <button>Delete</button>
            <button>Save</button>
            <button>Close</button>
          </div>
          : null}

        {showingCategory == 'desired'
          ?
          <div className="desiredTagsContainer">
            {sortedDesiredTags.sort().map(tagObj => {
              let buttonStateClass;
              filterBy.includes(tagObj.tag) ? buttonStateClass = 'desiredButtonOn' : buttonStateClass = 'buttonOff';
              return (
                <span className="tagContainer">
                  <button className={`tagButton ${buttonStateClass}`} onClick={() => handleFilterClick(tagObj.tag)}>
                    {tagObj.tag}
                  </button>
                  <button className="tinyButton" onClick={() => this.handleDisplayInfo(tagObj.tag)}><span><i class="far fa-question-circle"></i></span></button>

                  {/* <button className="tinyButton delete" onClick={() => this.handleDeleteTag(tagObj.tag, 'desired')}>X</button>
                  <button className="tinyButton info" onClick={() => this.displayInfo(tagObj.tag)}>
                    <span>
                      <i class="fas fa-info"></i>
                    </span>
                  </button> */}

                </span>
              )
            })}
          </div>
          :
          <div className="disallowedTagsContainer">
            {sortedDisallowedTags.sort().map(tag => {
              return (
                <span className="tagContainer">
                  <button className={`tagButton disallowedButton`}>
                    {tag}
                  </button>

                  <button className="tinyButton" onClick={() => this.handleDisplayInfo(tag)}><span><i class="far fa-question-circle"></i></span></button>

                  {/* <button className="deleteButton" onClick={() => this.handleDeleteTag(tag, 'disallowed')}>X</button> */}
                </span>
              )
            })}
          </div>
        }



        {addingTag ?
          <div className="tagAdderContainer">
            <span><button onClick={() => this.handleTagType('A')}>A</button><button onClick={() => this.handleTagType('B')}>B</button></span>
            <br />
            <span>Dependants: <input type="text" onChange={(event) => this.handleDependantChange(event)} value={typedDependant} /><button onClick={() => this.handleAddDependantClick(typedDependant)}>Add dependant</button></span>
            <br />
            <span><button className={`confirmButton ${this.confirmButtonCanBeClicked() ? 'clickable' : 'unclickable'}`} onClick={() => this.handleConfirmAdd('DESIRED')}>Confirm</button><button onClick={this.handleCancel}>Cancel</button></span>
            <br />

            <p>Tag: {tagBeingAdded.tag}</p>
            <p>Type: {tagBeingAdded.tagType}</p>
            <p>Dependants: {
              tagBeingAdded.dependants.map(dependant => {
                return (
                  <span className="tagContainer">
                    <button className="desiredButton" onClick={() => this.handleDependantRemove(dependant)}>{dependant}</button>
                  </span>
                )
              })
            }</p>
          </div>
          : null
        }

      </div >
    )
  };

  // componentDidUpdate(prevProps, prevState) {
  //   const { canSendTagToFB } = this.state;



  //   if (canSendTagToFB == prevState.canSendTagToFB) {
  //     if (confirmButtonCanBeClicked() == true) {
  //       this.setState({
  //         canSendTagToFB: true
  //       });
  //     } else {
  //       this.setState({
  //         canSendTagToFB: false
  //       });
  //     };
  //   }


  // }

}

export default FilterBar;
