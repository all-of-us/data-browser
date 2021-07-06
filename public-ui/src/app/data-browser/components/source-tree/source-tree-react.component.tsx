import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';

import { Component, Input } from '@angular/core';
import { dataBrowserApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
import * as React from 'react';

const styles = reactStyles({
    noChildren: {
        marginLeft: '1em',
        paddingLeft: '1em'
    },
    count: {
        backgroundColor: '#2991cf',
        color: 'white',
        borderRadius: '.5rem',
        fontSize: '.7em',
        padding: '0.125rem .5rem',
        marginLeft: '.25rem',
        alignSelf: 'center',
    },
    treeActive: {
        fontFamily: 'gothamBold,Arial, Helvetica, sans-serif',
        fontWeight: 'bold'
    },
    handle: {
        color: '#2991cf',
        transition: '.1s transform linear',
        marginTop: '0.1rem'
    },
    treeRow: {
        textAlign: 'left',
        marginLeft: '1em'
    },
    childNode: {
        marginLeft: '1em',
        display: 'block'
    }
});



interface SourceTreeProps {
    node: any;
    first?: boolean;
    conceptedClicked?: Function;
    selectedTreeConcept: number;
}

interface SourceTreeState {
    children: Array<any>;
    isHandelSelected: boolean;
}

export const SourceTreeComponent = (
    class extends React.Component<SourceTreeProps, SourceTreeState> {
        constructor(props: SourceTreeProps) {
            super(props);
            this.state = {
                children: undefined,
                isHandelSelected: undefined,
            };
        }
        handleClick() {
            this.setState({
                isHandelSelected: !this.state.isHandelSelected
            });
        }

        componentDidMount() {
            const { first, node } = this.props;
            this.setState({ isHandelSelected: first });
            if (node.group && !node.children && !this.state.children) {
                this.getChildren();
            }
        }

        getChildren() {
            dataBrowserApi().getCriteriaChildren(this.props.node.id).then(
                (data) => {
                    this.setState({ children: data.items });
                }
            );
        }

        render() {
            const { node, conceptedClicked, selectedTreeConcept } = this.props;
            const { children, isHandelSelected } = this.state;
            const nodeChildren = node.children || children;
            return <React.Fragment>
                <div style={node.group ? { ...styles.treeRow } : { ...styles.treeRow, ...styles.noChildren }}
                onClick={(e) => { e.stopPropagation(); }}>
                    {node.group && <ClrIcon onClick={(e) => { e.stopPropagation(); this.handleClick();}}
                    style={styles.handle} shape='caret' dir={isHandelSelected ? 'down' : 'right'} />}
                    <span onClick={(e) => {e.stopPropagation(); conceptedClicked(this.props.node); }}
                    style={(selectedTreeConcept === parseInt(node.conceptId, 10)) ?
                        { ...styles.treeActive } : {}}>{node.name}</span>
                    <span style={styles.count} onClick={(e) => {e.stopPropagation();
                    conceptedClicked(this.props.node); }}>{node.count}</span>
                </div>
                {(isHandelSelected && node.group && nodeChildren) && nodeChildren.map((child, index) =>
                    <div key={index} style={styles.childNode}>
                        <SourceTreeComponent
                            selectedTreeConcept={selectedTreeConcept}
                            conceptedClicked={conceptedClicked}
                            node={child} /></div>
                )}
            </React.Fragment>;
        }
    });

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'react-source-tree',
    template: `<span #root></span>`
})
export class SourceTreeWrapperComponent extends BaseReactWrapper {
    @Input() node: any;
    @Input() first: boolean;
    constructor() {
        super(SourceTreeComponent, ['node', 'first']);
    }
}
