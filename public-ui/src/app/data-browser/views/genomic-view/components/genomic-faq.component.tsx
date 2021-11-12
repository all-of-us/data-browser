import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
import * as React from 'react';

const styles = reactStyles({
    background: {
        zIndex: 10,
        width: '100vw',
        height: '100vw',
        background: 'black',
        opacity: 0.8,
        position: 'fixed',
        left: 0,
        top: 0
    },
    faqContainer: {
        position:'relative',
        width: '100%',
        background: 'white',
        left: '-5rem',
        top:'-7rem',
        padding: '.5em',
        paddingLeft: '2.5em',
        paddingRight: '2.5em',
        zIndex: 20
    },
    top: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '1.75em',
        width: '100%',
        margin: '0',
        paddingBottom: '.5rem',
    },
    question: {
        margin: '1em 0',
        fontWeight: 'bold'
    },
    answer: {
        marginBottom: '1.25em'
    }
});

// tslint:disable-next-line:no-empty-interface
interface Props {
    closed: Function;
}
// tslint:disable-next-line:no-empty-interface
interface State {
}

const css = `
`;

export class GenomicFaqComponent extends React.Component<Props, State> {
    faqWindow: any;
    constructor(props: Props) {
        super(props);
    }
    render() {
        return <React.Fragment>
            <style>{css}</style>
            <div style={styles.background}>           </div>
                <div style={styles.faqContainer} id='genomicsFaq' ref={this.faqWindow}>
                    <div style={styles.top}>
                        <span>Genomic FAQs: </span>
                        <div><ClrIcon onClick={(e) => this.props.closed()} className='exit' shape='window-close'
                            style={{ width: 40, height: 40, color: '#0079b8' }} /></div>
                    </div>
                    <div>
                        <div style={styles.question}><strong>How can the Variant Search be used?</strong></div>
                        <div style={styles.answer}>This data browser allows researchers to plan studies using
                            <em>All of Us</em> data. Using the Variant Search,
                            researchers can conduct preliminary exploration of allele frequencies by broad genetic ancestry categories
                            and can observe how patterns of variation might differ between groups with different genetic ancestries.
                            However, researchers may wish to conduct more in-depth studies about the association of genetic variants
                            with specific diseases across many populations. To conduct these studies,
                            researchers must request access to individual-level participant data, available through the Researcher Workbench.
                            All registered researchers must successfully complete a required training about responsibly using genetic ancestry,
                            race, and ethnicity data in their studies.</div>
                        <div style={styles.question}>
                            <strong>What is genetic ancestry?</strong>
                        </div>
                        <div style={styles.answer}>
                            Genetic ancestry shows where an individual’s ancestors might have lived hundreds of years ago.
                            This is because people whose ancestors lived in the same part of the world have similar patterns in their DNA.
                            By comparing an individual’s DNA to the DNA of people who know their ancestry, we can estimate where an
                            individual’s ancestors may have lived.
                        </div>
                        <div style={styles.question}>
                            <strong>How is genetic ancestry different from race and ethnicity?</strong>
                        </div>
                        <div style={styles.answer}>
                            Genetic ancestry is not the same as race and ethnicity. Race and ethnicity are concepts created by humans
                            and are not determined by DNA. They are usually based on physical features, such as skin color,
                            or shared language and culture.
                            People of the same race or ethnicity may share the same genetic ancestry, but this is not always the case.
                        </div>
                        <div style={styles.question}>
                            <strong>How does <em>All of Us</em> compute genetic ancestry?</strong>
                        </div>
                        <div style={styles.answer}>
                            <em>All of Us</em> carries out an analysis that clusters individuals into groups based on the shared patterns in their DNA.
                            This allows us to infer their genetic ancestry.
                        </div>
                        <div style={styles.question}>
                            <strong>What do the genetic ancestry categories in the Variant Search mean?</strong>
                        </div>
                        <div style={styles.answer}>
                            The genetic ancestry category labels correspond to geographic locations where the individuals’ ancestors
                            might have lived hundreds of years ago.
                        </div>
                        <div style={styles.question}>
                            <strong>What does the category ‘other’ mean?</strong>
                        </div>
                        <div style={styles.answer}>
                            This means that individuals did not neatly fit the patterns of any of the genetic ancestry groups that
                            we have displayed here. They may cluster with a different genetic ancestry group. Or they may not cluster
                            fully with any group displayed here.
                        </div>
                        <div style={styles.question}>
                            <strong>What are the limitations of the genetic ancestry analysis shown in the Variant Search?</strong>
                        </div>
                        <div style={styles.answer}>
                            This resource is intended to provide only a broad look at genetic variation by genetic ancestry,
                            but genetic ancestry is much more complex than what we convey in this browser. Genetic ancestry depends
                            on how groups have migrated over time and who individuals in those groups reproduced with. Individuals may
                            have a blend of multiple genetic ancestries. Genetic ancestry can be calculated at a more specific level
                            than the broad geographic regions shown here. Even at more specific levels, genetic ancestry categories are
                            by nature simplified. In reality, genetic ancestry varies on a continuum without neat categories.
                            None of this is captured by the Variant Search resource.
                        </div>
                    </div>
                </div>
        </React.Fragment>;
    }
}
