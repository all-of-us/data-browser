import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription as ISubscription } from 'rxjs/internal/Subscription';
import { environment } from '../../../../environments/environment';
import {DataBrowserService} from '../../../../publicGenerated';
import {DbConfigService} from '../../../utils/db-config.service';
import {GraphType} from '../../../utils/enum-defs';
import {TooltipService} from '../../../utils/tooltip.service';

@Component({
  selector: 'app-fmh-view',
  templateUrl: './fmh-view.component.html',
  styleUrls: ['./fmh-view.component.css',
    '../../../styles/cards.css',
    '../../../styles/template.css',
    '../survey-view/survey-view.component.css']
})
export class FmhViewComponent implements OnInit {
  @Input() searchText: any;
  @Input() surveyCountAnalysis: any;
  conditionText: string;
  fmText: string;
  graphButtons = ['Sex Assigned at Birth', 'Age When Survey Was Taken'];
  conditionQuestions = [];
  conditionSubQuestions = [];
  fmQuestions = [];
  fmSubQuestions = [];
  analyses = [];
  questionResults: any = [];
  questionFetchComplete = false;
  testReact: boolean;
  @Input() participantCount: number;
  @Input() surveyName: number;
  questionOrder = {43528515: 1, 1384639: 2, 43528634: 3, 43528761: 4,
                   43529158: 5, 43529767: 6, 43529272: 7, 43529217: 8,
                   702786: 9, 43529966: 10, 43529638: 11};
  conditionQuestionConceptIds = ['43528515', '1384639', '43528634', '43528761', '43529158', '43529767', '43529272', '43529217', '702786', '43529966', '43529638'];
  fmQuestionConceptIds = ['43528764', '43528763', '43528649', '43528651', '43528650', '43528765'];

  showAnswer = {};
  loading = false;
  domainId: string;
  private subscriptions: ISubscription[] = [];

  constructor(private api: DataBrowserService, public dbc: DbConfigService,
              private tooltipText: TooltipService, private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.testReact = environment.testReact;
    this.conditionText = 'For participants who selected "A lot" or "Some" in the first question, ' +
      'view family history by medical condition and/or event';
    this.fmText = 'For participants who selected "A lot" or "Some" in the first question, ' +
      'view family history by family member below.';
    this.getSurveyResults();
     this.subscriptions.push(this.searchText.valueChanges
       .debounceTime(1000)
       .distinctUntilChanged()
       .switchMap((query) => this.api.getFMHQuestions(43528698,
         this.conditionQuestionConceptIds.concat(this.fmQuestionConceptIds),
         this.searchText.value).subscribe({
         next: x => {
             this.conditionQuestions = x.questions.items.filter
             (y => this.conditionQuestionConceptIds.includes(String(y.conceptId)));
             this.fmQuestions = x.questions.items.filter
             (y => this.fmQuestionConceptIds.includes(String(y.conceptId)));
             this.processQuestions(this.conditionQuestions);
             this.processQuestions(this.fmQuestions);
             this.sortQuestions();
             // this.resetExpansion();
             this.filterResults();
             },
         error: err => {
           console.log('Error searching: ', err);
           this.loading = false;
         }
       })));
  }

  private getSurveyResults() {
    this.subscriptions.push(this.api.getFMHQuestions(43528698,
      this.conditionQuestionConceptIds.concat(this.fmQuestionConceptIds),
      this.searchText.value).subscribe({
      next: x => {
        this.conditionQuestions = x.questions.items.filter
        (y => this.conditionQuestionConceptIds.includes(String(y.conceptId)));
        this.fmQuestions = x.questions.items.filter
        (y => this.fmQuestionConceptIds.includes(String(y.conceptId)));
        this.processQuestions(this.conditionQuestions);
        this.processQuestions(this.fmQuestions);
        this.sortQuestions();
        // this.resetExpansion();
        this.filterResults();
      },
      error: err => {
        console.error('Observer got an error: ' + err);
        this.loading = false;
      },
      complete: () => {
        this.questionFetchComplete = true;
      }
    }));
  }

  public sortQuestions() {
    this.conditionQuestions.sort((a1, a2) => {
                        if (a1.actualQuestionNumber < a2.actualQuestionNumber) {
                          return -1;
                        }
                        if (a1.actualQuestionNumber > a2.actualQuestionNumber) {
                          return 1;
                        }
                        return 0;
            });
    this.fmQuestions.sort((a1, a2) => {
                if (a1.actualQuestionNumber < a2.actualQuestionNumber) {
                  return -1;
                }
                if (a1.actualQuestionNumber > a2.actualQuestionNumber) {
                  return 1;
                }
                return 0;
              });
  }

  public processQuestions(results: any) {
    for (const q of results) {
          this.showAnswer[q.conceptId] = false;
          q.actualQuestionNumber = 0;
          q.graphToShow = GraphType.BiologicalSex;
          q.selectedAnalysis = q.genderAnalysis;
          q.graphDataToShow = 'Count';
          q.actualQuestionNumber = this.questionOrder[q.conceptId];
    }
  }

    public getSubQuestions(a: any, level: number) {
      if (!a.subQuestions) {
              a.loading = true;
              a.dots = true;
      }
      this.api.getFMHSurveyQuestionResults(a.stratum2, a.stratum3)
                .subscribe({
                  next: results => {
                    a.subQuestions = results.items;
                    for (const q of a.subQuestions) {
                      this.processResults(q, a.countValue);
                    }
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

  public toggleAnswer(q: any) {
  this.api.getSurveyQuestionResults(43528698, q.conceptId, q.path)
            .subscribe({
              next: results => {
                q.countAnalysis = results.items.filter(a => a.analysisId === 3110)[0];
                q.genderAnalysis = results.items.filter(a => a.analysisId === 3111)[0];
                q.ageAnalysis = results.items.filter(a => a.analysisId === 3112)[0];
                q.resultFetchComplete = true;
                this.processResults(q, this.participantCount);
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
        this.surveyName + ' - Q' + q.actualQuestionNumber + ' - '
        + q.conceptName, this.searchText.value, null);
    }
  }

  public processResults(q: any, totalCount: number) {
    q.countAnalysis.results = q.countAnalysis.results.filter(a => a.stratum6 === q.path);
    q.genderAnalysis.results = q.genderAnalysis.results.filter(a => a.stratum6 === q.path);
    q.ageAnalysis.results = q.ageAnalysis.results.filter(a => a.stratum6 === q.path);
    q.graphToShow = GraphType.BiologicalSex;
    q.selectedAnalysis = q.genderAnalysis;
    q.graphDataToShow = 'Count';

    for (const a of q.countAnalysis.results) {
            this.addMissingResults(q, a, totalCount);
    }

    q.countAnalysis.results.push(this.addDidNotAnswerResult
    (q.conceptId, q.countAnalysis.results, totalCount));
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


  public countPercentage(countValue: number, totalCount: number) {
    if (!countValue || countValue <= 0) { return 0; }
    let percent: number = countValue / totalCount;
    percent = parseFloat(percent.toFixed(4));
    return percent * 100;
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

  public showAnswerGraphs(a: any, q: any) {
    a.expanded = !a.expanded;
    if (a.expanded) {
      if (a.stratum4.toLowerCase().indexOf('more than one race') > -1) {
        this.dbc.triggerEvent('conceptClick', 'More than one race/ethnicity view graphs',
          'Expand to see graphs', this.surveyName + ' - Q'
          + q.actualQuestionNumber + ' - ' + q.conceptName + ' - ' + a.stratum4
          , this.searchText.value, null);
      }
      this.dbc.triggerEvent('conceptClick', 'View Graphs',
        'Expand to see graphs', this.surveyName + ' - Q'
        + q.actualQuestionNumber + ' - ' + q.conceptName + ' - ' + a.stratum4 +
        ' - ' + ' Icon', this.searchText.value, null);
      this.dbc.triggerEvent('conceptClick', 'View Graphs',
        'Expand to see graphs', this.surveyName + ' - Q'
        + q.actualQuestionNumber + ' - ' + q.conceptName + ' - ' + a.stratum4 +
        ' - ' + 'Sex Assigned at Birth', this.searchText.value, null);
    }
  }

  public showSubAnswerGraphs(sqa: any, sq: any) {
    sqa.subExpanded = !sqa.subExpanded;
    if (sqa.subExpanded) {
      this.dbc.triggerEvent('conceptClick', 'View Graphs',
        'Expand to see graphs', this.surveyName + ' - Q'
        + sq.actualQuestionNumber + ' - ' + sq.conceptName + ' - ' + sqa.stratum4 +
        ' - ' + ' Icon', this.searchText.value, null);
      this.dbc.triggerEvent('conceptClick', 'View Graphs',
        'Expand to see graphs', this.surveyName + ' - Q'
        + sq.actualQuestionNumber + ' - ' + sq.conceptName + ' - ' + sqa.stratum4 +
        ' - ' + 'Sex Assigned at Birth', this.searchText.value, null);
    }
  }

  public hoverOnTooltip(q: any, event: string) {
    this.dbc.triggerEvent('tooltipsHover', 'Tooltips', 'Hover',
      this.surveyName + ' - Q' + q.actualQuestionNumber + ' - '
      + event, null, 'Survey Page Tooltip');
  }

  public isDidNotAnswer(sqa: any) {
    if (sqa.stratum4.toLowerCase() !== 'did not answer') {
      return false;
    }
    return true;
  }

  public getLabel(q: any, helpText: string) {
    return 'Family Health History' + ' - Q' + q.actualQuestionNumber + ' - ' + helpText;
  }

  public filterResults() {
    if (this.searchText.value) {
      this.dbc.triggerEvent('domainPageSearch', 'Search',
        'Search Inside Survey' + ' ' + this.surveyName, null, this.searchText.value, null);
    }
    localStorage.setItem('searchText', this.searchText.value);
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

  public resetExpansion() {
      for (const q of this.conditionQuestions.concat(this.fmQuestions)) {
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
