import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { ISubscription } from 'rxjs/Subscription';
import { environment } from '../../../environments/environment';
import { DataBrowserService, DomainInfosAndSurveyModulesResponse, QuestionConcept, SurveyModule } from '../../../publicGenerated';
import { DbConfigService } from '../../utils/db-config.service';
import { GraphType } from '../../utils/enum-defs';
import { TooltipService } from '../../utils/tooltip.service';

@Component({
  selector: 'app-survey-view',
  templateUrl: './survey-view.component.html',
  styleUrls: ['../../styles/template.css', '../../styles/cards.css', './survey-view.component.css']
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
  private subscriptions: ISubscription[] = [];
  loading = false;
  surveyPdfUrl = '/assets/surveys/' + this.surveyConceptId + '.pdf';
  surveyName: string;
  conceptCodeTooltip: any;
  /* Have questions array for filtering and keep track of what answers the pick  */
  questions: any = [];
  searchText: FormControl = new FormControl();
  searchMethod = 'or';
  /* Show answers toggle */
  showAnswer = {};
  prevSearchText = '';
  multipleAnswerSurveyQuestions = this.dbc.MULTIPLE_ANSWER_SURVEY_QUESTIONS;
  searchFromUrl: string;
  @ViewChild('chartElement') chartEl: ElementRef;
  @ViewChild('subChartElement1') subChartEl1: ElementRef;
  @ViewChild('subChartElement2') subChartEl2: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: DataBrowserService,
    private tooltipText: TooltipService,
    public dbc: DbConfigService) {
    this.route.params.subscribe(params => {
      this.domainId = params.id.toLowerCase();
      this.searchFromUrl = params.searchString;
    });
  }

  ngOnInit() {
    this.loadPage();
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
        this.prevSearchText = '';
        this.prevSearchText = localStorage.getItem('searchText');
      }
    }
    this.loading = true;
    const surveyObj = JSON.parse(localStorage.getItem('surveyModule'));
    if (surveyObj) {
      this.surveyConceptId = surveyObj.conceptId;
      this.getSurveyResults();
    } else {
      this.getThisSurvey();
    }
    this.setSurvey();
    this.searchText.setValue(this.prevSearchText);
    if (this.prevSearchText && this.prevSearchText != null) {
      this.router.navigate(
        ['survey/' + this.domainId.toLowerCase() + '/' + this.prevSearchText]
      );
    }
    // Filter when text value changes
    this.subscriptions.push(
      this.searchText.valueChanges
        .debounceTime(1500)
        .distinctUntilChanged()
        .subscribe((query) => {
          // this.router.navigate(
            // ['survey/' + this.domainId.toLowerCase() + '/' + query]
          // );
          this.filterResults();
        }));

    // Set to loading as long as they are typing
    this.subscriptions.push(this.searchText.valueChanges.subscribe(
      (query) => localStorage.setItem('searchText', query)));
  }

  private getSurveyResults() {
    if (this.surveyConceptId && this.surveyConceptId.toString()) {
      this.subscriptions.push(this.api.getSurveyResults(this.surveyConceptId.toString()).subscribe({
        next: x => {
          this.surveyResult = x;
          this.survey = this.surveyResult.survey;
          this.surveyName = this.survey.name;
          // Add Did not answer to each question
          for (const q of this.surveyResult.items) {
            q.actualQuestionNumber = 0;
            q.graphToShow = GraphType.BiologicalSex;
            if (q.questions && q.questions.length > 0) {
              q.actualQuestionNumber = q.questions[0]['questionOrderNumber'];
            }
            q.selectedAnalysis = q.genderAnalysis;
            // might want to remove with when final decision on how to display them is made.
            for (const a of q.countAnalysis.surveyQuestionResults) {
              a.countPercent = this.countPercentage(a.countValue, this.survey.participantCount);
              this.addMissingBiologicalSexResults(q.genderAnalysis,
                q.genderAnalysis.surveyQuestionResults.
                  filter(r => r.stratum3 !== null && r.stratum3 === a.stratum3),
                this.survey.participantCount);
              this.addMissingAgeResults(q.ageAnalysis,
                q.ageAnalysis.surveyQuestionResults.
                  filter(r => r.stratum3 !== null && r.stratum3 === a.stratum3),
                this.survey.participantCount);
              if (a.subQuestions) {
                for (const subQuestion of a.subQuestions) {
                  subQuestion.actualQuestionNumber = 0;
                  if (subQuestion.questions && subQuestion.questions.length > 0) {
                    subQuestion.actualQuestionNumber =
                      subQuestion.questions[0]['questionOrderNumber'];
                  }
                  subQuestion.graphToShow = GraphType.BiologicalSex;
                  subQuestion.selectedAnalysis = subQuestion.genderAnalysis;
                  subQuestion.countAnalysis.surveyQuestionResults =
                    subQuestion.countAnalysis.surveyQuestionResults.
                    filter(r => r.stratum6.indexOf(a.stratum3) > -1);
                  subQuestion.genderAnalysis.surveyQuestionResults =
                    subQuestion.genderAnalysis.surveyQuestionResults
                    .filter(r => r.stratum6.indexOf(a.stratum3) > -1);
                  subQuestion.ageAnalysis.surveyQuestionResults =
                    subQuestion.ageAnalysis.surveyQuestionResults
                    .filter(r => r.stratum6.indexOf(a.stratum3) > -1);
                  for (const subResult of subQuestion.countAnalysis.surveyQuestionResults.
                    filter(r => r.subQuestions !== null && r.subQuestions.length > 0)) {
                    for (const question of subResult.subQuestions) {
                      question.actualQuestionNumber = 0;
                      if (question.questions && question.questions.length > 0) {
                        question.actualQuestionNumber =
                          question.questions[0]['questionOrderNumber'];
                      }
                      question.countAnalysis.surveyQuestionResults =
                        question.countAnalysis.surveyQuestionResults.
                        filter(r => r.stratum6.indexOf(subResult.stratum3) > -1);
                      question.genderAnalysis.surveyQuestionResults =
                        question.genderAnalysis.surveyQuestionResults.
                      filter(r => r.stratum6.indexOf(subResult.stratum3) > -1);
                      question.ageAnalysis.surveyQuestionResults =
                        question.ageAnalysis.surveyQuestionResults.
                        filter(r => r.stratum6.indexOf(subResult.stratum3) > -1);
                      question.graphToShow = GraphType.BiologicalSex;
                      question.selectedAnalysis = question.genderAnalysis;
                      question.countAnalysis.surveyQuestionResults.sort((a1, a2) => {
                        if (a1.countValue > a2.countValue) {
                          return -1;
                        }
                        if (a1.countValue < a2.countValue) {
                          return 1;
                        }
                        return 0;
                      });
                      question.countAnalysis.surveyQuestionResults.push(
                        this.addDidNotAnswerResult(
                          question.countAnalysis.surveyQuestionResults, subResult.countValue)
                      );
                      for (const subResult2 of question.countAnalysis.surveyQuestionResults.
                        filter(r => r.subQuestions === null)) {
                        this.addMissingBiologicalSexResults(question.genderAnalysis,
                          question.genderAnalysis.surveyQuestionResults.
                            filter(r => r.stratum3 !== null && r.stratum3 === subResult2.stratum3),
                          subResult.countValue);
                        this.addMissingAgeResults(question.ageAnalysis,
                          question.ageAnalysis.surveyQuestionResults.
                            filter(r => r.stratum3 !== null && r.stratum3 === subResult2.stratum3),
                          subResult.countValue);
                      }
                    }
                  }
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
              }
            }
            q.countAnalysis.surveyQuestionResults.push(
              this.addDidNotAnswerResult(
                q.countAnalysis.surveyQuestionResults, this.survey.participantCount));
          }
          this.questions = this.surveyResult.items;
          // Sort count value desc
          for (const q of this.questions) {
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
          this.filterResults();
          this.loading = false;
        },
        error: err => {
          console.error('Observer got an error: ' + err);
          this.loading = false;
        },
        complete: () => { this.resultsComplete = true; }
      }));
    }
  }

  public setSurvey() {
    // Get the survey from local storage the user clicked on on a previous page
    const obj = localStorage.getItem('surveyModule');
    if (obj) {
      const survey = JSON.parse(obj);
      this.surveyConceptId = survey.conceptId;
      this.surveyPdfUrl = '/assets/surveys/' + survey.name.replace(' ', '_') + '.pdf';
      this.getSurveyResults();
    }
  }
  // get the current survey  by its route
  public getThisSurvey() {
    this.subscriptions.push(
      this.api.getDomainTotals(this.dbc.TO_SUPPRESS_PMS).subscribe(
        (data: DomainInfosAndSurveyModulesResponse) => {
          data.surveyModules.forEach(survey => {
            const surveyRoute = survey.name.replace(' ', '-').toLowerCase();
            if (surveyRoute === this.domainId) {
              localStorage.setItem('surveyModule', JSON.stringify(survey));
              this.setSurvey();
            }
          });
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
    if (this.searchText.value) {
      this.dbc.triggerEvent('domainPageSearch', 'Search',
        'Search Inside Survey' + ' ' + this.survey.name, null, this.searchText.value, null);
    }
    localStorage.setItem('searchText', this.searchText.value);
    this.loading = true;
    if (this.surveyResult) {
      this.questions = this.surveyResult.items;
    }
    if (this.searchText.value && this.searchText.value.length > 0) {
      this.questions = this.questions.filter(this.searchQuestion, this);
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
    if (!this.showAnswer[q.conceptId]) {
      this.showAnswer[q.conceptId] = true;
    } else {
      this.showAnswer[q.conceptId] = false;
    }
    if (this.showAnswer[q.conceptId]) {
      this.dbc.triggerEvent('conceptClick', 'Survey Question',
        'Expand to see answers',
        this.survey.name + ' - Q' + q.actualQuestionNumber + ' - '
        + q.conceptName, this.prevSearchText, null);
    }
  }

  public showAnswerGraphs(a: any, q: any) {
    a.expanded = !a.expanded;
    if (a.expanded) {
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
      stratum5: result.stratum5
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
          analysisStratumName: this.dbc.AGE_STRATUM_MAP[missingStratum]
        };
        ageAnalysis.surveyQuestionResults.push(missingResult);
      }
    }
  }

  public hoverOnTooltip(q: any, event: string) {
    this.dbc.triggerEvent('tooltipsHover', 'Tooltips', 'Hover',
      this.survey.name + ' - Q' + q.actualQuestionNumber + ' - '
      + event, null, 'Survey Page Tooltip');
  }
}
