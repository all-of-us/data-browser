import {
  Component,
  Input
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { AgeChartReactComponent } from 'app/data-browser/charts/chart-age/chart-age-react.component';
import { BioSexChartReactComponent } from 'app/data-browser/charts/chart-biosex/chart-biosex-react.component';
import { VersionChartReactComponent } from 'app/data-browser/charts/chart-version/chart-version-react.component';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { ErrorMessageReactComponent } from 'app/data-browser/views/error-message/error-message-react.component';
import { GraphType } from 'app/utils/enum-defs';
import { triggerEvent } from 'app/utils/google_analytics';
import * as React from 'react';

interface State {
    graphToShow: string;
}

interface Props {
    graphButtons: any;
    searchTerm: string;
}

const chartStyleCss = `
.concept-graph-menu {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: 9px;
}
.concept-chart-choice {
  padding: 9px;
  color: #216fb4;
  position: relative;
  display: flex;
  cursor: pointer;
}

.concept-chart-choice .tooltip {
  margin-left: 0.25rem;
}
.concept-chart-choice:hover {
  color: #262262;
}

.concept-chart-choice.active::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 5px;
  right: 0;
  background: #216fb4;
  bottom: 0px;
  border-radius: 5px;
  cursor: pointer;
}
@media (max-width: 600px) {
    .concept-chart-choice {
        font-size: 4vw;
        padding: 2px;
    }
}
`;

export class ConceptChartReactComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
        graphToShow: GraphType.BiologicalSex,
    };
  }

  componentDidMount() {
    this.selectGraphType(this.state.graphToShow);
  }

  selectGraphType(g: any) {
    this.setState({
          graphToShow: g });
  }


  render() {
    const {graphButtons, searchTerm} = this.props;
    const {graphToShow} = this.state;
    const label = 'EHR Tooltip Hover';
    console.log(graphToShow);
    const tabIndex = 0;
    return <React.Fragment>
      <style>{chartStyleCss}</style>
      <div className='concept-graph-menu'>
              {
                graphButtons.map((g, index) => {
                  return (
                    <div onClick={() => this.selectGraphType(g)}
                        className={graphToShow === g ? 'active concept-chart-choice' : 'concept-chart-choice'}
                        tabIndex={tabIndex} key={index}>
                        <span>{g}</span>
                        <TooltipReactComponent tooltipKey={g}
                                         label={label} searchTerm={searchTerm} action='Survey Chart Tooltip'>
                                        </TooltipReactComponent>
                    </div>
                  );
                })
              }
      </div>
    </React.Fragment>;
  }
}


@Component({
  selector: 'app-concept-chart-react',
  template: `<span #root></span>`
})
export class ConceptChartWrapperComponent extends BaseReactWrapper {
  @Input() graphButtons: string[];
  @Input() searchTerm: string;

  constructor() {
    super(ConceptChartReactComponent, ['graphButtons']);
  }
}
