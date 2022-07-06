import * as React from 'react';
import { reactStyles } from 'app/utils';
import { Chip } from './variant-search.component';
import { ELOOP } from 'constants';

interface Props {
    chips: Array<any>;
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
    console.log(this.props.chips,'end of the line');
    
 }


    render() {
        const { chips } = this.props;
        return <div>
            {Array.isArray(chips) && chips.map((el, i) => {
                if (el) {
                    return <li key={i}>{el.cat.display}</li>
                }
            })}
        </div>
    }
}