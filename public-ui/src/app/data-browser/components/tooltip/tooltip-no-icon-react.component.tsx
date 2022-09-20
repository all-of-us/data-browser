import * as React from "react";

import { Component, Input, ViewEncapsulation } from "@angular/core";

export const tooltipNoIconCss = `
.tooltip-no-icon {
    position: relative;
    display: inline-block;

}

.tooltip-no-icon .tooltiptext-no-icon {
    visibility: hidden;
    width: 150px;
    font-size: 14px;
    font-family: GothamBook, Arial, sans-serif;
    background-color: #FFFFFF;
    color: #302C71;
    text-align: left;
    border-spacing: 5px;
    padding: 5px;
    position: absolute;
    bottom: 100%;
    left: 10%;
    margin-top: 10%;
    margin-left: -50px;
    z-index: 110;
}

.tooltip-no-icon .tooltiptext-no-icon::after {
    content: " ";
    position: absolute;
    top: 100%;
    left: 75%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #302C71 transparent transparent transparent;
}

.tooltip-no-icon:hover .tooltiptext-no-icon {
    visibility: visible;
}

.tooltiptext-no-icon {
    margin: 3%;
    line-height: normal;
    outline: 2px solid #302C71;
    box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.15);
}
`;

interface Props {
  tooltipKey: string;
  text: string;
}

export class TooltipNoIconReactComponent extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  tooltipHover() {
  }

  render() {
    const tabIndex = 0;
    return (
      <React.Fragment>
        <style>{tooltipNoIconCss}</style>
        <div
          tabIndex={tabIndex}
          className="tooltip-no-icon"
        >
         {this.props.text}
          <span className="tooltiptext-no-icon">
           Click to copy
          </span>
        </div>
      </React.Fragment>
      );
  }
}

