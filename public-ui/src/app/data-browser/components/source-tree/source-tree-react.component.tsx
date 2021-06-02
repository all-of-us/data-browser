import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { Component, Input } from '@angular/core';
import { reactStyles } from 'app/utils';
import { NavStore } from 'app/utils/navigation';
import { environment } from 'environments/environment';
import { dataBrowserApi } from 'app/services/swagger-fetch-clients';
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
        transform: 'rotate(90deg)',
        transition: '.1s transform linear',
        marginTop: '0.1rem'
    },
    opened: {
        transition: '.1s transform linear',
        transform: 'rotate(180deg)'
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
})

const css = `
.hasChildren.opened::before {
    transition: .1s transform linear;
    transform: rotate(45deg);
}`

interface ChildState {
    isChildSelected: boolean;
    children: any;
}
interface ChildProps {
    count: number; any
    group: boolean;
    name: string;
    parentId: number;
    id: number;
}


const ChildNodeComponent = (
    class extends React.Component<ChildProps, ChildState> {
        constructor(props: ChildProps) {
            super(props)
            this.state = {
                isChildSelected: false,
                children: undefined
            }
        }

        childClick() {
            this.getChildren();
            this.setState({
                isChildSelected: !this.state.isChildSelected
            })
        }

        getChildren() {
            return dataBrowserApi().getCriteriaChildren(this.props.id).then(
                (data) => {
                    this.setState({ children: data.items })

                }
            )
        }

        componentDidMount() {
            this.getChildren();
        }

        render() {
            const { count, group, name, parentId } = this.props;
            const { children } = this.state;
            return <React.Fragment>
                {children && children.map((child, index) => {
                    return <div style={styles.childNode}><SourceTreeComponent node={child} /></div>
                })}
            </React.Fragment>
        }

    });




interface SourceTreeProps {
    node: any;
}

interface SourceTreeState {
    isNodeSelected: boolean;
}

export const SourceTreeComponent = (
    class extends React.Component<SourceTreeProps, SourceTreeState> {
        constructor(props: SourceTreeProps) {
            super(props)
            console.log(props);
            
            this.state = {
                isNodeSelected: false
            }

        }
        nodeClick() {
            this.setState({
                isNodeSelected: !this.state.isNodeSelected
            })

        }

        render() {
            const { node } = this.props;
            const { isNodeSelected } = this.state;
            return <React.Fragment>
                <div style={styles.treeRow} onClick={() => this.nodeClick()}>
                    {node.group ? <ClrIcon shape='caret' dir={isNodeSelected ? 'down' : 'right'} /> : <span style={styles.childNode}></span>} {node.name} {node.count}
                </div>

                {(isNodeSelected && node.group && node.children) && node.children.map((child, index) => {

                    return <div style={styles.childNode}><SourceTreeComponent node={child} /></div>


                })}
                {isNodeSelected && node.group && !node.children && <ChildNodeComponent {...node} />}

            </React.Fragment>
        }
    });

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'react-source-tree',
    template: `<span #root></span>`
})
export class SourceTreeWrapperComponent extends BaseReactWrapper {
    @Input() node: any;
    constructor() {
        super(SourceTreeComponent, ['node']);
    }
}