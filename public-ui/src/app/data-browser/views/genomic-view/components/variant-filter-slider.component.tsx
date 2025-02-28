import * as React from "react";

import { reactStyles } from "app/utils";

interface Props {
  min: Number;
  max: Number;
  ogFilterItem: any;
  onSliderChange: Function;
}

const styles = reactStyles({
  sliderFormat: { display: "flex" },
});

export class VariantFilterSliderComponent extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  render(): React.ReactNode {
    const { min, max, ogFilterItem } = this.props;
    return (
      <React.Fragment>
        <div style={styles.sliderFormat}>
          <input
            type={"range"}
            name={"min"}
            min={10}
            // value= {sliderValue.toString()}
            max={max.toString()}
            onChange={(e) => this.props.onSliderChange(e, false)}
          />
          <input
            min={min.toString()}
            max={400}
            type={"range"}
            name={"max"}
            onChange={(e) => this.props.onSliderChange(e, true)}
          />
        </div>
      </React.Fragment>
    );
  }
}
