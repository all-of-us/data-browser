import { reactStyles } from 'app/utils';
import * as React from 'react';


const styles = reactStyles({
    border: {
        // border: '1px solid',
        width: '100%',
        height:'100%',
        margin: '0'

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
                <span>I am Variant Row Expanded</span>
            </div>
        </React.Fragment>;
    }
}
