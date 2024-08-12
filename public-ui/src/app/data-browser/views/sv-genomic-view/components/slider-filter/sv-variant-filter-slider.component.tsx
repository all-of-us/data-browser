import * as React from "react";
import { Handles, Rail, Slider, Tracks } from "react-compound-slider";

import { Handle, SliderRail, Track } from "./slider-components"; // example render components - source below
import { dims, trbl, view } from "./slider-constants";
import Surface from "./Surface";

const sliderProps = {
  width: dims[0],
  height: dims[1],
  fill: "none",
  opacity: 0.5,
};
interface Props {
  category: string;
  filterItem: any;
  ogFilterItem: any;
  onSliderChange: Function;
}

interface State {
  domain: Array<any>;
  defaultValues: Array<any>;
  min: Number;
  max: Number;
}

export const SVVariantFilterSliderComponent = class extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      domain: [this.props.ogFilterItem.min, this.props.ogFilterItem.max],
      defaultValues: [this.props.filterItem.min, this.props.filterItem.max],
      min: this.props.filterItem.min,
      max: this.props.filterItem.max,
    };
  }

  onUpdate(vals) {
    this.props.onSliderChange(vals);
    this.setState({
      min: vals[0],
      max: vals[1],
    });
  }

  render() {
    const { domain, defaultValues } = this.state;
    const { filterItem, ogFilterItem, category } = this.props;
    return (
      <div
        style={{
          maxWidth: 600,
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Surface view={view} trbl={trbl}>
          <Slider
            mode={1}
            step={category === "alleleFrequency" ? 0.01 : 1}
            flatten
            domain={domain}
            component="rect"
            onUpdate={(e) => {
              this.onUpdate(e);
            }}
            rootProps={sliderProps}
            values={defaultValues}
          >
            <Rail>
              {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
            </Rail>
            {/* <Ticks>
            {({ ticks }) => (
              <g transform={`translate(0,${dims[1]})`}>
                {ticks.map(tick => (
                  <Tick count={2} key={tick.id} tick={tick} />
                ))}
              </g>
            )}
          </Ticks> */}
            <Tracks left={false} right={false}>
              {({ tracks, getTrackProps }) => (
                <g transform={`translate(0,${dims[1] / 2})`}>
                  {tracks.map(({ id, source, target }) => (
                    <Track
                      key={id}
                      source={source}
                      target={target}
                      getTrackProps={getTrackProps}
                    />
                  ))}
                </g>
              )}
            </Tracks>
            <Handles>
              {({ handles, getHandleProps }) => (
                <g transform={`translate(0,${dims[1] / 2})`}>
                  {handles.map((handle) => (
                    <Handle
                      key={handle.id}
                      handle={handle}
                      domain={domain}
                      category={category}
                      getHandleProps={getHandleProps}
                    />
                  ))}
                </g>
              )}
            </Handles>
          </Slider>
        </Surface>
      </div>
    );
  }
};
