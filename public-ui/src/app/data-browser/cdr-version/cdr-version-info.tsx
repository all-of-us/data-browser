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
import * as React from 'react';
import { FunctionComponent } from 'react';
import * as ReactDOM from 'react-dom';
import { BaseReactWrapper } from '../../data-browser/base-react/base-react.wrapper';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import { environment } from 'environments/environment';
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
    numParticipants: any;
    creationTime: any;
    cdrName: any;
}

export class CdrVersionReactComponent extends React.Component<{}, State> {

  constructor(props) {
    super(props);
    this.state = {
        numParticipants: '',
        creationTime: '',
        cdrName: ''
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
            creationTime: new Date(result.creationTime),
            cdrName: result.name})
          });
  }

  render() {
    return !!this.state.creationTime && <React.Fragment>
    <style>{style}</style>
    <span className='result-body-item cdr-info'>
      Data includes {Number(this.state.numParticipants).toLocaleString()} participants and is current as
      of {this.state.creationTime.getMonth()+1}/{this.state.creationTime.getDate()}/{this.state.creationTime.getFullYear()}.
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
