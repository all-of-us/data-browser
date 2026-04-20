import * as React from "react";

import { TooltipReactComponent } from "app/data-browser/components/tooltip/tooltip-react.component";

const ctaCss = `
.cta-stat-layout {
  display: grid;
}
.cta-line {
  display: block;
  font-family: GothamBook, Arial, sans-serif;
  font-size: 14px;
  color: #302c71;
  padding-bottom: 0.75em;
  line-height: 1.3;
}
.cta-line strong {
  font-weight: 700;
  font-size: 20px;
  display: inline-block;
  margin-right: 0.5em;
}
`;
interface Props {
  wgsSRParticipantCount: number;
  wgsLRParticipantCount: number;
  wgsSVParticipantCount: number;
  microarrayParticipantCount: number;
}
interface State {}

export class GenomicCallToActionComponent extends React.Component<
  Props,
  State
> {
  render() {
    const {
      wgsSRParticipantCount,
      wgsLRParticipantCount,
      wgsSVParticipantCount,
      microarrayParticipantCount,
    } = this.props;
    return (
      <React.Fragment>
        <style>{ctaCss}</style>
        <div
          onClick={() =>
            window.open(
              "https://www.researchallofus.org/register/?utm_source=intra&utm_medium=DataBr&utm_campaign=gen_card"
            )
          }
          className="result-box"
        >
          <div className="result-box-title">
            <span className="result-box-title-text">
              Genomic data only in Researcher Workbench
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
            {wgsLRParticipantCount > 0 && (
              <span className="cta-line">
                <strong>{wgsLRParticipantCount.toLocaleString()}</strong>{" "}
                Long-Read WGS
              </span>
            )}
            {wgsSVParticipantCount > 0 && (
              <span className="cta-line">
                <strong>{wgsSVParticipantCount.toLocaleString()}</strong>{" "}
                Short-Read WGS SVs
              </span>
            )}
            <span className="cta-line">
              <strong>{microarrayParticipantCount.toLocaleString()}</strong>{" "}
              Genotyping Arrays
            </span>
          </div>
          <div>
            <a href="#" className="result-bottom-link">
              Register for access
            </a>
          </div>
        </div>
      </React.Fragment>
    );
  }
}