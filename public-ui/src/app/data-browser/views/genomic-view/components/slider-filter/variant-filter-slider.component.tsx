import { reactStyles } from 'app/utils';
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./slider-components"; 
import { view, trbl, dims } from "./slider-constants";
import * as React from 'react';

interface Props {
    min: Number;
    max: Number;
    onSliderChange: Function;
}
const domain = [100, 500];
const defaultValues = [150, 300];
const styles = reactStyles({
    sliderFormat: { display: 'flex' }
});

export class VariantFilterSliderComponent extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
    }


    render(): React.ReactNode {
        const { min, max } = this.props;
        // const {sliderValue} = this.state

        return <React.Fragment>
            <div style={{ maxWidth: 600, textAlign: "center" }}>
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
              {({ ticks, getHandleProps }) => (
                <g transform={`translate(0,${dims[1]})`}>
                  {ticks.map(tick => (
                    <Tick key={tick.id} tick={tick} />
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
      </div>
        </React.Fragment>;
    }

}
