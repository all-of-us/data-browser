import * as React from "react";

import { reactStyles } from "app/utils";

interface Props {
  category: string;
  filterItem: any;     // current { min, max, checked, ... }
  ogFilterItem: any;   // dataset defaults { min, max }
  onSliderChange: Function; // kept named the same as the slider for a drop-in swap
}

interface State {
  minStr: string; // raw text in the Min input (no commas while typing)
  maxStr: string; // raw text in the Max input
  minFocused: boolean;
  maxFocused: boolean;
}

const styles = reactStyles({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "0.75rem",
    padding: "0.5rem 0.5rem 0.5rem 1rem",
    fontSize: "0.8em",
    fontFamily: "GothamBook, Arial, Helvetica, sans-serif",
    color: "#262262",
  },
  field: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "0.25rem",
  },
  label: {
    fontFamily: "GothamBold, Arial, Helvetica, sans-serif",
  },
  input: {
    width: "5.5rem", // ~9 chars at this font size
    padding: "0.2rem 0.3rem",
    border: "1px solid rgba(74,74,74,0.4)",
    borderRadius: "2px",
    fontFamily: "GothamBook, Arial, Helvetica, sans-serif",
    fontSize: "1em",
    color: "#262262",
    textAlign: "center",
    background: "white",
    boxSizing: "border-box",
  },
  hint: {
    color: "#A8201A",
    fontSize: "0.7em",
    paddingLeft: "1rem",
    marginTop: "0.15rem",
    fontFamily: "GothamBook, Arial, Helvetica, sans-serif",
  },
});

const MAX_INPUT_CHARS = 9; // 9 digits with grouping → up to "999,999,999"

function isDecimalCategory(category: string): boolean {
  return category === "alleleFrequency";
}

function formatForDisplay(value: number, category: string): string {
  if (value == null || Number.isNaN(value)) {
    return "";
  }
  if (isDecimalCategory(category)) {
    // AF is 0..1, show up to 6 sig figs without commas
    return value < 1 ? +value.toFixed(6) + "" : value.toString();
  }
  // Integer with thousands separators
  return Math.round(value).toLocaleString("en-US");
}

function parseUserInput(raw: string, category: string): number | null {
  if (raw == null) {
    return null;
  }
  const cleaned = raw.replace(/,/g, "").trim();
  if (cleaned === "") {
    return null;
  }
  if (isDecimalCategory(category)) {
    // Allow optional leading "0." or "."
    if (!/^-?\d*\.?\d+$/.test(cleaned)) {
      return null;
    }
    const n = parseFloat(cleaned);
    return Number.isNaN(n) ? null : n;
  }
  if (!/^-?\d+$/.test(cleaned)) {
    return null;
  }
  const n = parseInt(cleaned, 10);
  return Number.isNaN(n) ? null : n;
}

export class SVVariantFilterInputsComponent extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    // Start with the current filter values formatted for display.
    this.state = {
      minStr: formatForDisplay(props.filterItem?.min, props.category),
      maxStr: formatForDisplay(props.filterItem?.max, props.category),
      minFocused: false,
      maxFocused: false,
    };
  }

  // When the parent resets (e.g. Clear button), refresh from props.
  componentDidUpdate(prevProps: Readonly<Props>) {
    const prevMin = prevProps.filterItem?.min;
    const prevMax = prevProps.filterItem?.max;
    const nextMin = this.props.filterItem?.min;
    const nextMax = this.props.filterItem?.max;

    // Only resync on external prop changes — not during user editing.
    if (prevMin !== nextMin && !this.state.minFocused) {
      this.setState({
        minStr: formatForDisplay(nextMin, this.props.category),
      });
    }
    if (prevMax !== nextMax && !this.state.maxFocused) {
      this.setState({
        maxStr: formatForDisplay(nextMax, this.props.category),
      });
    }
  }

  // While the user is typing we keep the raw string. We only validate on blur
  // or Enter, then notify the parent.
  handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // Allow digits, one optional decimal point (for AF), and grouping commas (will be stripped).
    const pattern = isDecimalCategory(this.props.category)
      ? /^[\d.,]*$/
      : /^[\d,]*$/;
    if (!pattern.test(v)) {
      return;
    }
    if (v.replace(/,/g, "").length > MAX_INPUT_CHARS) {
      return;
    }
    this.setState({ minStr: v });
  };

  handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    const pattern = isDecimalCategory(this.props.category)
      ? /^[\d.,]*$/
      : /^[\d,]*$/;
    if (!pattern.test(v)) {
      return;
    }
    if (v.replace(/,/g, "").length > MAX_INPUT_CHARS) {
      return;
    }
    this.setState({ maxStr: v });
  };

  // Commit: validate, format, push up.
  commit = () => {
    const { category, ogFilterItem, filterItem } = this.props;
    const parsedMin = parseUserInput(this.state.minStr, category);
    const parsedMax = parseUserInput(this.state.maxStr, category);

    // If the user cleared one side, fall back to the dataset default.
    const minVal = parsedMin == null ? ogFilterItem.min : parsedMin;
    const maxVal = parsedMax == null ? ogFilterItem.max : parsedMax;

    // Reformat what we display so it's tidy (commas, etc.).
    this.setState({
      minStr: formatForDisplay(minVal, category),
      maxStr: formatForDisplay(maxVal, category),
    });

    // Only notify the parent if the value actually changed.
    if (minVal !== filterItem.min || maxVal !== filterItem.max) {
      this.props.onSliderChange([minVal, maxVal]);
    }
  };

  handleMinBlur = () => {
    this.setState({ minFocused: false }, this.commit);
  };

  handleMaxBlur = () => {
    this.setState({ maxFocused: false }, this.commit);
  };

  handleMinFocus = () => {
    // Strip commas while editing for easier typing.
    this.setState({
      minFocused: true,
      minStr: this.state.minStr.replace(/,/g, ""),
    });
  };

  handleMaxFocus = () => {
    this.setState({
      maxFocused: true,
      maxStr: this.state.maxStr.replace(/,/g, ""),
    });
  };

  handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur(); // triggers commit
    }
  };

  render() {
    const { category, ogFilterItem } = this.props;
    const { minStr, maxStr } = this.state;

    const minPlaceholder = formatForDisplay(ogFilterItem.min, category);
    const maxPlaceholder = formatForDisplay(ogFilterItem.max, category);

    // Soft warning if user has typed an inverted range.
    const parsedMin = parseUserInput(minStr, category);
    const parsedMax = parseUserInput(maxStr, category);
    const inverted =
      parsedMin != null && parsedMax != null && parsedMin > parsedMax;

    return (
      <React.Fragment>
        <div style={styles.container}>
          <div style={styles.field}>
            <span style={styles.label}>Min:</span>
            <input
              type="text"
              inputMode={isDecimalCategory(category) ? "decimal" : "numeric"}
              style={styles.input}
              value={minStr}
              placeholder={minPlaceholder}
              maxLength={MAX_INPUT_CHARS + 4} // room for grouping commas while typing
              onChange={this.handleMinChange}
              onFocus={this.handleMinFocus}
              onBlur={this.handleMinBlur}
              onKeyDown={this.handleKeyDown}
              aria-label={`Minimum ${category}`}
            />
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Max:</span>
            <input
              type="text"
              inputMode={isDecimalCategory(category) ? "decimal" : "numeric"}
              style={styles.input}
              value={maxStr}
              placeholder={maxPlaceholder}
              maxLength={MAX_INPUT_CHARS + 4}
              onChange={this.handleMaxChange}
              onFocus={this.handleMaxFocus}
              onBlur={this.handleMaxBlur}
              onKeyDown={this.handleKeyDown}
              aria-label={`Maximum ${category}`}
            />
          </div>
        </div>
        {inverted && (
          <div style={styles.hint}>Min is greater than Max</div>
        )}
      </React.Fragment>
    );
  }
}