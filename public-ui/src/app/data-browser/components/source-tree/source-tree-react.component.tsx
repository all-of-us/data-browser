import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { Component } from '@angular/core';
import { reactStyles } from 'app/utils';
import { NavStore } from 'app/utils/navigation';
import { environment } from 'environments/environment';
import * as React from 'react';

interface SourceTreeProps {

}

export const SourceTreeComponent = (
    class extends React.Component<SourceTreeProps, {}> {
        constructor(props: SourceTreeProps) {
            super(props)
        }
        render() {
            return <h1>sup boiiii</h1>
        }
    });

    @Component({
        // tslint:disable-next-line: component-selector
        selector: 'react-source-tree',
        template: `<span #root></span>`
    })
    export class SourceTreeWrapperComponent extends BaseReactWrapper {

    constructor() {
        super(SourceTreeComponent, []);
    }
}