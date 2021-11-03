import { reactStyles } from 'app/utils';
import * as React from 'react';


const styles = reactStyles({
    border: {
        border: '1px solid',
        margin: '1rem'
    }
});


// tslint:disable-next-line:no-empty-interface
interface Props {
    closed:Function;
}
// tslint:disable-next-line:no-empty-interface
interface State {

}


export class VariantExpandedComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    handleClick(e) {

    }

    render() {
        return <React.Fragment>
            <div onClick={(e)=> this.props.closed(e)} style={styles.border}>
                <p>I am Variant Row Expanded</p>
            </div>
        </React.Fragment>;
    }
}
