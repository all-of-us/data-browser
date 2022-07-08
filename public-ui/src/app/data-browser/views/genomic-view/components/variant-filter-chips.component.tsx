import * as React from 'react';
import { reactStyles } from 'app/utils';
import { Chip } from './variant-search.component';
import { ELOOP } from 'constants';
import { GenomicFilters } from 'publicGenerated';

interface Props {
    filteredMetadata: GenomicFilters;
    onChange:Function;
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

 componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    console.log(this.props.filteredMetadata,'end of the line');
   
    
 }


    render() {
        return <div>
            {/* {Array.isArray(chips) && chips.map((el, i) => {
                if (el) {
                    return <li key={i}>zxc{el.cat.display}</li>
                }
            })} */}
        </div>
    }
}