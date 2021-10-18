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
                    <div>
                    This section provides an overview of genomic data within the current <i>All of Us</i> dataset.
                    Researchers can use the Participants with Genomic Data page to view currently available genomic data by
                    participant-reported race/ethnicity, sex assigned at birth, and age. The Variant Search can be used for
                    preliminary exploration of genetic variant allele frequencies by with select annotations and genetic
                    ancestry associations.
                     </div>
                </div>
               </React.Fragment>;
       }
});
