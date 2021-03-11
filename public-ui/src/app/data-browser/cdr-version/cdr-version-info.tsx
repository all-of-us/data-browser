import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { environment } from 'environments/environment';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';
import { FunctionComponent } from 'react';
import * as ReactDOM from 'react-dom';
import { BaseReactWrapper } from '../../data-browser/base-react/base-react.wrapper';
const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));

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
    api.getCdrVersionUsed().then(
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

<input type="checkbox" id="" name="" value="">
<label for=""> Trainee</label>

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
