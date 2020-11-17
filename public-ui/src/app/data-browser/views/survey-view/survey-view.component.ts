import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Items } from '@clr/angular/data/datagrid/providers/items';
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
  title: string;
  subTitle: string;
  surveys: SurveyModule[] = [];
  survey: any;
  surveyConceptId: any;
  surveyResult: any;
  resultsComplete = false;
  questionFetchComplete = false;
  resultFetchComplete = false;
  surveyCountAnalysis: any;
  versionCountAnalyses: any;
  private subscriptions: ISubscription[] = [];
  loading = false;
  surveyPdfUrl = '/assets/surveys/' + this.surveyConceptId + '.pdf';
  surveyName: string;
  surveyDescription: string;
  conceptCodeTooltip: any;
  /* Have questions array for filtering and keep track of what answers the pick  */
  allQuestions: any = [];
  questions: any = [];
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
  showStatement: boolean;
  copeDisclaimer: string;
  copeFlag: boolean;
  isCopeSurvey = false;
  isCopeStacked = false;
  surveyVersions: any[] = [];
  AnswerChartInfo: any[] = [];

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
    this.copeDisclaimer = `<div class="cope-statement"><span class='cope-statement-body'>This optional survey was released to participants for completion
    at multiple time points during the COVID-19 pandemic. As a result, a participant may have
    multiple data points if they completed more than one survey.</span>
    <span class='cope-statement-body'>This survey has multiple versions. Even though most of the content is consistent between
    versions, some questions were modified.</span> <span class='cope-statement-box'><strong>Please Note:</strong><br> While these aggregate data are available
    in the Data Browser tool, to protect participant privacy, only select data will be available in the Registered Tier dataset (i.e., data describing COVID
    positive status will not be made available)</span></div>`;
  }



  ngOnInit() {
    this.loadPage();
    this.envDisplay = environment.displayTag;
    this.copeFlag = environment.copeFlag;
    this.isCopeStacked = environment.copeStacked;
    if (this.surveyConceptId === 1333342) {
      this.graphButtons.unshift('Survey Versions');
    }
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
      if (this.surveyConceptId === 1333342) { this.isCopeSurvey = true; }
      this.surveyName = surveyObj.name;
      this.surveyDescription = surveyObj.description;

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
          // this.resetExpansion();
        }));
    this.subscriptions.push(this.searchText.valueChanges
      .debounceTime(1000)
      .distinctUntilChanged()
      .switchMap((query) => this.api.getSurveyQuestions(this.surveyConceptId, query))
      .subscribe({
        next: results => {
          this.processSurveyQuestions(results);
        },
        error: err => {
          console.log('Error searching: ', err);
          this.loading = false;
        }
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
    this.questions = this.surveyResult.questions.items;
    // Add Did not answer to each question
    this.setDefaults(this.questions, 0);
  }

  public setDefaults(surveyQuestions: any, level: any) {
    for (const q of surveyQuestions) {
      this.showAnswer[q.conceptId] = false;
      this.questionResults[q.conceptId] = [];
      q.actualQuestionNumber = q.questionOrderNumber;
      if (this.isCopeSurvey) {
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
  }

  public processResults(q: any, totalCount: number) {
    q.countAnalysis.results = q.countAnalysis.results.filter(a => a.stratum6 === q.path);
    q.genderAnalysis.results = q.genderAnalysis.results.filter(a => a.stratum6 === q.path);
    q.ageAnalysis.results = q.ageAnalysis.results.filter(a => a.stratum6 === q.path);
    if (q.versionAnalysis && q.versionAnalysis.results) {
      q.versionAnalysis.results = q.versionAnalysis.results.filter(a => a.stratum6 === q.path);
    }
    q.countAnalysis.results.sort((a1, a2) => {
      if (a1.countValue > a2.countValue) {
        return -1;
      }
      if (a1.countValue < a2.countValue) {
        return 1;
      }
      return 0;
    });
    const answerCount = q.countAnalysis.results.length;
    q.countAnalysis.results.forEach((aCount, i) => {
      if (this.isCopeSurvey && this.isCopeStacked) {
        if (answerCount <= 8) {
          aCount['color'] = this.dbc.eightColors[i];
        } else if (answerCount > 8 && answerCount <= 10) {
          aCount['color'] = this.dbc.tenColors[i];
        } else if (answerCount <= 14) {
          aCount['color'] = this.dbc.fourteenColors[i];
        } else if (answerCount <= 18) {
          aCount['color'] = this.dbc.fourteenColors[i];
        } else if (answerCount > 18) {
          aCount['color'] = this.dbc.twentyFiveColors[i];
        }
        this.AnswerChartInfo.push({
          color: aCount.color,
          totalCount: aCount.countValue,
          answerId: aCount.stratum3,
          answserValue: aCount.stratum4
        })
        if (aCount.stratum7 && aCount.stratum7 === '1') {
          aCount.subQuestionFetchComplete = false;
        }
        this.addMissingResults(q, aCount, totalCount);
      }
    });
    q.countAnalysis.results.push(this.addDidNotAnswerResult(q.conceptId, q.countAnalysis.results,
      totalCount));

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
        this.surveyConceptId.toString(), this.searchText.value).subscribe({
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
      if (this.isCopeSurvey) {
        this.subscriptions.push(this.api.getSurveyVersionCounts(
          this.surveyConceptId.toString()).subscribe({
            next: x => {
              x.analyses.items.forEach(item => {
                item.results.forEach((result, i) => {
                  if (item.analysisId === 3400) {
                    this.surveyVersions.push(
                      {
                        monthName: result.stratum4,
                        monthNum: result.stratum3.split('/')[0],
                        participants: result.sourceCountValue,
                        numberOfQuestion: ''
                      });
                  } else if (item.analysisId === 3401) {
                    this.surveyVersions[i].numberOfQuestion = result.sourceCountValue;
                  }
                });
              });
            },
            error: err => {
              console.error('Observer got an error: ' + err);
              this.loading = false;
            },
            complete: () => { }
          }));
      }
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
      this.questions = this.surveyResult.questions.items;
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
    this.loading = false;
  }

  public getReString() {
    const text = this.searchText.value;
    let words = text.split(new RegExp(',| | and | or '));
    words = words.filter(w => w.length > 0
      && w.toLowerCase() !== 'and'
      && w.toLowerCase() !== 'or');
    const reString = words.join('|');
    const reExp = new RegExp(reString, 'gi');
    return reExp;
  }

  public checkMatch(text: any) {
    const re = this.getReString();
    if (re.test(text)) {
      return true;
    }
    return false;
  }

  public toggleAnswer(q: any, source: any, level: any) {
    this.api.getSurveyQuestionResults(this.surveyConceptId, q.conceptId, q.path)
      .subscribe({
        next: results => {
          q.countAnalysis = results.items.filter(a => a.analysisId === 3110)[0];
          q.genderAnalysis = results.items.filter(a => a.analysisId === 3111)[0];
          q.ageAnalysis = results.items.filter(a => a.analysisId === 3112)[0];
          q.versionAnalysis = results.items.filter(a => a.analysisId === 3113)[0];
          q.resultFetchComplete = true;
          this.processResults(q, this.survey.participantCount);
          this.versionCountAnalyses = q.versionAnalysis.results;
        },
        error: err => {
          console.log('Error searching: ', err);
          this.loading = false;
        }
      });
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

  public getSubQuestions(a: any, source: any, level: number) {
    if (!a.subQuestions) {
      a.loading = true;
      a.dots = true;
    }
    this.api.getSubQuestions(this.surveyConceptId, a.stratum2, a.stratum3, level)
      .subscribe({
        next: results => {
          a.subQuestions = results.questions.items;
          for (const q of a.subQuestions) {
            this.processResults(q, a.countValue);
          }
          this.setDefaults(a.subQuestions, level);
        },
        error: err => {
          console.log('Error searching: ', err);
        },
        complete: () => {
          a.subQuestionFetchComplete = true;
          a.loading = false;
          a.dots = false;
        }
      });
  }

  public showAnswerGraphs(a: any, q: any) {
    q.selectedResult = a;
    if (this.isCopeSurvey) {
      q.selectedAnalysis = q.versionAnalysis;
    } else {
      q.selectedAnalysis = q.genderAnalysis;
    }
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
      q.resultFetchComplete = false;
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
