import * as React from "react";
import { reactStyles } from "app/utils";
import { NavStore } from "app/utils/navigation";
import { css } from "./home-view-react.component"
import { TooltipReactComponent } from "app/data-browser/components/tooltip/tooltip-react.component";

const ctaCss = `
.cta-stat-layout {
  display:grid;
}`
interface Props {
  wgsSRParticipantCount: number;
  wgsLRParticipantCount: number;
  wgsSVParticipantCount: number;
  microarrayParticipantCount: number;

}
interface State {

}


export class GenomicCallToActionComponent extends React.Component<Props, State> {

  render() {
    const { wgsSRParticipantCount,
      wgsLRParticipantCount,
      wgsSVParticipantCount,
      microarrayParticipantCount } = this.props;
    return <React.Fragment>
      <style>{css} + {ctaCss}</style>
      <div onClick={() =>window.open("https://www.researchallofus.org/register/")} className="result-box">
        <div className="result-box-title">
          <span className="result-box-title-text">
            Genomic Data
          </span>
          <div>
            <TooltipReactComponent
              label="Homepage Tooltip Hover"
              action={"Hover on call to action tile tooltip"}
              tooltipKey={"genomicsCTA"}
              searchTerm=""
            />
          </div>
        </div>

      <div className="result-box-body">
          {wgsLRParticipantCount > 0 &&
            <span className="result-box-body-item hgc-count-text">
              <span>
                <strong> {wgsLRParticipantCount.toLocaleString()}</strong>{" "}
                participants in<br></br> the Long-Read WGS dataset
              </span>
            </span>}
          {wgsSVParticipantCount > 0 &&
            <span className="result-box-body-item hgc-count-text">
              <span>
                <strong> {wgsSVParticipantCount.toLocaleString()}</strong>{" "}
                participants in<br></br> the Structural Variants dataset
              </span>
            </span>}
          <span className="result-box-body-item hgc-count-text">
            <span>
              <strong> {microarrayParticipantCount.toLocaleString()}</strong>{" "}
              participants in<br></br> the Genotyping Arrays dataset
            </span>
          </span>
        </div>
        <div>
        <a href="https://www.researchallofus.org/register/" className="result-bottom-link">Register for access</a>
        </div>
      </div>

    </React.Fragment>
  }
}
