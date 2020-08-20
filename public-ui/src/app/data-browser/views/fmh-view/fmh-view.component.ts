import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {ISubscription} from 'rxjs/Subscription';
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
  @Input() participantCount: number;
  @Input() surveyName: number;
  questionOrder = {43528515: 1, 1384639: 2, 43528634: 3, 43528761: 4,
                   43529158: 5, 43529767: 6, 43529272: 7, 43529217: 8,
                   702786: 9, 43529966: 10, 43529638: 11};
  showAnswer = {};
  loading = false;
  domainId: string;
  private subscriptions: ISubscription[] = [];

  constructor(private api: DataBrowserService, public dbc: DbConfigService,
              private tooltipText: TooltipService, private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.conditionText = 'For participants who selected "A lot" or "Some" in the first question, ' +
      'view family history by medical condition and/or event';
    this.fmText = 'For participants who selected "A lot" or "Some" in the first question, ' +
      'view family history by family member below.';
    this.getSurveyResults();
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
  }

  private getSurveyResults() {
    const conditionQuestionConceptIds = ['43528515', '1384639', '43528634', '43528761', '43529158', '43529767', '43529272', '43529217', '702786', '43529966', '43529638'];
    const fmQuestionConceptIds = ['43528764', '43528763', '43528649', '43528651', '43528650', '43528765'];
    this.subscriptions.push(this.api.getFMHQuestionsRe(43528698,
      conditionQuestionConceptIds.concat(fmQuestionConceptIds)).subscribe({
      next: x => {
        this.conditionQuestions = x.questions.items.filter(x => conditionQuestionConceptIds.includes(String(x.conceptId)));
        this.conditionSubQuestions = x.questions.items.filter(x => x.sub === 1 && conditionQuestionConceptIds.some(sub=>x.path.includes(sub)));
        this.fmQuestions = x.questions.items.filter(x => fmQuestionConceptIds.includes(String(x.conceptId)));
        this.fmSubQuestions = x.questions.items.filter(x => x.sub === 1 && fmQuestionConceptIds.some(sub=>x.path.includes(sub)));
        this.analyses = x.analyses.items;
        this.mapAnalysesToQuestions(x.questions.items, x.analyses.items);
        this.processQuestions(this.conditionQuestions, 'condition');
        this.processQuestions(this.fmQuestions, 'family');
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

  public processQuestions(results: any, branching: string) {
    for (const q of results) {
          this.showAnswer[q.conceptId] = false;
          q.actualQuestionNumber = 0;
          q.graphToShow = GraphType.BiologicalSex;
          q.selectedAnalysis = q.genderAnalysis;
          q.graphDataToShow = 'Count';
          q.actualQuestionNumber = this.questionOrder[q.conceptId];
    }
    for (let q of results) {
              this.showAnswer[q.conceptId] = false;
              this.questionResults[q.conceptId] = [];
              q.actualQuestionNumber = q.questionOrderNumber;
              q.graphToShow = GraphType.BiologicalSex;
              q.selectedAnalysis = q.genderAnalysis;
              q.graphDataToShow = 'Count';
              for (let r of q.countAnalysis.results) {
                if (r.hasSubQuestions == 1) {
                    for (let sq1 of r.subQuestions) {
                        this.showAnswer[sq1.conceptId] = false;
                        this.questionResults[sq1.conceptId] = [];
                        sq1.actualQuestionNumber = sq1.questionOrderNumber;
                        sq1.graphToShow = GraphType.BiologicalSex;
                        sq1.selectedAnalysis = sq1.genderAnalysis;
                        sq1.graphDataToShow = 'Count';
                        for (const r1 of sq1.countAnalysis.results) {
                                    if (r1.hasSubQuestions == 1) {
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
    if (branching === 'condition') {
      this.conditionQuestions.sort((a1, a2) => {
        if (a1.actualQuestionNumber < a2.actualQuestionNumber) {
          return -1;
        }
        if (a1.actualQuestionNumber > a2.actualQuestionNumber) {
          return 1;
        }
        return 0;
      });
    } else {
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
        this.surveyName + ' - Q' + q.actualQuestionNumber + ' - '
        + q.conceptName, this.searchText.value, null);
    }
  }

  public processResults(q) {
    q.graphToShow = GraphType.BiologicalSex;
    q.selectedAnalysis = q.genderAnalysis;
    q.graphDataToShow = 'Count';
    for (const a of q.countAnalysis.results) {
      a.countPercent = this.countPercentage(a.countValue, this.participantCount);
      this.addMissingBiologicalSexResults(q.genderAnalysis,
        q.genderAnalysis.results.
        filter(r => r.stratum3 !== null && r.stratum3 === a.stratum3),
        this.participantCount);
      this.addMissingAgeResults(q.ageAnalysis,
        q.ageAnalysis.results.
        filter(r => r.stratum3 !== null && r.stratum3 === a.stratum3),
        this.participantCount);
    }
    q.countAnalysis.results.push(
      this.addDidNotAnswerResult(
        q.countAnalysis.results, this.participantCount));
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
    return 'Family Medical History' + ' - Q' + q.actualQuestionNumber + ' - ' + helpText;
  }

  public mapAnalysesToQuestions (questions, analyses) {
      let countAnalysisResults = {};
      let genderAnalysisResults = {};
      let ageAnalysisResults = {};

      let countAnalysis = null;
      let genderAnalysis = null;
      let ageAnalysis = null;

      for (const a of analyses) {
        if (a.analysisId === 3110) {
          if (!countAnalysis) {
              countAnalysis = {...a};
          }
          for(let r of a.results) {
              r.countPercent = this.countPercentage(r.countValue, this.participantCount);
              var q = (r.stratum6 && r.stratum6.length > 0 && r.stratum6.trim()) ?
              questions.filter(a => a.conceptId == r.stratum2 && a.path === r.stratum6)[0] :
              questions.filter(a => a.conceptId == r.stratum2)[0];
              var questionId = q.conceptId + '_' + q.path;
              if (questionId in countAnalysisResults) {
                  countAnalysisResults[questionId].push(r);
              } else {
                  countAnalysisResults[questionId] = [r];
             }
          }
        }
        if (a.analysisId === 3111) {
          if (!genderAnalysis) {
             genderAnalysis = {...a};
          }
            for(const r of a.results) {
                if (r.analysisStratumName === '' || r.analysisStratumName == null || !r.analysisStratumName) {
                    r.analysisStratumName = this.dbc.GENDER_STRATUM_MAP[r.stratum5];
                }
                var q = (r.stratum6 && r.stratum6.trim() && r.stratum6.length > 0) ? questions.filter(a => a.conceptId == r.stratum2 && a.path === r.stratum6)[0]
                : questions.filter(a => a.conceptId == r.stratum2)[0];

                var questionId = q.conceptId + '_' + q.path;
                if (questionId in genderAnalysisResults) {
                    genderAnalysisResults[questionId].push(r);
                } else {
                    genderAnalysisResults[questionId] = [r];
               }
            }
        }
        if (a.analysisId === 3112) {
          if (!ageAnalysis) {
             ageAnalysis = {...a};
          }
          for(const r of a.results) {
              if (this.dbc.VALID_AGE_DECILES.indexOf(r.stratum5) > -1) {
                  if (r.analysisStratumName === '' || r.analysisStratumName == null || !r.analysisStratumName) {
                      r.analysisStratumName = this.dbc.AGE_STRATUM_MAP[r.stratum5];
                  }
                  var q = (r.stratum6 && r.stratum6.trim() && r.stratum6.length > 0) ? questions.filter(a => a.conceptId == r.stratum2 && a.path === r.stratum6)[0]
                                          : questions.filter(a => a.conceptId == r.stratum2)[0];
                  var questionId = q.conceptId + '_' + q.path;
                  if (questionId in ageAnalysisResults) {
                      ageAnalysisResults[questionId].push(r);
                  } else {
                      ageAnalysisResults[questionId] = [r];
                 }
              }
          }
        }
       }
      for(let q of questions) {
          var tempCountAnalysis = {...countAnalysis};
          tempCountAnalysis.results = countAnalysisResults[q.conceptId + '_' + q.path];
          q.countAnalysis = tempCountAnalysis;

          var tempGenderAnalysis = {...genderAnalysis};
          tempGenderAnalysis.results = genderAnalysisResults[q.conceptId + '_' + q.path];
          q.genderAnalysis = tempGenderAnalysis;

          var tempAgeAnalysis = {...ageAnalysis};
          tempAgeAnalysis.results = ageAnalysisResults[q.conceptId + '_' + q.path];
          q.ageAnalysis = tempAgeAnalysis;
      }

      for(let q of this.conditionSubQuestions.concat(this.fmSubQuestions)) {
              var path_split = q.path.split(".");
              var question_id = path_split.length === 3 ? path_split[0] : path_split[2];
              var result_id = path_split.length === 3 ? path_split[1] : path_split[3];
              var result_filter = analyses.filter(a => a.analysisId === 3110)[0].results.filter(a => a.stratum3 === result_id && a.stratum2 === question_id);
              if (result_filter && result_filter[0].stratum3 !== '903096') {
                  result_filter[0].hasSubQuestions = 1;
                  if (result_filter[0].subQuestions) {
                      result_filter[0].subQuestions.push(q);
                  } else {
                      result_filter[0].subQuestions = [q];
                  }
              }
      }
    }

    public filterResults() {
        if (this.searchText.value) {
          this.dbc.triggerEvent('domainPageSearch', 'Search',
            'Search Inside Survey' + ' ' + this.surveyName, null, this.searchText.value, null);
        }
        localStorage.setItem('searchText', this.searchText.value);
        this.loading = true;
        if (this.searchText.value.length > 0) {
            // filter the questions and answers
            this.conditionQuestions = this.conditionQuestions.filter(this.searchQuestion, this);
            this.fmQuestions = this.fmQuestions.filter(this.searchQuestion, this);
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

        const re = new RegExp(reString, 'gi');
        if (re.test(q.conceptName)) {
          return true;
        }

        const results = q.countAnalysis.results.filter(r => re.test(r.stratum4));
        // Check if any of the sub questions in results or
        // results of sub questions contains the search term
        for (const rs of q.countAnalysis.results.filter(
          r => r.subQuestions !== null)) {
          if (rs.subQuestions && rs.subQuestions.length > 0) {
            for (const sq of rs.subQuestions) {
              if (re.test(sq.conceptName)) {
                return true;
              }
              if (sq.countAnalysis.results.filter(r => re.test(r.stratum4)).length > 0) {
                return true;
              }
              for (const rs2 of sq.countAnalysis.results.filter(
                r => r.subQuestions !== null)) {
                if (rs2.subQuestions && rs2.subQuestions.length > 0) {
                  for (const sq2 of rs2.subQuestions) {
                    if (re.test(sq2.conceptName)) {
                      return true;
                    }
                    if (sq2.countAnalysis.results.filter(
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
        return false ;
  }
}
