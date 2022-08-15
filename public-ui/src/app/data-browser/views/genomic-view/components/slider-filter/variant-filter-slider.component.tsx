import * as React from "react";
import { render } from "react-dom";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./slider-components"; // example render components - source below
import { view, trbl, dims } from "./slider-constants";
import Surface from "./Surface";
import { number } from "prop-types";

const sliderProps = {
  width: dims[0],
  height: dims[1],
  fill: "none",
  opacity: 0.5,
  stroke: "red"
};
interface Props {
  min: number,
  max: number,
  onSliderChange: Function
}

const domain = [100, 500];
const defaultValues = [150, 300];

export const VariantFilterSliderComponent = (class extends React.Component<Props, {}> {
  constructor(props:Props){
    super(props);
  }
  onUpdate(vals) {
    console.log(vals);
  }

  render() {
    return <div style={{ maxWidth: 600, textAlign: "center" }}>
        <Surface view={view} trbl={trbl}>
          <Slider
            mode={1}
            step={1}
            flatten
            domain={domain}
            component="rect"
            onUpdate={this.onUpdate}
            rootProps={sliderProps}
            values={defaultValues}
          >
            <Rail>
              {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
            </Rail>
            <Ticks>
              {({ ticks }) => (
                <g transform={`translate(0,${dims[1]})`}>
                  {ticks.map(tick => (
                    <Tick count={2} key={tick.id} tick={tick} />
                  ))}
                </g>
              )}
            </Ticks>
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
                  {handles.map(handle => (
                    <Handle
                      key={handle.id}
                      handle={handle}
                      domain={domain}
                      getHandleProps={getHandleProps}
                    />
                  ))}
                </g>
              )}
            </Handles>
          </Slider>
        </Surface>
      </div>
  }
})
