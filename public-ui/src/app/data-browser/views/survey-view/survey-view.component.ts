import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { ISubscription } from 'rxjs/Subscription';
import { environment } from '../../../../environments/environment';
import {
  AchillesResult, DataBrowserService, DomainInfosAndSurveyModulesResponse, QuestionConcept,
  SurveyModule
} from '../../../../publicGenerated';
import { DbConfigService } from '../../../utils/db-config.service';
import { GraphType } from '../../../utils/enum-defs';
import { TooltipService } from '../../../utils/tooltip.service';

@Component({
  selector: 'app-survey-view',
  templateUrl: './survey-view.component.html',
  styleUrls: [
    '../../../styles/template.css',
    '../../../styles/cards.css',
    './survey-view.component.css'
  ]
})

export class SurveyViewComponent implements OnInit, OnDestroy {
  graphButtons = ['Sex Assigned at Birth', 'Age When Survey Was Taken'];
  domainId: string;
  title;
  subTitle;
  surveys: SurveyModule[] = [];
  survey;
  surveyConceptId;
  surveyResult: any;
  resultsComplete = false;
  questionFetchComplete = false;
  resultFetchComplete = false;
  surveyCountAnalysis: any;
  private subscriptions: ISubscription[] = [];
  loading = false;
  surveyPdfUrl = '/assets/surveys/' + this.surveyConceptId + '.pdf';
  surveyName: string;
  surveyDescription: string;
  conceptCodeTooltip: any;
  /* Have questions array for filtering and keep track of what answers the pick  */
  allQuestions: any = [];
  questions: any = [];
  analyses: any = [];
  questionResults: any = [];
  subQuestions: any = [];
  searchText: FormControl = new FormControl();
  searchMethod = 'or';
  /* Show answers toggle */
  showAnswer = {};
  surveyResultCount: any;
  prevSearchText = '';
  multipleAnswerSurveyQuestions = this.dbc.MULTIPLE_ANSWER_SURVEY_QUESTIONS;
  searchFromUrl: string;
  envDisplay: string;
  @ViewChild('chartElement') chartEl: ElementRef;
  @ViewChild('subChartElement1') subChartEl1: ElementRef;
  @ViewChild('subChartElement2') subChartEl2: ElementRef;
  fmhResultCount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: DataBrowserService,
    private tooltipText: TooltipService,
    public dbc: DbConfigService) {
    this.route.params.subscribe(params => {
      this.domainId = params.id.toLowerCase();
    });
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.prevSearchText = params.search;
        this.searchText.setValue(this.prevSearchText);
      } else {
        this.prevSearchText = '';
      }
    });
  }

  ngOnInit() {
    this.loadPage();
    this.envDisplay = environment.displayTag;
  }

  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
  }

  public loadPage() {
    if (!this.prevSearchText) {
      if (this.searchFromUrl) {
        this.prevSearchText = this.searchFromUrl;
        localStorage.setItem('searchText', this.searchFromUrl);
      } else {
        if (localStorage.getItem('searchText')) {
          this.prevSearchText = localStorage.getItem('searchText');
        } else {
          this.prevSearchText = '';
        }
      }
    }
    this.loading = true;
    const surveyObj = JSON.parse(localStorage.getItem('surveyModule'));
    if (surveyObj) {
      this.surveyConceptId = surveyObj.conceptId;
      this.surveyName = surveyObj.name;
      this.surveyDescription = surveyObj.description;
      this.getSurveyResults();
    } else {
      this.getThisSurvey();
    }
    this.setSurvey();
    this.searchText.setValue(this.prevSearchText);
    if (this.prevSearchText && this.prevSearchText != null) {
      this.router.navigate(
        ['survey/' + this.domainId.toLowerCase()],
        {
          queryParams: { search: this.searchText.value },
        }
      );
    }
    // Filter when text value changes
    this.subscriptions.push(
      this.searchText.valueChanges
        .debounceTime(1000)
        .distinctUntilChanged()
        .subscribe((query) => {
          // this.router.navigate(
          // ['survey/' + this.domainId.toLowerCase() + '/' + query]
          // );
          this.resetExpansion();
          this.filterResults();
        }));
    this.subscriptions.push(this.api.getDomainTotals(
      this.searchText.value, 1, 1).subscribe({
      next: results => {
        if (results.surveyModules.filter(x => x.conceptId === this.surveyConceptId).length > 0) {
          this.surveyResultCount = results.surveyModules.filter(
            x => x.conceptId === this.surveyConceptId)[0].questionCount;
        } else {
          if (!this.searchText.value) {
            this.surveyResultCount = this.survey.questionCount;
          } else {
            this.surveyResultCount = 0;
          }
        }
      }
    }));
    // Set to loading as long as they are typing
    this.subscriptions.push(this.searchText.valueChanges.subscribe(
      (query) => localStorage.setItem('searchText', query)));
    this.subscriptions.push(this.searchText.valueChanges
      .debounceTime(1000)
      .distinctUntilChanged()
      .switchMap((query) => this.api.getDomainTotals(query, 1, 1))
      .subscribe({
        next: results => {
          if (results.surveyModules.filter(x => x.conceptId === this.surveyConceptId).length > 0) {
            this.surveyResultCount = results.surveyModules.filter(
              x => x.conceptId === this.surveyConceptId)[0].questionCount;
          } else {
            if (this.searchText.value) {
              this.surveyResultCount = 0;
            } else {
              this.surveyResultCount = this.survey.questionCount;
            }
          }
        },
        error: err => {
          console.log('Error searching: ', err);
          this.loading = false;
        }
      }));

    this.subscriptions.push(this.api.getCountAnalysis(this.surveyConceptId, 'survey').subscribe(
      results => {
        this.surveyCountAnalysis = results;
        if (this.surveyCountAnalysis) {
          localStorage.setItem('surveyCountAnalysis', JSON.stringify(results));
        }
      }
    ));
  }

  public processSurveyQuestions(results: any) {
    this.surveyResult = results;
    this.survey = this.surveyResult.survey;
    this.surveyName = this.survey.name;
    // Add Did not answer to each question
    this.allQuestions = this.surveyResult.questions.items;
    this.questions = this.allQuestions.filter(r => r.sub === 0);
    this.subQuestions = this.allQuestions.filter(r => r.sub === 1);
    this.analyses = this.surveyResult.analyses.items;
    this.mapAnalysesToQuestions(this.allQuestions, this.analyses);
    // Add Did not answer to each question
    for (const q of this.questions) {
          this.showAnswer[q.conceptId] = false;
          this.questionResults[q.conceptId] = [];
          q.actualQuestionNumber = q.questionOrderNumber;
          q.graphToShow = GraphType.BiologicalSex;
          q.selectedAnalysis = q.genderAnalysis;
          q.graphDataToShow = 'Count';
          for (const r of q.countAnalysis.results) {
            if (r.hasSubQuestions === 1) {
                for (const sq1 of r.subQuestions) {
                    this.showAnswer[sq1.conceptId] = false;
                    this.questionResults[sq1.conceptId] = [];
                    sq1.actualQuestionNumber = sq1.questionOrderNumber;
                    sq1.graphToShow = GraphType.BiologicalSex;
                    sq1.selectedAnalysis = sq1.genderAnalysis;
                    sq1.graphDataToShow = 'Count';
                    for (const r1 of sq1.countAnalysis.results) {
                                if (r1.hasSubQuestions === 1) {
                                    for (const sq2 of r1.subQuestions) {
                                        this.showAnswer[sq2.conceptId] = false;
                                        this.questionResults[sq2.conceptId] = [];
                                        sq2.actualQuestionNumber = sq2.questionOrderNumber;
                                        sq2.graphToShow = GraphType.BiologicalSex;
                                        sq2.selectedAnalysis = sq2.genderAnalysis;
                                        sq2.graphDataToShow = 'Count';

                    }}}
                }
            }
          }
          this.processResults(q);
    }
    this.questions.sort((a1, a2) => {
      if (a1.actualQuestionNumber < a2.actualQuestionNumber) {
        return -1;
      }
      if (a1.actualQuestionNumber > a2.actualQuestionNumber) {
        return 1;
      }
      return 0;
    });

  }

  public processResults(q: any) {
    for (const a of q.countAnalysis.results) {
        this.addMissingResults(q, a, this.survey.participantCount);
        if (a.hasSubQuestions === 1) {
            for (const sq1 of a.subQuestions) {
                for (const sqa1 of sq1.countAnalysis.results) {
                    this.addMissingResults(sq1, sqa1, a.countValue);
                    if (sqa1.hasSubQuestions === 1) {
                        for (const sq2 of sqa1.subQuestions) {
                            for (const sqa2 of sq2.countAnalysis.results) {
                                this.addMissingResults(sq2, sqa2, sqa1.countValue);
                            }
                            sq2.countAnalysis.results.push(this.addDidNotAnswerResult
                            (sq2.conceptId, sq2.countAnalysis.results, sqa1.countValue));
                            sq2.countAnalysis.results.sort((a1, a2) => {
                                  if (a1.countValue > a2.countValue) {
                                    return -1;
                                  }
                                  if (a1.countValue < a2.countValue) {
                                    return 1;
                                  }
                                  return 0;
                                });
                        }
                    }
                }
                sq1.countAnalysis.results.push(this.addDidNotAnswerResult(
                sq1.conceptId, sq1.countAnalysis.results, a.countValue));
                sq1.countAnalysis.results.sort((a1, a2) => {
                      if (a1.countValue > a2.countValue) {
                        return -1;
                      }
                      if (a1.countValue < a2.countValue) {
                        return 1;
                      }
                      return 0;
                    });
            }
        }
    }

    q.countAnalysis.results.push(this.addDidNotAnswerResult(q.conceptId, q.countAnalysis.results,
    this.survey.participantCount));
    q.countAnalysis.results.sort((a1, a2) => {
      if (a1.countValue > a2.countValue) {
        return -1;
      }
      if (a1.countValue < a2.countValue) {
        return 1;
      }
      return 0;
    });
  }

  public addMissingResults(q: any, a: any, totalCount) {
    a.countPercent = this.countPercentage(a.countValue, totalCount);
    if (q.genderAnalysis) {
        this.addMissingBiologicalSexResults(q.genderAnalysis,
        q.genderAnalysis.results.
        filter(r => r.stratum3 !== null && r.stratum3 === a.stratum3),
        totalCount);
    }
    if (q.ageAnalysis) {
        this.addMissingAgeResults(q.ageAnalysis,
        q.ageAnalysis.results.filter(r => r.stratum3 !== null && r.stratum3 === a.stratum3),
        totalCount);
    }
  }

  private getSurveyResults() {
    if (this.surveyConceptId && this.surveyConceptId.toString()) {
      this.subscriptions.push(this.api.getSurveyQuestions(
      this.surveyConceptId.toString()).subscribe({
          next: x => {
            this.processSurveyQuestions(x);
            this.filterResults();
          },
          error: err => {
            console.error('Observer got an error: ' + err);
            this.loading = false;
          },
          complete: () => { this.questionFetchComplete = true; }
        }));
     this.subscriptions.push(this.api.getSurveyVersionCounts(
              this.surveyConceptId.toString()).subscribe({
                  next: x => {
                    // TODO process survey version counts
                  },
                  error: err => {
                    console.error('Observer got an error: ' + err);
                    this.loading = false;
                  },
                  complete: () => { }
      }));
    }
  }

  public setSurvey() {
    // Get the survey from local storage the user clicked on on a previous page
    const obj = localStorage.getItem('surveyModule');
    if (obj) {
      const survey = JSON.parse(obj);
      this.surveyConceptId = survey.conceptId;
      if (this.surveyConceptId === 43528895) {
        this.surveyPdfUrl = '/assets/surveys/' +
          'Health Care Access Utilization'.split(' ').join('_') + '.pdf';
      } else {
        this.surveyPdfUrl = '/assets/surveys/' + survey.name.split(' ').join('_') + '.pdf';
      }
      this.getSurveyResults();
    }
  }
  // get the current survey  by its route
  public getThisSurvey() {
    this.subscriptions.push(
      this.api.getDomainTotals(this.searchText.value, 1, 1).subscribe(
        (data: DomainInfosAndSurveyModulesResponse) => {
          data.surveyModules.forEach(survey => {
            const surveyRoute = survey.name.replace(' ', '-').toLowerCase();
            if (surveyRoute === this.domainId) {
              localStorage.setItem('surveyModule', JSON.stringify(survey));
              this.setSurvey();
            }
          });
          if (data.surveyModules.filter(x => x.conceptId === this.surveyConceptId).length > 0) {
            this.surveyResultCount = data.surveyModules.filter(
              x => x.conceptId === this.surveyConceptId)[0].questionCount;
          } else {
            this.surveyResultCount = 0;
          }
        })
    );
  }

  public mapAnalysesToQuestions (questions, analyses) {
    const countAnalysisResults = {};
    const genderAnalysisResults = {};
    const ageAnalysisResults = {};

    let countAnalysis = null;
    let genderAnalysis = null;
    let ageAnalysis = null;

    for (const a of analyses) {
      if (a.analysisId === 3110) {
        if (!countAnalysis) {
            countAnalysis = {...a};
        }
        for (const r of a.results) {
            r.countPercent = this.countPercentage(r.countValue, this.survey.participantCount);
            const question = (r.stratum6 && r.stratum6.length !== 0 && r.stratum6.trim()) ?
            this.allQuestions.filter(x => String(x.conceptId) === r.stratum2 &&
            x.path === r.stratum6)[0] : this.allQuestions.filter(x => String(x.conceptId)
            === r.stratum2)[0];
            const qId = question.conceptId + '_' + question.path;
            if (qId in countAnalysisResults) {
                countAnalysisResults[qId].push(r);
            } else {
                countAnalysisResults[qId] = [r];
           }
        }
      }
      if (a.analysisId === 3111) {
        if (!genderAnalysis) {
           genderAnalysis = {...a};
        }
          for (const r of a.results) {
              if (r.analysisStratumName === '' || r.analysisStratumName == null ||
              !r.analysisStratumName) {
                  r.analysisStratumName = this.dbc.GENDER_STRATUM_MAP[r.stratum5];
              }
              const question = this.allQuestions.filter(x => String(x.conceptId) === r.stratum2 &&
              x.path === r.stratum6)[0];
              const qId = question.conceptId + '_' + question.path;
              if (qId in genderAnalysisResults) {
                  genderAnalysisResults[qId].push(r);
              } else {
                  genderAnalysisResults[qId] = [r];
             }
          }
      }
      if (a.analysisId === 3112) {
        if (!ageAnalysis) {
           ageAnalysis = {...a};
        }
        for (const r of a.results) {
            if (this.dbc.VALID_AGE_DECILES.indexOf(r.stratum5) > -1) {
                if (r.analysisStratumName === '' || r.analysisStratumName == null ||
                !r.analysisStratumName) {
                    r.analysisStratumName = this.dbc.AGE_STRATUM_MAP[r.stratum5];
                }
                const q = this.allQuestions.filter(que => String(que.conceptId) === r.stratum2
                 && que.path === r.stratum6)[0];
                const questionId = q.conceptId + '_' + q.path;
                if (questionId in ageAnalysisResults) {
                    ageAnalysisResults[questionId].push(r);
                } else {
                    ageAnalysisResults[questionId] = [r];
               }
            }
        }
      }
     }
    for (const q of questions) {
        const tempCountAnalysis = {...countAnalysis};
        tempCountAnalysis.results = countAnalysisResults[q.conceptId + '_' + q.path];
        q.countAnalysis = tempCountAnalysis;

        const tempGenderAnalysis = {...genderAnalysis};
        tempGenderAnalysis.results = genderAnalysisResults[q.conceptId + '_' + q.path];
        q.genderAnalysis = tempGenderAnalysis;

        const tempAgeAnalysis = {...ageAnalysis};
        tempAgeAnalysis.results = ageAnalysisResults[q.conceptId + '_' + q.path];
        q.ageAnalysis = tempAgeAnalysis;
    }
    for (const q of this.subQuestions) {
        const path_split = q.path.split('.');
        const question_id = path_split.length === 3 ? path_split[0] : path_split[2];
        const result_id = path_split.length === 3 ? path_split[1] : path_split[3];
        const result_filter = analyses.filter(a => a.analysisId === 3110)[0].results.filter(
        a => a.stratum3 === result_id && a.stratum2 === question_id);
        if (result_filter) {
            result_filter[0].hasSubQuestions = 1;
            if (result_filter[0].subQuestions) {
                result_filter[0].subQuestions.push(q);
            } else {
                result_filter[0].subQuestions = [q];
            }
        }
    }
  }

  public countPercentage(countValue: number, totalCount: number) {
    if (!countValue || countValue <= 0) { return 0; }
    let percent: number = countValue / totalCount;
    percent = parseFloat(percent.toFixed(4));
    return percent * 100;
  }

  public filterResults() {
    if (this.searchText.value && this.searchText.value !== 'null') {
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams: { search: this.searchText.value },
          queryParamsHandling: 'merge'
        });
    } else {
      this.router.navigate(
        [],
        {
          relativeTo: this.route
        });
    }
    if (this.searchText.value) {
      this.dbc.triggerEvent('domainPageSearch', 'Search',
        'Search Inside Survey' + ' ' + this.survey.name, null, this.searchText.value, null);
    }
    localStorage.setItem('searchText', this.searchText.value);
    this.loading = true;
    if (this.surveyResult) {
      this.allQuestions = this.surveyResult.questions.items;
      this.questions     = this.allQuestions.filter(r => r.sub === 0);
      this.subQuestions = this.allQuestions.filter(r => r.sub === 1);
      this.analyses = this.surveyResult.analyses.items;
      this.questions.sort((a1, a2) => {
        if (a1.actualQuestionNumber < a2.actualQuestionNumber) {
          return -1;
        }
        if (a1.actualQuestionNumber > a2.actualQuestionNumber) {
          return 1;
        }
        return 0;
      });
    }
    if (this.searchText.value.length > 0) {
        // filter the questions and answers
        this.questions = this.questions.filter(this.searchQuestion, this);
    }
    this.loading = false;
  }

  public searchQuestion(q: any) {
      // Todo , match all words maybe instead of any. Or allow some operators such as 'OR' 'AND'
      const text = this.searchText.value;
      let words = text.split(new RegExp(',| | and | or '));
      words = words.filter(w => w.length > 0
        && w.toLowerCase() !== 'and'
        && w.toLowerCase() !== 'or');
      const reString = words.join('|');

      let searchFlag = false;

      const re = new RegExp(reString, 'gi');
      if (re.test(q.conceptName)) {
        searchFlag = true;
      }

      const results = q.countAnalysis.results.filter(r => re.test(r.stratum4));
      // Check if any of the sub questions in results or
      // results of sub questions contains the search term
      for (const rs of q.countAnalysis.results.filter(
        r => r.subQuestions !== null)) {
        if (rs.subQuestions && rs.subQuestions.length > 0) {
          for (const sq of rs.subQuestions) {
            if (re.test(sq.conceptName)) {
              q.expanded = true;
              this.showAnswer[q.conceptId] = true;
              rs.expanded = true;
              searchFlag = true;
            }
            if (sq.countAnalysis.results.filter(r => re.test(r.stratum4)).length > 0) {
              q.expanded = true;
              this.showAnswer[q.conceptId] = true;
              rs.expanded = true;
              searchFlag = true;
            }
            for (const rs2 of sq.countAnalysis.results.filter(
              r => r.subQuestions !== null)) {
              if (rs2.subQuestions && rs2.subQuestions.length > 0) {
                for (const sq2 of rs2.subQuestions) {
                  if (re.test(sq2.conceptName)) {
                    q.expanded = true;
                    this.showAnswer[q.conceptId] = true;
                    rs.expanded = true;
                    sq.subExpanded = true;
                    this.showAnswer[sq.conceptId] = true;
                    rs2.expanded = true;
                    searchFlag = true;
                  }
                  if (sq2.countAnalysis.results.filter(
                    r => re.test(r.stratum4)).length > 0) {
                    q.expanded = true;
                    this.showAnswer[q.conceptId] = true;
                    rs.expanded = true;
                    sq.subExpanded = true;
                    this.showAnswer[sq.conceptId] = true;
                    rs2.expanded = true;
                    sq2.subExpanded = true;
                    this.showAnswer[sq2.conceptId] = true;
                    searchFlag = true;
                  }
                }
              }
            }
          }
        }
      }
      if (results.length > 0 || searchFlag === true) {
        return true;
      }
      return false ;
    }

  public toggleAnswer(q: any) {
    if (!this.showAnswer[q.conceptId]) {
      this.showAnswer[q.conceptId] = true;
      q.expanded = true;
    } else {
      this.showAnswer[q.conceptId] = false;
      q.expanded = false;
    }
    if (this.showAnswer[q.conceptId]) {
      this.dbc.triggerEvent('conceptClick', 'Survey Question',
        'Expand to see answers',
        this.survey.name + ' - Q' + q.actualQuestionNumber + ' - '
        + q.conceptName, this.prevSearchText, null);
    }
  }

  public showAnswerGraphs(a: any, q: any) {
    q.selectedResult = a;
    q.selectedAnalysis = q.genderAnalysis;
    a.expanded = !a.expanded;
    if (a.expanded) {
      if (a.stratum4.toLowerCase().indexOf('more than one race') > -1) {
        this.dbc.triggerEvent('conceptClick', 'More than one race/ethnicity view graphs',
          'Expand to see graphs', this.survey.name + ' - Q'
          + q.actualQuestionNumber + ' - ' + q.conceptName + ' - ' + a.stratum4
          , this.prevSearchText, null);
      }
      this.dbc.triggerEvent('conceptClick', 'View Graphs',
        'Expand to see graphs', this.survey.name + ' - Q'
        + q.actualQuestionNumber + ' - ' + q.conceptName + ' - ' + a.stratum4 +
        ' - ' + ' Icon', this.prevSearchText, null);
      this.dbc.triggerEvent('conceptClick', 'View Graphs',
        'Expand to see graphs', this.survey.name + ' - Q'
        + q.actualQuestionNumber + ' - ' + q.conceptName + ' - ' + a.stratum4 +
        ' - ' + 'Sex Assigned at Birth', this.prevSearchText, null);
    }
  }

  public showSubAnswerGraphs(sqa: any, sq: any) {
    sqa.subExpanded = !sqa.subExpanded;
    if (sqa.subExpanded) {
      this.dbc.triggerEvent('conceptClick', 'View Graphs',
        'Expand to see graphs', this.survey.name + ' - Q'
        + sq.actualQuestionNumber + ' - ' + sq.conceptName + ' - ' + sqa.stratum4 +
        ' - ' + ' Icon', this.prevSearchText, null);
      this.dbc.triggerEvent('conceptClick', 'View Graphs',
        'Expand to see graphs', this.survey.name + ' - Q'
        + sq.actualQuestionNumber + ' - ' + sq.conceptName + ' - ' + sqa.stratum4 +
        ' - ' + 'Sex Assigned at Birth', this.prevSearchText, null);
    }
  }

  public changeResults(e) {
    this.loadPage();
  }

  public changeAutoInsertText(q: QuestionConcept) {
    if (q.conceptId === 1585704) {
      q.conceptName = q.conceptName.replace('[INSERT LANGUAGE FROM SU01j]', '');
    }
    return q.conceptName;
  }

  public addDidNotAnswerResult(questionConceptId: any, results: any[], participantCount: number) {
    let didNotAnswerCount = participantCount;
    for (const r of results) {
      didNotAnswerCount = didNotAnswerCount - r.countValue;
    }
    const result = results[0];
    if (didNotAnswerCount <= 0) {
      didNotAnswerCount = 20;
    }
    const notAnswerPercent = this.countPercentage(didNotAnswerCount, participantCount);
    const didNotAnswerResult = {
      analysisId: result.analysisId,
      countValue: didNotAnswerCount,
      countPercent: notAnswerPercent,
      stratum1: result.stratum1,
      stratum2: result.stratum2,
      stratum3: '0',
      stratum4: 'Did not answer',
      stratum5: result.stratum5,
      stratum6: result.stratum6,
    };
    return didNotAnswerResult;
  }

  public downloadPdf() {
    this.dbc.triggerEvent('surveyPdfDownload', 'Download',
      'Survey ' + ' ' + this.survey.name + ' pdf download', null, null, null);
  }

  public addMissingBiologicalSexResults(genderAnalysis: any, results: any, totalCount: number) {
    const uniqueGenderStratums: string[] = [];
    const fullGenderStratums = ['8507', '8532', '0'];
    for (const result of results) {
      if (uniqueGenderStratums.indexOf(result.stratum5) <= -1) {
        uniqueGenderStratums.push(result.stratum5);
      }
    }
    const missingGenderStratums = fullGenderStratums.
      filter(item => uniqueGenderStratums.indexOf(item) < 0);
    for (const missingStratum of missingGenderStratums) {
      if (results.length > 0) {
        const missingResult = {
          analysisId: genderAnalysis.analysisId,
          countValue: 20,
          countPercent: this.countPercentage(20, totalCount),
          stratum1: results[0].stratum1,
          stratum2: results[0].stratum2,
          stratum3: results[0].stratum3,
          stratum4: results[0].stratum4,
          stratum5: missingStratum,
          stratum6: results[0].stratum6,
          analysisStratumName: this.dbc.GENDER_STRATUM_MAP[missingStratum]
        };
        genderAnalysis.results.push(missingResult);
      }
    }
  }

  public addMissingAgeResults(ageAnalysis: any, results: any, totalCount: number) {
    const uniqueAgeStratums: string[] = [];
    const fullAgeStratums = ['2', '3', '4', '5', '6', '7', '8', '9'];
    for (const result of results) {
      if (uniqueAgeStratums.indexOf(result.stratum5) <= -1) {
        uniqueAgeStratums.push(result.stratum5);
      }
    }
    const missingAgeStratums = fullAgeStratums.filter(item => uniqueAgeStratums.indexOf(item) < 0);
    for (const missingStratum of missingAgeStratums) {
      if (results.length > 0) {
        const missingResult = {
          analysisId: ageAnalysis.analysisId,
          countValue: 20,
          countPercent: this.countPercentage(20, totalCount),
          stratum1: results[0].stratum1,
          stratum2: results[0].stratum2,
          stratum3: results[0].stratum3,
          stratum4: results[0].stratum4,
          stratum5: missingStratum,
          stratum6: results[0].stratum6,
          analysisStratumName: this.dbc.AGE_STRATUM_MAP[missingStratum]
        };
        ageAnalysis.results.push(missingResult);
      }
    }
  }

  public getLabel(q: any, helpText: string) {
    return this.surveyName + ' - Q' + q.actualQuestionNumber + ' - ' + helpText;
  }

  public clearSearch() {
    this.searchText.setValue('');
  }

  public hasResults() {
    if (this.surveyConceptId === 43528698) {
      return (this.questions.length === 0 && this.surveyResultCount === 0);
    }
    return this.questions.length === 0;
  }

  public getMatchingQuestionCount() {
    return this.surveyResultCount;
  }

  public resetExpansion() {
    for (const q of this.questions) {
        q.expanded = false;

        for (const r of q.countAnalysis.results) {
            r.expanded = false;
            if (r.hasSubQuestions === 1) {
                for (const sq of r.subQuestions) {
                    sq.subExpanded = false;

                    for (const sr of sq.countAnalysis.results) {
                        sr.expanded = false;

                        if (sr.hasSubQuestions === 1) {
                            for (const sq2 of sr.subQuestions) {
                                sq2.subExpanded = false;
                            }
                        }
                    }
                }
            }
        }
    }
  }
}
