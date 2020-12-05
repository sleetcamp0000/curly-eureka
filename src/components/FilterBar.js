import React from 'react';
import '../styles/FilterBar.css';

const FilterBar = props => {
  const { tags, handleAddOrRemoveTag, handleInputChange, clearFilters, showFilterBar } = props;
  const { filterBy, typedFilter, tempDisalloweds } = props.filtersBundled;
  const sortedDesiredTags = tags.desired.sort((a, b) => (a.tag > b.tag) ? 1 : ((b.tag > a.tag) ? -1 : 0));
  let visibilityClass, addButtonClass;
  typedFilter.length > 0 ? addButtonClass = 'clickable' : addButtonClass = 'unclickable';

  return (
    // <div className={`FilterBar visible${showFilterBar}`}>
    <div className={`FilterBar`}>


      <div id={`visible${showFilterBar}`} className={`masterTagsContainer visible${showFilterBar}`}>

        <div className="desiredTagsFilterContainer">
          {sortedDesiredTags.sort().map(tagObj => {
            let buttonStateClass;
            filterBy.includes(tagObj.tag) ? buttonStateClass = 'desiredButtonOn' : buttonStateClass = 'buttonOff';
            return (
              <span className={`tagspan tagButton tagButtonDesired ${buttonStateClass}`} onClick={() => handleAddOrRemoveTag(tagObj.tag, 'filterBy')}>
                {tagObj.tag}
              </span>
            )
          })}
        </div>

        {tempDisalloweds.length > 0 ?
          <div className="tempDisallowedsContainer">
            {tempDisalloweds.map(disallowed => {
              return (
                <button className="tagButton tagButtonDisallowed" onClick={() => handleAddOrRemoveTag(disallowed, 'tempDisalloweds')}>
                  {disallowed}
                </button>
              )
            })}
          </div> : null
        }

      </div>

      <div className={`tagSearchContainer visible${showFilterBar}`}>
        <span><i class="fas fa-search"></i></span>
        <input className="filterTagSearchInput" type="text" onChange={(event) => handleInputChange(event)} value={typedFilter} />
        <span id="button" onClick={() => clearFilters()}>Clear All</span>
        <span id="button" onClick={() => handleAddOrRemoveTag(typedFilter, 'tempDisalloweds')}>Exclude</span>
      </div>

    </div >
  )
}

export default FilterBar;