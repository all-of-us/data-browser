import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { ClrIcon } from 'app/utils/clr-icon';
import * as React from 'react';

const searchStyle = `
.search-title {
    margin-bottom: 0.5em;
    display: flex;
    flex-direction: row;
}
.secondary-display {
  font-family: Arial, sans-serif;
  font-weight: 200;
  font-style: normal;
  font-size: 27px;
  font-stretch: normal;
  line-height: 1.47em;
  letter-spacing: normal;
  text-align: left;
}
.genomics-search-heading-display {
  font-family: Arial, sans-serif;
  font-style: normal;
  font-size: 18px;
  font-weight: 200;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  font-stretch: normal;
  line-height: 1.47em;
  letter-spacing: normal;
  text-align: left;
}

/* •••••SEARCH-BAR•••••• */

#db-search-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
  background: #dae6ed;
  padding: 9px;
  border-radius: 5px;
}

@media only screen and (min-width: 1168px) {
  #db-search-bar {
    min-width: 20rem;
  }
}

#db-search-bar input {
  min-width: calc((100% / 12) * 10);
  padding: 18px;
  font-size: 18px;
}


#db-search-bar input::-webkit-input-placeholder {
  /* Chrome/Opera/Safari */
  color: #216fb4;
}

#db-search-bar input::-moz-placeholder {
  /* Firefox 19+ */
  color: #216fb4;
}

#db-search-bar input:-ms-input-placeholder {
  /* IE 10+ */
  color: #216fb4;
}

#db-search-bar input:-moz-placeholder {
  /* Firefox 18- */
  color: #216fb4;
}

#db-search-bar {
    flex-grow: 1;
    background: #dae6ed;
    padding: 9px;
    border-radius: 5px;
    width: 100%;
}

@media only screen and (min-width: 768px) {
    .search-icon-container {
        flex-flow: row;
    }
}

.search-icon {
    margin-left: 3%;
}
.clear-icon {
    margin-right: 3%;
}
`;

const homeSearchStyle = `
@media only screen and (min-width: 768px) {
    #db-search-bar {
        width: 36vw;
    }
}`;

interface SearchProps {
    value: string;
    searchTitle: string;
    domain: string;
    onChange: Function;
    onClear: Function;
}

export const SearchComponent = (class extends React.Component<SearchProps, {}> {
    constructor(props) {
        super(props);
    }

    render() {
        const {onChange, onClear, value, searchTitle, domain} = this.props;
        const iconShape = 'search';
        const iconClass = 'is-info search-icon';
        const headingClassName = (domain === 'genomics') ? 'genomics-search-heading-display' : 'secondary-display';
        return (
            <React.Fragment>
            <style>{searchStyle}</style>
            {searchTitle && <style>{homeSearchStyle}</style>}
            <div className='search-title'>
                <span className={headingClassName}>{searchTitle}</span>
                {searchTitle && domain!=='genomics' && <TooltipReactComponent label='Homepage Tooltip Hover' searchTerm={value}
                                                action='Tooltip Homepage search across data' tooltipKey='Search Across Data Types'/>}
            </div>
            <div id='db-search-bar'>
            <ClrIcon shape={iconShape} className={iconClass} />
            <input type='text' aria-label='Main Search' id='search-db'
            placeholder='Keyword Search' name='searchText'
            onChange={(e) => {onChange(e.target.value); }} value={value}/>
            <div className='clear-icon' onClick={(e) => {onClear(); }}>
            <i className='far fa-times fa-1x clear-search-icon'></i></div>
            </div>
            </React.Fragment>
        );
      }
});
