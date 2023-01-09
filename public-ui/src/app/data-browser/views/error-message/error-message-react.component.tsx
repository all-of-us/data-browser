import * as React from "react";

import { BaseReactWrapper } from "app/data-browser/base-react/base-react.wrapper";
import { ClrIcon } from "app/utils/clr-icon";

const css = `
.alert,
.alert-box,
.error-message {
  background-color: #f7981d;
  border-radius: 5px;
  border-color: #f7981d;
  color: white;
  display: inline-block;
  font-size: 1.25em;
  padding: 1%;
}
.alert-icon {
  color: white;
}
`;

interface Props {
  dataType: string;
}

export class ErrorMessageReactComponent extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { dataType } = this.props;
    return (
      <React.Fragment>
        <style>{css}</style>
        <div className="alert alert-box">
          <ClrIcon
            shape="alert-icon"
            className="exclamation-triangle"
            style={{ width: 26, height: 26 }}
          />
          <span className="alert-text">
            {dataType === "data"
              ? "Sorry, the data are currently unavailable. Please try refreshing the page or returning home."
              : "Sorry, the chart cannot be displayed. Please try refreshing the page"}
          </span>
        </div>
      </React.Fragment>
    );
  }
}