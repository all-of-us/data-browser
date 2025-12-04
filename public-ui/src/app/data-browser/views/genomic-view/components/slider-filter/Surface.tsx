import * as React from "react";

import * as PropTypes from "prop-types";

export default function Surface({
  className = "",
  view = [1000, 500],
  trbl = [10, 10, 10, 10],
  style = {},
  children = null,
  ...other
}) {
  const paddingBottom = `${Math.round((view[1] / view[0]) * 100)}%`;

  // uses bottom-padding hack. See https://css-tricks.com/scale-svg/
  return (
    <div
      className={className}
      style={{
        ...style,
        position: "relative",
        width: "90%",
        height: "0px",
        padding: "11% 0",
      }}
      {...other}
    >
      <svg
        viewBox={`0 0 ${view[0] + 50} ${view[1]}`}
        style={{
          overflow: "visible",
          position: "absolute",
          width: "100%",
          height: "100%",
          left: 0,
          top: 0,
        }}
      >
        <g transform={`translate(${trbl[3]} ,${trbl[0]})`}>{children}</g>
      </svg>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.8em",
          width: "100%",
          paddingTop: "0.25rem",
        }}
      >
        <span>Min</span>
        <span>Max</span>
      </div>
    </div>
  );
}

Surface.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  trbl: PropTypes.array,
  view: PropTypes.array,
};