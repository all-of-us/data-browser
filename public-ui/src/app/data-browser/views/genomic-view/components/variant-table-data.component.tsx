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
    tableData?: any;
    tableDataArr?: any[];

}
// tslint:disable-next-line:no-empty-interface
interface State {

}


export class VariantTableDataComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        console.log(props);
        
    }

    render() {
        const { tableData, tableDataArr } = this.props;
        console.log(tableData,'tableDatas');
        
        return <React.Fragment>
            {(tableData && !tableDataArr) && <div>{tableData}</div>}
            {(!tableData && tableDataArr && tableDataArr.length > 0) && tableDataArr.map((item, index) => {                
                return <div key={index}>{item}</div>
            })}
        </React.Fragment>;
    }
}
