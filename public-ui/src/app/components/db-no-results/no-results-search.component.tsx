import { Component, Input, ViewEncapsulation } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { Spinner } from 'app/utils/spinner';
import * as React from 'react';

const styleCss =
`
.no-results {
  margin-top:-1rem;
  padding:1em;
}
`;

interface Props {
    searchValue: string;
    // domainMatch: Function;
}

export const NoResultSearchComponent = (class extends React.Component<Props, {}> {
    constructor(props) {
        super(props);
    }

    render() {
        const {searchValue} = this.props;
        const loading = true;
        console.log('am i here not search rq3hetcw ');
        return (
            <React.Fragment>
            <style>{styleCss}</style>
            <p>Test Text</p>
            <div className='no-results'>
                { loading ? <p>Searching whole site for <strong>searchValue</strong></p> : null }
                <Spinner/>
            </div>
            </React.Fragment>
        );
      }
});

@Component({
  selector: 'app-domain-results-match',
  template: `<span #root></span>`,
  encapsulation: ViewEncapsulation.None,
})

export class NoResultSearchWrapperComponent extends BaseReactWrapper {
  @Input() public searchValue: string;
  // @Input() public domainMatch: function;

  constructor() {
    super(NoResultSearchComponent, ['searchValue']);
  }
}