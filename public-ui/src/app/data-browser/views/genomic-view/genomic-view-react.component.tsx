import {withRouteData} from 'app/components/app-router';
import { reactStyles } from 'app/utils';
import * as React from 'react';

const styles = reactStyles({
});

const styleCss = `
`;

export const GenomicViewReactComponent = withRouteData(class extends React.Component<{}, {}> {
       render() {
        return <React.Fragment>
                <style>{styleCss}</style>
                <div className='gene-container'>
                    <h1>Genomic Data</h1>
                </div>
               </React.Fragment>;
       }
});
