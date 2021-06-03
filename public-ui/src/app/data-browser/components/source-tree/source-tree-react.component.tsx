import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';

import { Component, Input } from '@angular/core';
import { dataBrowserApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
import * as React from 'react';

const styles = reactStyles({
    noChildren: {
        position: 'relative',
        marginRight: '1rem'
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
    blueText: {
        color: '#216fb4'
    },
    children: {
        marginLeft: '1.5em',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '.7rem'
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
        alignItems: 'flex-start',
        display: 'flex',
        textAlign: 'left'
    },
    treeRowChild: {
        alignItems: 'flex-start',
        display: 'flex',
        textAlign: 'left',
        marginLeft: '1em'
    },
    childNode: {
        marginLeft: '1em'
    },
    smallSpinner: {
        width: '.5rem',
        height: '.5rem'
    },
    loading: {
        marginTop: '0.1rem',
        left: '-.1rem'
    }
});


interface ChildState {
    isChildSelected: boolean;
    children: any;
}
interface ChildProps {
    id: number;
}

const ChildFetchingComponent = (
    class extends React.Component<ChildProps, ChildState> {
        constructor(props: ChildProps) {
            super(props);
            this.state = {
                isChildSelected: false,
                children: undefined
            };
        }

        childClick() {
            this.getChildren();
            this.setState({
                isChildSelected: !this.state.isChildSelected
            });
        }

        getChildren() {
            return dataBrowserApi().getCriteriaChildren(this.props.id).then(
                (data) => {
                    this.setState({ children: data.items });

                }
            );
        }

        componentDidMount() {
            this.getChildren();
        }

        render() {
            const { children } = this.state;
            return <React.Fragment>
                {children && children.map((child, index) => {
                    return <div key={index} style={styles.childNode}>
                        {/* tslint:disable-next-line:no-use-before-declare */}
                        <SourceTreeComponent node={child} />
                    </div>;
                })}
            </React.Fragment>;
        }

    });

interface SourceTreeProps {
    node: any;
    first?: boolean;
}

interface SourceTreeState {
    isConceptSelected: boolean;
    isHandelSelected: boolean;
    highlightId: number;
}

export const SourceTreeComponent = (
    class extends React.Component<SourceTreeProps, SourceTreeState> {
        constructor(props: SourceTreeProps) {
            super(props);
            this.state = {
                isConceptSelected: false,
                isHandelSelected: undefined,
                highlightId: undefined
            };
        }
        conceptClick() {
            localStorage.setItem('treeHighlight', this.props.node.id);
            this.setState({
                isConceptSelected: !this.state.isConceptSelected
            });
            this.getTreeHighlight();
        }
        getTreeHighlight() {
            this.setState({
                highlightId: parseInt(localStorage.getItem('treeHighlight') , 10)
            });
        }
        handleClick() {
            this.setState({
                isHandelSelected: !this.state.isHandelSelected
            });

        }
        componentDidMount() {
            // this.getTreeHighlight();
            this.setState({ isHandelSelected: this.props.first });

        }

        render() {
            const { node } = this.props;
            const { isHandelSelected, isConceptSelected, highlightId } = this.state;

            return <React.Fragment>
                <div style={styles.treeRow}>
                    {node.group ? <ClrIcon onClick={() => this.handleClick()} style={styles.handle} shape='caret' dir={isHandelSelected ? 'down' : 'right'} /> :
                    <span style={styles.childNode}></span>}
                    <span onClick={() => this.conceptClick()} style={(isConceptSelected && highlightId === node.id) ?
                         { ...styles.treeActive } : {}}>{node.name}</span>
                    <span style={styles.count}>{node.count}</span>
                </div>
                {(isHandelSelected && node.group && node.children) && node.children.map((child, index) => {
                    return <div key={index} style={styles.childNode}><SourceTreeComponent node={child} /></div>;
                })}
                {isHandelSelected && node.group && !node.children && <ChildFetchingComponent id={node.id} />}
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
