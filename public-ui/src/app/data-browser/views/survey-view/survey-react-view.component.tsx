import { Component, Input } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { CdrVersionReactComponent } from 'app/data-browser/cdr-version/cdr-version-info';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { SearchComponent } from 'app/data-browser/search/home-search.component';
import { SurveyDescReactComponent } from 'app/data-browser/views/survey-view/survey-desc.component';
import { PopUpReactComponent } from 'app/shared/components/pop-up/PopUpReactComponent';
import { reactStyles } from 'app/utils';
import { GraphType } from 'app/utils/enum-metadata';
import { globalStyles } from 'app/utils/global-styles';
import { NavStore } from 'app/utils/navigation';
import { environment } from 'environments/environment';
import _ from 'lodash';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';

const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));

interface Props {
    domainId: string;
}

interface State {
    survey: any;
    surveyResultCount: any;
    surveyPdfUrl: any;
    isCopeSurvey: boolean;
    searchWord: string;
    extraQuestionConceptIds: Array<any>;
    showAnswer: {},
    questions: Array<any>;
}

export class SurveyViewReactComponent extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            isCopeSurvey: false,
            survey: null,
            surveyResultCount: 0,
            surveyPdfUrl: '',
            searchWord: '',
            extraQuestionConceptIds: [],
            showAnswer: {},
            questions: []
        };
    }

    componentDidMount() {
        this.fetchSurvey();
    }

    fetchSurvey() {
        api.getDomainTotals('', 1, 1).then(
                (data: any) => {
                  data.surveyModules.forEach(survey => {
                    const surveyRoute = survey.name.split(' ').join('-').toLowerCase();
                    if (surveyRoute.indexOf('(cope)') > -1) {
                        if (this.props.domainId && surveyRoute.indexOf(this.props.domainId) > -1) {
                            localStorage.setItem('surveyModule', JSON.stringify(survey));
                            this.setSurvey(JSON.stringify(survey));
                        }
                    } else {
                        if (surveyRoute === this.props.domainId) {
                            localStorage.setItem('surveyModule', JSON.stringify(survey));
                            this.setSurvey(JSON.stringify(survey));
                        }
                    }
                  });
                })
  }

  public setSurvey(surveyObj) {
    if (surveyObj) {
      const survey = JSON.parse(surveyObj);
      let surveyConceptId = survey.conceptId;
      let surveyPdfUrl = '';
      if (surveyConceptId === 43528895) {
        surveyPdfUrl = '/assets/surveys/' +
          'Health Care Access Utilization'.split(' ').join('_') + '.pdf';
      } else {
        surveyPdfUrl = '/assets/surveys/' + survey.name.split(' ').join('_') + '.pdf';
      }
      let extraConcepts = [];
      if (surveyConceptId === 11333342) {
        extraConcepts = ['43528515', '1384639', '43528634', '43528761', '43529158', '43529767', '43529272', '43529217', '702786', '43529966', '43529638', '43528764', '43528763', '43528649', '43528651', '43528650', '43528765'];
      }
      let copeFlag = surveyConceptId === 1333342 ? true: false;
      this.setState({survey: survey, surveyPdfUrl: surveyPdfUrl, isCopeSurvey: copeFlag, extraQuestionConceptIds: extraConcepts}, () => {
        this.getSurvey()});
    }
  }

  handleChange(val) {
    this.setState({ searchWord: val });
    this.search(val);
  }

  search = _.debounce((val) => this.getSurvey(), 1000);

  getSurvey() {
    api.getSurveyQuestions(this.state.survey.conceptId.toString(), this.state.searchWord, this.state.extraQuestionConceptIds).then(
        (x: any) => {
            this.processSurveyQuestions(x);
            console.log(x);
    })
  }

  processSurveyQuestions(results: any) {
    let survey = results.survey;
    let surveyName = results.survey.name;
    // Add Did not answer to each question
    let questions = results.questions.items;
    // Add Did not answer to each question
    this.setDefaults(questions, 0);
  }

  setDefaults(surveyQuestions: any, level: any) {
    for (const q of surveyQuestions) {
      // this.showAnswer[q.conceptId] = false;
      q.actualQuestionNumber = q.questionOrderNumber;
      if (this.state.isCopeSurvey) {
        q.graphToShow = GraphType.SurveyVersion;
        q.selectedAnalysis = q.versionAnalysis;
      } else {
        q.graphToShow = GraphType.BiologicalSex;
        q.selectedAnalysis = q.genderAnalysis;

      }
      q.graphDataToShow = 'Count';
      q.resultFetchComplete = false;
    }
    surveyQuestions.sort((a1, a2) => {
      if (a1.actualQuestionNumber < a2.actualQuestionNumber) {
        return -1;
      }
      if (a1.actualQuestionNumber > a2.actualQuestionNumber) {
        return 1;
      }
      return 0;
    });
    this.setState({questions: surveyQuestions});
  }


    render() {
        const {searchWord} = this.state;
        return <React.Fragment>
        <div className='survey-view'>
        { this.state.survey && <SurveyDescReactComponent surveyName={this.state.survey.name} isCopeSurvey={this.state.isCopeSurvey} surveyDescription={this.state.survey.description}/>
        }
        <div className='search-bar-container'>
            <SearchComponent value={searchWord} searchTitle=''
                onChange={(val) => this.handleChange(val)}
                onClear={() => this.handleChange('')} />
        </div>
        </div>
        </React.Fragment>;
    }
}

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'survey-react-view',
    template: `<span #root></span>`
})

export class SurveyViewWrapperComponent extends BaseReactWrapper {
    @Input() public domainId: string;
    constructor() {
        super(SurveyViewReactComponent, ['domainId']);
    }
}
