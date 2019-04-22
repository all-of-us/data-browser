import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  @ViewChild('chartElement') chartEl: ElementRef;
  @ViewChild('subChartElement1') subChartEl1: ElementRef;
  @ViewChild('subChartElement2') subChartEl2: ElementRef;

  constructor(private route: ActivatedRoute, private api: DataBrowserService,
    private tooltipText: TooltipService,
    public dbc: DbConfigService) {
    this.route.params.subscribe(params => {
      this.domainId = params.id.toLowerCase();
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
      this.prevSearchText = '';
      this.prevSearchText = localStorage.getItem('searchText');
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
    // Filter when text value changes
    this.subscriptions.push(
      this.searchText.valueChanges
        .debounceTime(400)
        .distinctUntilChanged()
        .subscribe((query) => { this.filterResults(); }));

    // Set to loading as long as they are typing
    this.subscriptions.push(this.searchText.valueChanges.subscribe(
      (query) => localStorage.setItem('searchText', query)));
  }

  private getSurveyResults() {
    this.subscriptions.push(this.api.getSurveyResults(this.surveyConceptId.toString()).subscribe({
      next: x => {
        this.surveyResult = x;
        this.survey = this.surveyResult.survey;
        this.surveyName = this.survey.name;
        // Add Did not answer to each question
        for (const q of this.surveyResult.items) {
          q.actualQuestionNumber = 0;
          if (q.questions && q.questions.length > 0) {
            q.actualQuestionNumber = q.questions[0]['questionOrderNumber'];
          }
          // Get did not answer count for question and count % for each answer
          // Todo -- add this to api maybe
          let didNotAnswerCount = this.survey.participantCount;
          q.selectedAnalysis = q.genderAnalysis;
          // TODO not displaying the branching logic of race/ ethnicity question for now,
          // might want to remove with when final decision on how to display them is made.
          for (const a of q.countAnalysis.surveyQuestionResults) {
            didNotAnswerCount = didNotAnswerCount - a.countValue;
            a.countPercent = this.countPercentage(a.countValue);
            if (a.subQuestions) {
              for (const subQuestion of a.subQuestions) {
                subQuestion.selectedAnalysis = subQuestion.genderAnalysis;
                for (const subResult of subQuestion.countAnalysis.surveyQuestionResults.
                  filter(r => r.subQuestions !== null && r.subQuestions.length > 0)) {
                  for (const question of subResult.subQuestions) {
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
              }
            }
          }
          const result = q.countAnalysis.surveyQuestionResults[0];
          if (didNotAnswerCount <= 0) {
            didNotAnswerCount = 20;
          }
          const notAnswerPercent = this.countPercentage(didNotAnswerCount);
          const didNotAnswerResult = {
            analysisId: result.analysisId,
            countValue: didNotAnswerCount,
            countPercent: notAnswerPercent,
            stratum1: result.stratum1,
            stratum2: result.stratum2,
            stratum3: result.stratum3,
            stratum4: 'Did not answer',
            stratum5: result.stratum5
          };
          q.countAnalysis.surveyQuestionResults.push(didNotAnswerResult);
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

  public countPercentage(countValue: number) {
    if (!countValue || countValue <= 0) { return 0; }
    let percent: number = countValue / this.survey.participantCount;
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
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'domainPageSearch',
        'category': 'Search Inside Domain' + ' ' + this.survey.name,
        'landingSearchTerm': this.searchText.value
      });
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'top100',
        'category': 'Top 100',
        'action': 'Click',
        'label': this.survey.name
      });
    }
    localStorage.setItem('searchText', this.searchText.value);
    this.loading = true;
    if (this.surveyResult) {
      this.questions = this.surveyResult.items;
    }
    if (this.searchText.value.length > 0) {
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

  public toggleAnswer(qid) {
    if (!this.showAnswer[qid]) {
      this.showAnswer[qid] = true;
    } else {
      this.showAnswer[qid] = false;
    }
  }

  public showAnswerGraphs(a: any) {
    a.expanded = !a.expanded;
  }

  public showSubAnswerGraphs(sqa: any) {
    sqa.subExpanded = !sqa.subExpanded;
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
}
