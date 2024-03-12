import * as React from "react";
import { getTooltip } from "app/data-browser/services/tooltip.service";
import { ClrIcon } from "app/utils/clr-icon";
import { triggerEvent } from "app/utils/google_analytics";


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

// .tooltip .tooltiptext::after {
//     content: " ";
//     position: absolute;
//     top: 100%;
//     left: 50%;
//     margin-left: -5px;
//     border-width: 5px;
//     border-style: solid;
//     border-color: #302C71 transparent transparent transparent;
// }

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
interface State {
  overflowX: number;
  left: number;
}
export class TooltipReactComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      overflowX: 0,
      left: 0
    }
  }

  divRef: any = React.createRef();

  componentDidMount() {
    document.addEventListener('resize', this.tooltipHover);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.tooltipHover);
  }




  detectOverflow = () => {
    const div = this.divRef.current;
    const body = document.body;

    if (div && body) {
      const divRect = div.getBoundingClientRect();
      const bodyRect = body.getBoundingClientRect();
      if (divRect && bodyRect) {
        const overflowX = divRect.right + 150 > bodyRect.right ? divRect.right - bodyRect.right + 150 : 0;
        this.setState({
          overflowX: overflowX,
          left: divRect.left
        })
      }
    }
  }

  tooltipHover(e) {
    triggerEvent(
      "tooltipsHover",
      "Tooltips",
      "Hover",
      this.props.label,
      this.props.searchTerm,
      this.props.action
    );
    this.detectOverflow();
    e.stopPropagation();
  }

  handleResize = (e) => {
    this.detectOverflow();
  };

  render() {
    const tabIndex = 0;
    const iconShape = "info-standard";
    const iconClass = "is-solid info-icon";
    const { overflowX, left } = this.state;
    const move = overflowX > 0 ? -overflowX - 28 : 0;


    return (
      <React.Fragment>
        <style>{tooltipCss}</style>
        <div ref={this.divRef}
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
          <span style={{
            left: move
          }} id="tooltiptext" className="tooltiptext">
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
