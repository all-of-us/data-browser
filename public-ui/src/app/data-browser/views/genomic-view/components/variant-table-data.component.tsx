
import * as React from 'react';

interface Props {
    tableData?: any;
    tableDataArr?: any[];
}


export class VariantTableDataComponent extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { tableData, tableDataArr } = this.props;
        return <React.Fragment>
            {(tableData && !tableDataArr) && <div>{tableData}</div>}
            {(!tableData && tableDataArr && tableDataArr.length > 0) && tableDataArr.map((item, index) => {
                return <div key={index}>{item}</div>;
            })}
        </React.Fragment>;
    }
}
