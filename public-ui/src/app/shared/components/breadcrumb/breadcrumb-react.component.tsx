
import { Component, Input } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { reactStyles } from 'app/utils';
import { NavStore } from 'app/utils/navigation';
import { environment } from 'environments/environment';
import * as React from 'react';

const styles = reactStyles({
    preCrumb: {
        color: '#0079b8'
    },
    crumb: {
        color: '#2b266d'
    }

});

const css = `
    .crumb-container *{
        margin-right: 0.5em;
    }
    .crumb-container {
        margin-top:1em;
        display:block;
    }
`;

interface Props {
    domainName: string;
}


export const BreadCrumbComponent = (class extends React.Component<Props> {
    constructor(props: Props) {
        super(props);

    }

    render() {
        const { domainName } = this.props;
        return <React.Fragment>
            <style>{css}</style>
            <span className='crumb-container'>
                <a href={environment.researchAllOfUsUrl} style={styles.preCrumb}>Home</a>
                <span>{'>'}</span>
                <a onClick={() => NavStore.navigateByUrl('/')} style={domainName ? styles.preCrumb : styles.crumb}>Data Browser</a>
                {domainName && <React.Fragment><span>{'>'}</span>
                    <span style={styles.crumb}>{domainName}</span> </React.Fragment>}
            </span>
        </React.Fragment>;
    }

}
);

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'react-breadcrumbs',
    template: `<span #root></span>`
})

export class BreadCrumbWrapperComponent extends BaseReactWrapper {
    @Input() domainName: string;
    constructor() {
        super(BreadCrumbComponent, ['domainName']);
    }
}
