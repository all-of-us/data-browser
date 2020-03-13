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
  subQuestionFetchComplete = false;
  conceptCodeTooltip: any;
  /* Have questions array for filtering and keep track of what answers the pick  */
  questions: any = [];
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
    this.subscriptions.push(this.searchText.valueChanges
      .debounceTime(1000)
      .distinctUntilChanged()
      .switchMap((query) => this.api.getSurveyQuestions(this.surveyConceptId, query))
      .subscribe({
        next: results => {
          this.processSurveyQuestions(results);
          this.filterResults();
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
    for (const q of this.surveyResult.items) {
      this.showAnswer[q.conceptId] = false;
      q.actualQuestionNumber = 0;
      q.graphToShow = GraphType.BiologicalSex;
      q.selectedAnalysis = q.genderAnalysis;
      q.graphDataToShow = 'Count';
      q.questionResultFetchComplete = false;
      if (q.questions && q.questions.length > 0) {
        q.actualQuestionNumber = q.questions[0]['questionOrderNumber'];
      }
    }
    this.questions = this.surveyResult.items;
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

  public processSurveyQuestionResults(q) {
    q.graphToShow = GraphType.BiologicalSex;
    q.selectedAnalysis = q.genderAnalysis;
    q.graphDataToShow = 'Count';
    for (const a of q.countAnalysis.surveyQuestionResults) {
      a.countPercent = this.countPercentage(a.countValue, this.survey.participantCount);
      if (q.genderAnalysis) {
        this.addMissingBiologicalSexResults(q.genderAnalysis,
          q.genderAnalysis.surveyQuestionResults.
          filter(r => r.stratum3 !== null && r.stratum3 === a.stratum3),
          this.survey.participantCount);
      }
      if (q.ageAnalysis) {
        this.addMissingAgeResults(q.ageAnalysis,
          q.ageAnalysis.surveyQuestionResults.
          filter(r => r.stratum3 !== null && r.stratum3 === a.stratum3),
          this.survey.participantCount);
      }
      a.subQuestionFetchComplete = false;
    }
    q.countAnalysis.surveyQuestionResults.push(
      this.addDidNotAnswerResult(
        q.countAnalysis.surveyQuestionResults, this.survey.participantCount));
    q.countAnalysis.surveyQuestionResults.sort((a1, a2) => {
      if (a1.countValue > a2.countValue) {
        return -1;
      }
      if (a1.countValue < a2.countValue) {
        return 1;
      }
      return 0;
    });
  }

  private getSurveyResults() {
    if (this.surveyConceptId && this.surveyConceptId.toString()) {
      this.subscriptions.push(this.api.getSurveyQuestions(this.surveyConceptId.toString(),
        this.searchText.value).subscribe({
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

  public searchQuestion(q: QuestionConcept) {
    // Todo , match all words maybe instead of any. Or allow some operators such as 'OR' 'AND'
    const text = this.searchText.value;
    let words = text.split(new RegExp(',| | and | or '));
    words = words.filter(w => w.length > 0
      && w.toLowerCase() !== 'and'
      && w.toLowerCase() !== 'or');
    const reString = words.join('|');
    // If doing an and search match all words
    if (this.searchMethod === 'and') {
      for (const w of words) {
        if (q.conceptName.toLowerCase().indexOf(w.toLowerCase()) === -1 &&
          q.countAnalysis.surveyQuestionResults.filter(r =>
            r.stratum4.toLowerCase().indexOf(w.toLowerCase()) === -1)) {
          return false;
        }
      }
      // All words found in either question or answers
      return true;
    }
    // Or search
    const re = new RegExp(reString, 'gi');
    if (re.test(q.conceptName)) {
      return true;
    }
    const results = q.countAnalysis.surveyQuestionResults.filter(r => re.test(r.stratum4));
    // Check if any of the sub questions in results or
    // results of sub questions contains the search term
    for (const rs of q.countAnalysis.surveyQuestionResults.filter(
      r => r.subQuestions !== null)) {
      if (rs.subQuestions && rs.subQuestions.length > 0) {
        for (const sq of rs.subQuestions) {
          if (re.test(sq.conceptName)) {
            return true;
          }
          if (sq.countAnalysis.surveyQuestionResults.filter(r => re.test(r.stratum4)).length > 0) {
            return true;
          }
          for (const rs2 of sq.countAnalysis.surveyQuestionResults.filter(
            r => r.subQuestions !== null)) {
            if (rs2.subQuestions && rs2.subQuestions.length > 0) {
              for (const sq2 of rs2.subQuestions) {
                if (re.test(sq2.conceptName)) {
                  return true;
                }
                if (sq2.countAnalysis.surveyQuestionResults.filter(
                  r => re.test(r.stratum4)).length > 0) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    if (results.length > 0) {
      return true;
    }
    return false;
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
      this.questions = this.surveyResult.items;
    }
    this.loading = false;
  }

  public setSearchMethod(method: string, resetSearch: boolean = false) {
    this.searchMethod = method;
    if (resetSearch) {
      this.searchText.setValue('');
    }
    this.filterResults();
  }

  public toggleAnswer(q: any) {
    this.api.getMainSurveyQuestionResults(this.surveyConceptId, q.conceptId, q)
      .subscribe({
        next: results => {
          q.countAnalysis = results.countAnalysis;
          q.genderAnalysis = results.genderAnalysis;
          q.ageAnalysis = results.ageAnalysis;
          q.genderCountAnalysis = results.genderCountAnalysis;
          q.ageCountAnalysis = results.ageCountAnalysis;
          q.questionResultFetchComplete = true;
          this.processSurveyQuestionResults(q);
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

  public showAnswerGraphs(a: any, q: any) {
    if (a.hasSubQuestions === 0) {
      this.showGraph(a);
    } else if (a.hasSubQuestions === 1) {
      this.getSubQuestions(a, 1);
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

  public addDidNotAnswerResult(results: any[], participantCount: number) {
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
        genderAnalysis.surveyQuestionResults.push(missingResult);
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
        ageAnalysis.surveyQuestionResults.push(missingResult);
      }
    }
  }

  public getLabel(q: any, helpText: string) {
    return this.surveyName + ' - Q' + q.actualQuestionNumber + ' - ' + helpText;
  }

  public clearSearch() {
    this.searchText.setValue('');
  }

  public getSubQuestions(a: any, level: number) {
    this.api.getSurveyQuestionResults(a.stratum1, a.stratum2, a.stratum3, level)
      .subscribe({
        next: results => {
          a.subQuestions = results.items;
          for (const subQuestion of a.subQuestions) {
            subQuestion.selectedAnalysis = subQuestion.genderAnalysis;
            subQuestion.actualQuestionNumber = 0;
            if (subQuestion.questions && subQuestion.questions.length > 0) {
              subQuestion.actualQuestionNumber =
                subQuestion.questions[0]['questionOrderNumber'];
            }
            subQuestion.graphToShow = GraphType.BiologicalSex;
            subQuestion.graphDataToShow = 'Count';
            subQuestion.countAnalysis.surveyQuestionResults =
              subQuestion.countAnalysis.surveyQuestionResults.
                filter(r => r.stratum6.indexOf(a.stratum3) > -1);
            subQuestion.genderAnalysis.surveyQuestionResults =
              subQuestion.genderAnalysis.surveyQuestionResults
                .filter(r => r.stratum6.indexOf(a.stratum3) > -1);
            subQuestion.ageAnalysis.surveyQuestionResults =
              subQuestion.ageAnalysis.surveyQuestionResults
                .filter(r => r.stratum6.indexOf(a.stratum3) > -1);
            subQuestion.countAnalysis.surveyQuestionResults.sort((a1, a2) => {
              if (a1.countValue > a2.countValue) {
                return -1;
              }
              if (a1.countValue < a2.countValue) {
                return 1;
              }
              return 0;
            });
            subQuestion.countAnalysis.surveyQuestionResults.push(
              this.addDidNotAnswerResult(
                subQuestion.countAnalysis.surveyQuestionResults, a.countValue)
            );
            for (const subResult of subQuestion.countAnalysis.surveyQuestionResults.
              filter(r => r.subQuestions === null)) {
              this.addMissingBiologicalSexResults(subQuestion.genderAnalysis,
                subQuestion.genderAnalysis.surveyQuestionResults.
                  filter(r => r.stratum3 !== null && r.stratum3 === subResult.stratum3),
                a.countValue);
              this.addMissingAgeResults(subQuestion.ageAnalysis,
                subQuestion.ageAnalysis.surveyQuestionResults.
                  filter(r => r.stratum3 !== null && r.stratum3 === subResult.stratum3),
                a.countValue);
            }
          }
          a.subQuestionFetchComplete = true;
        },
        error: err => {
          console.log('Error searching: ', err);
          this.loading = false;
        }
      });
  }

  public showGraph(a) {
    a.subQuestionFetchComplete = true;
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
}
