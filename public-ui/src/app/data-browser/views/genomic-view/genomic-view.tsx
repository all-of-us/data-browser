import * as React from 'react';
import { withRouteData } from 'app/components/app-router'

interface Props {

}

interface State {

}



export const GenomicViewComponent = withRouteData(class extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
    }
});
