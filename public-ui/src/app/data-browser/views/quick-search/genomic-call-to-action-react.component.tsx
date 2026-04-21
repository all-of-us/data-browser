import * as React from "react";

import { TooltipReactComponent } from "app/data-browser/components/tooltip/tooltip-react.component";
import { triggerEvent } from "app/utils/google_analytics";

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
      wgsLRParticipantCount,
      wgsSVParticipantCount,
      microarrayParticipantCount,
    } = this.props;

    const registerUrl =
      "https://www.researchallofus.org/register/?utm_source=intra&utm_medium=DataBr&utm_campaign=gen_card";

    const rows: { count: number; label: string }[] = [];
    if (wgsLRParticipantCount > 0) {
      rows.push({
        count: wgsLRParticipantCount,
        label: "participants in the Long-Read WGS dataset",
      });
    }
    if (wgsSVParticipantCount > 0) {
      rows.push({
        count: wgsSVParticipantCount,
        label:
          "participants in the Short-Read WGS Structural Variants dataset",
      });
    }
    rows.push({
      count: microarrayParticipantCount,
      label: "participants in the Genotyping Arrays dataset",
    });

    return (
      <a
        className="workbench-card"
        href={registerUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          triggerEvent(
            "GenomicCallToActionClick",
            "Click",
            "Homepage Genomic CTA Card",
            "Genomic CTA Register",
            null,
            null
          )
        }
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
          {rows.map((row, idx) => (
            <span key={idx} className="workbench-card-body-item">
              <strong>{row.count.toLocaleString()}</strong> {row.label}
            </span>
          ))}
        </div>
        <div>
          <a
            href={registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="result-bottom-link"
            onClick={(e) => e.stopPropagation()}
          >
            Register for access
          </a>
        </div>
      </a>
    );
  }
}