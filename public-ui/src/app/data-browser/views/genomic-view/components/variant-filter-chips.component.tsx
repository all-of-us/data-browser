import * as React from 'react';
import { reactStyles } from 'app/utils';
import { Chip } from './variant-search.component';
import { ELOOP } from 'constants';
import { GenomicFilters } from 'publicGenerated';

interface Props {
    filteredMetadata: GenomicFilters;
    onChange: Function;
}
interface State {
    chips: Array<any>;

}
export class VariantFilterChips extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            chips: []
        }
    }
    formatChips(filteredMetadata: GenomicFilters): Array<any> {
        let displayArr = [];
        for (const key in filteredMetadata) {
            if (Object.prototype.hasOwnProperty.call(filteredMetadata, key)) {
                const el = filteredMetadata[key];
                displayArr.push({ cat: key, data: el });

            }
        }
        return displayArr;
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps != this.props) {
            this.setState({ chips: this.formatChips(this.props.filteredMetadata) })
        }
    }


    render() {
        const { chips } = this.state;
        return <div>
            {chips.length > 0 && chips.map((el, count) => {
                if (Array.isArray(el.data)) {
                    return <span key={count}> {el.data.some((p) => p.checked) && <div style={{ border: '1px solid' }}>{el.cat}
                        {el.data.map((item, i) => {
                            return <div key={i}>{item.checked && <span >{item.option}</span>}</div>
                        })}
                    </div>}
                    </span>
                } else {
                    // return <span key={count}>{(el.data.checked && el.data.checked) && <div>{el.cat}<div>{el.data.min}+{el.data.max}</div></div>}</span>
                }

            })}
        </div>
    }
}