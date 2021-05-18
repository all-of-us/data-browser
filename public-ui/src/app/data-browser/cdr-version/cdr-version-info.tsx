import {
  Component,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { dataBrowserApi } from 'app/services/swagger-fetch-clients';
import * as React from 'react';

const containerElementName = 'root';

export const style = `
.result-body-item {
    padding: 6px 0;
}
.cdr-info {
    font-size: 14px;
}
`;

interface State {
    numParticipants: number;
    creationTime: Date;
}

export class CdrVersionReactComponent extends React.Component<{}, State> {

  constructor(props) {
    super(props);
    this.state = {
        numParticipants: null,
        creationTime: null,
    };
  }

  componentDidMount() {
      this.getCdrInfo();
  }

  getCdrInfo() {
    dataBrowserApi().getCdrVersionUsed().then(
          (result) => {
            this.setState({
              numParticipants: result.numParticipants,
              creationTime: new Date(result.creationTime)});
            });
  }

  render() {
    const {numParticipants, creationTime} = this.state;
    return !!creationTime && <React.Fragment>
    <style>{style}</style>
    <span className='result-body-item cdr-info'>
      Data includes {Number(numParticipants).toLocaleString()}&nbsp;
      participants and is current as
      of { creationTime.getMonth() + 1 }/{ creationTime.getDate() }/
      {creationTime.getFullYear()}.
           </span></React.Fragment>;
  }
}

@Component({
  selector: 'app-cdr-version-react',
  template: `<span #${containerElementName}></span>`,
  styleUrls: [],
  encapsulation: ViewEncapsulation.None,
})
export class CdrVersionWrapperComponent extends BaseReactWrapper {

  constructor() {
    super(CdrVersionReactComponent, []);
  }
}
