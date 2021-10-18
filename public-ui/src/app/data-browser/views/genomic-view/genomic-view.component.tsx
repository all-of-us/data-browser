import { withRouteData } from 'app/components/app-router';
import { GenomicOverviewComponent } from 'app/data-browser/views/genomic-view/components/genomic-overview.component';
import { reactStyles } from 'app/utils';
import * as React from 'react';
import { GenomicSearchComponent } from './components/genomic-search.component';
const styles = reactStyles({
    border: {
        border: '1px solid',
        margin: '1rem'
    }
});

 // tslint:disable-next-line:no-empty-interface
interface State {

}



export const GenomicViewComponent = withRouteData(class extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
    }

    render() {
        return <React.Fragment>
            <div style={styles.border}>
                <p>I am the Genomic Data View component</p>
                <GenomicOverviewComponent />
                <GenomicSearchComponent />
            </div>
        </React.Fragment>;
    }
});
