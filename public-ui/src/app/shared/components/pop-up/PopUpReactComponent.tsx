import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as fp from 'lodash/fp';
import * as React from 'react';
import { FunctionComponent } from 'react';
import * as ReactDOM from 'react-dom';
import { BaseReactWrapper } from '../../../data-browser/base-react/base-react.wrapper';
const containerElementName = 'myReactComponentContainer';

const helptexts = { 'QuickSearchPopup': {
    title: 'PUBLIC DATA USE STATEMENT',
    statement: <div className='card-body'>
               <i>All of Us</i> Research Program data are not representative of the population
               of the United States. If you present, publish, or distribute <i>All of Us</i> data,
               please include the following disclaimer:<br /> The <i>All of Us</i> Research Program
               includes a demographically, geographically, and medically diverse group of
               participants, however, it is not a representative sample of the population of the
               United States. Enrollment in the <i>All of Us</i> Research program is open to all
               who choose to participate, and the program is committed to engaging with and
               encouraging participation of minority groups that are historically
               underrepresented in biomedical research. </div>
  },
  'EhrViewPopUp': {
    title: 'DATA DISCLAIMER',
    statement: <div className='card-body'>
               The <i>All of Us</i> Research Program includes a demographically, geographically, and
               medically diverse group of participants, however, it is not a representative sample
               of the population of the United States. Enrollment in the <i>All of Us</i> Research
               program is open to all who choose to participate, and the program is committed to
               engaging with and encouraging participation of minority groups that are historically
               underrepresented in biomedical research. </div>
  },
  'CopePopUp': {
    title: 'COvid-19 Participant Experience (COPE) survey',
    statement: <div className='card-body'>
               <div className='cope-statement'>
               <span className='cope-statement-body'>This optional survey was released to
               participants for completion at multiple time points during the COVID-19 pandemic.
               As a result, a participant may have multiple data points if they completed more
               than one survey.</span> <span className='cope-statement-body'>This survey has
               multiple versions. Even though most of the content is consistent between versions,
               some questions were modified.</span> <span className='cope-statement-box'><strong>
               Please Note:</strong><br /> While these aggregate data are available in the Data
               Browser tool, to protect participant privacy, only select data will be available in
               the Registered Tier dataset (i.e., data describing COVID positive status will not be
               made available) </span> </div> </div>
  }};

class PopUpReactComponent extends React.Component {
  constructor(props) {
      super(props);
  }

  render() {
    return <div className='data-statement'>
                    <div className='card'>
                        <div onClick={this.props.popUpClose} className='close'>x</div>
                           <h2 className='card-title'>{helptexts[helpText].title}</h2>
                           <div className='card-body'>{helptexts[helpText].statement}</div>
                           <div className='btn-container'>
                          <button onClick={popUpClose} className='disclaimer-btn'>OK</button>
                          </div>
                        </div>
                  </div>;
  }
}


@Component({
  selector: 'app-popup-react',
  template: `<span #${containerElementName}></span>`,
  styleUrls: ['../../../styles/template.css', './pop-up.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class PopUpWrapperComponent extends BaseReactWrapper {
  @ViewChild(containerElementName, { static: true }) containerRef: ElementRef;
  @Input() public helpText: string;
  @Input('onClose') popUpClose: Function;

  constructor(public injector: Injector) {
    super(injector, PopUpReactComponent, ['helpText', 'popUpClose']);
  }
}
