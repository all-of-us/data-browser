import * as React from "react";


import { getTooltip } from "app/data-browser/services/tooltip.service";
import { ClrIcon } from "app/utils/clr-icon";
import { triggerEvent } from "app/utils/google_analytics";

const containerElementName = "root";

export const tooltipCss = `
.tooltip {
    position: relative;
    display: inline-block;

}

.tooltip .tooltiptext {
    visibility: hidden;
    width: 300px;
    font-size: 14px;
    font-family: GothamBook, Arial, sans-serif;
    background-color: #FFFFFF;
    color: #302C71;
    text-align: left;
    border-spacing: 5px;
    padding: 5px;
    position: absolute;
    bottom: 100%;
    left: 0%;
    margin-left: -140px;
    z-index: 110;
}

.tooltip .tooltiptext::after {
    content: " ";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #302C71 transparent transparent transparent;
}

.tooltip:focus .tooltiptext, .tooltip:hover .tooltiptext {
    visibility: visible;
}

.tooltiptext {
    margin: 3%;
    line-height: normal;
    outline: 2px solid #302C71;
    box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.15);
}
`;

interface Props {
  label: string;
  searchTerm: string;
  action: string;
  tooltipKey: string;
}

export class TooltipReactComponent extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.state={
      overflowX:0,
      saveLoc:0
    }
  }



  componentDidMount() {
    // document.addEventListener('mousemove', this.tooltipHover);
    document.addEventListener('resize', this.tooltipHover);
    // this.detectOverflow();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.tooltipHover);
    // window.removeEventListener('mousemove', this.tooltipHover);
  }
  
 
  
 
    detectOverflow = () => {
      const div = document.getElementById('tooltip');
      const body = document.body;
    
      if (div && body) {
        const divRect = div.getBoundingClientRect();
        const bodyRect = body.getBoundingClientRect();
    
        if (divRect && bodyRect) {
          const overflowX = divRect.right > bodyRect.right ? divRect.right - bodyRect.right : 0;
          const overflowY = divRect.bottom > bodyRect.bottom ? divRect.bottom - bodyRect.bottom : 0;
    
          console.log('Overflow X:', overflowX);
          console.log('Overflow Y:', overflowY);
        }
      }

      
    
    this.setState({
        // using the cursor location to set the tooltip.
        // todo: rethink  
      //  overflowX : pageX + 170 > window.innerWidth ? pageX + 170 - window.innerWidth : 0
      });

  }

  tooltipHover(e) {
    const tooltipBox: HTMLElement | null = document.getElementById('tooltiptext');

    // // Get the position of the div
    const box = tooltipBox != null && tooltipBox.getBoundingClientRect();
    const body = document.body;
    // const rect = box.getBoundingClientRect();
    console.log(box,'recccctt');
    // const bodyRect = body.getBoundingClientRect();

    // const overflowX = rect.right > bodyRect.right ? rect.right - bodyRect.right : 0;
    // const overflowY = rect.bottom > bodyRect.bottom ? rect.bottom - bodyRect.bottom : 0;
    // console.log('Overflow X:', overflowX);
    //   console.log('Overflow Y:', overflowY);
    // const { pageX } = e;
    // this.setState({
    //   saveLoc : pageX
    // });
    triggerEvent(
      "tooltipsHover",
      "Tooltips",
      "Hover",
      this.props.label,
      this.props.searchTerm,
      this.props.action
      );
    this.detectOverflow();
    // e.stopPropagation();
  }

  handleResize = (e) => {
    this.detectOverflow();
  };

  render() {
    const tabIndex = 0;
    const iconShape = "info-standard";
    const iconClass = "is-solid info-icon";
    return (
      <React.Fragment>
        <style>{tooltipCss}</style>
        <div
          id="tooltip"
          tabIndex={tabIndex}
          className="tooltip"
          onFocus={(e) => this.tooltipHover(e)}
          onMouseEnter={(e) => this.tooltipHover(e)}
          onClick={(e) => this.tooltipHover(e)}
        >
          <ClrIcon
            shape={iconShape}
            className={iconClass}
            style={{ width: 18, height: 18 }}
          />
          <span id="tooltiptext" className="tooltiptext">
            {getTooltip(this.props.tooltipKey).map((tooltip, index) => {
              if (index === 1 || index === 3) {
                return (
                  <span className="allofus-italics" key={index}>
                    {" "}
                    {tooltip}{" "}
                  </span>
                );
              } else {
                return tooltip;
              }
            })}
          </span>
        </div>
      </React.Fragment>
    );
  }
}
