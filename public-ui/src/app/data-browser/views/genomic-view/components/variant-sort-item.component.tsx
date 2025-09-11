import * as React from "react";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { TooltipReactComponent } from "app/data-browser/components/tooltip/tooltip-react.component";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { SortMetadata } from "publicGenerated/fetch";

const styles = reactStyles({
});

const css = `
.tooltip {
    position: relative;
    display: inline-block;
}

.tooltip .tooltiptext {
    visibility: hidden;
    width: 185px;
    font-size: 14px;
    font-family: GothamBook, Arial, sans-serif;
    background-color: #FFFFFF;
    color: #302C71;
    text-align: left;
    border-spacing: 5px;
    padding: 5px;
    position: absolute;
    z-index: 9999;
    bottom: 125%;
    left: 10%;
}

.tooltip:focus .tooltiptext, .tooltip:hover .tooltiptext {
    visibility: visible;
}

.tooltiptext {
    margin: 3%;
    line-height: normal;
    outline: 2px solid #302C71;
    box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.15);
}
`;

interface Props {
  cleared: Boolean;
  onSortChange: Function;
  sortMetadata: SortMetadata;
}

interface State {
  sortMetadata: SortMetadata;
  filterCats: any[];
}

export class VariantSortItemComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sortMetadata: props.sortMetadata,
      filterCats: [
        { display: "Gene", field: "gene" },
        { display: "Consequence", field: "consequence" },
        { display: "Variant Type", field: "variantType" },
        { display: "ClinVar Significance", field: "clinicalSignificance" },
        { display: "Allele Count", field: "alleleCount" },
        { display: "Allele Number", field: "alleleNumber" },
        { display: "Allele Frequency", field: "alleleFrequency" },
        { display: "Homozygote Count", field: "homozygoteCount" },
      ],
    };
  }

  componentDidMount(): void {}

  render(): React.ReactNode {
    return <React.Fragment></React.Fragment>;
  }
}