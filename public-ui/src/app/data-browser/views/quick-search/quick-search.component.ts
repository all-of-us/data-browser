import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import {
  CdrVersion, DataBrowserService, DomainInfosAndSurveyModulesResponse
} from 'publicGenerated';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Rx';
import { ISubscription } from 'rxjs/Subscription';
import { environment } from '../../../../environments/environment';
import { ConceptGroup } from '../../../utils/conceptGroup';
import { DbConfigService } from '../../../utils/db-config.service';
import { TooltipService } from '../../../utils/tooltip.service';

@Component({
  selector: 'app-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['../../../styles/template.css', '../../../styles/cards.css',
    './quick-search.component.css']
})
export class QuickSearchComponent implements OnInit, OnDestroy {
  dbDesc = `The Data Browser provides interactive views of the publicly available
     All of Us (AoU) Research Program participant data. Currently, participant provided
      information, including surveys
    and physical measurements taken at the time of participant enrollment,
     as well as electronic health record data are
     available. The All of Us Research Program data will include
      more data types over time.`;
  title = 'Search Across Data Types';
  subTitle1 = 'Conduct a search across all ';
  subTitle2 = 'Research Program data types, ' +
    'including surveys, ' +
    'physical measurements taken at the time of participant enrollment ' +
    ' (“program physical measurements”), ' +
    'and electronic health record (EHR) data. Search using common keywords and/or ' +
    'billing or data standards codes (ie SNOMED, CPT, ICD). ';
  subTitle = '';
  searchResults = [];
  domainResults = [];
  surveyResults = [];
  pmParticipantCount = 0;
  totalResults: DomainInfosAndSurveyModulesResponse;
  searchText: FormControl = new FormControl();
  prevSearchText = '';
  displayDomainTotalsErrorMessage = false;
  totalParticipants;
  loading = true;
  dataType = null;
  EHR_DATATYPE = 'ehr';
  SURVEY_DATATYPE = 'surveys';
  PROGRAM_PHYSICAL_MEASUREMENTS = 'program_physical_measurements';
  physicalMeasurementsFound: number;
  numParticipants: any;
  creationTime: any;
  cdrName: any;
  allOfUsUrl: string;
  showStatement: boolean;
  preCope: boolean;
  statement = `<i>All of Us</i> Research Program data are not representative of the population of the United States.
  If you present, publish, or distribute <i>All of Us</i> data, please include the following disclaimer:<br>
  “The <i>All of Us</i> Research Program includes a demographically, geographically, and medically diverse group of participants,
  however, it is not a representative sample of the population of the United States.
  Enrollment in the <i>All of Us</i> Research program is open to all who choose to participate,
  and the program is committed to engaging with and encouraging participation of minority groups that are
  historically underrepresented in biomedical research".`;

  private subscriptions: ISubscription[] = [];

  constructor(private api: DataBrowserService,
    private route: ActivatedRoute,
    private router: Router,
    public dbc: DbConfigService,
    public tooltipText: TooltipService) {
    this.dbc.getGenderAnalysisResults();
    this.route.params.subscribe(params => {
      this.dataType = params.dataType;
    });
  }

  ngOnInit() {
    localStorage.removeItem('ehrDomain');
    localStorage.removeItem('surveyModule');
    this.allOfUsUrl = environment.researchAllOfUsUrl;
    this.preCope = environment.preCopeFlag;
    // Set title based on datatype
    if (this.dataType === this.EHR_DATATYPE) {
      this.title = 'Electronic Health Data';
      this.subTitle = 'Enter a keyword or data standards code (eg ICD, SNOMED)' +
        ' in the search bar ' +
        'to search across Electronic Health Record (EHR) data.';
    }
    if (this.dataType === this.SURVEY_DATATYPE) {
      this.title = 'Browse Participant Surveys';
      this.subTitle = 'Participants are asked to complete ' +
        'The Basics survey at the time of enrollment,' +
        ' and may choose to complete additional surveys as they become available. ' +
        'Use this tool to browse all survey questions as well as all ' +
        'response options for each question. ' +
        'The Data Browser provides a total count, ' +
        'grouped by age at occurrence and gender, for each response option.';
    }
    if (this.dataType === this.PROGRAM_PHYSICAL_MEASUREMENTS) {
      this.title = 'Program Physical Measurements';
      this.subTitle = 'Participants have the option to provide a standard set of ' +
        'physical measurements as part\n' +
        'of the enrollment process  (“program physical measurements”).\n' +
        'Use this tool to browse distributions of measurement ' +
        'values and counts,\n' +
        'grouped by age at occurrence and gender, for each ' +
        'program physical measurement.';
    }
    // Get search result from localStorage
    this.prevSearchText = localStorage.getItem('searchText');
    if (!this.prevSearchText) {
      this.prevSearchText = '';
    }
    this.searchText.setValue(this.prevSearchText);
    this.subscriptions.push(
      this.api.getParticipantCount().subscribe(
        result => this.totalParticipants = result.countValue)
    );

    this.api.getCdrVersionUsed().subscribe(
      (result: CdrVersion) => {
        this.numParticipants = result.numParticipants;
        this.creationTime = new Date(result.creationTime);
        this.cdrName = result.name;
      });
    // Do initial search if we have search text
    if (this.prevSearchText) {
      this.subscriptions.push(
        this.searchDomains(this.prevSearchText).subscribe({
          next: (data: DomainInfosAndSurveyModulesResponse) => {
            this.searchCallback(data);
            this.displayDomainTotalsErrorMessage = false;
          },
          error: err => {
            let errorBody = {'message': ''};
            try {
                errorBody = JSON.parse(err._body);
            } catch (e) {
            }
            this.displayDomainTotalsErrorMessage = true;
            console.log('Error searching: ', errorBody.message);
            this.loading = false;
            this.resetDomainResults();
          }
        }));
    }
    // Get domain totals only once so if they erase search we can load them
    this.subscriptions.push(
      this.api.getDomainTotals(this.searchText.value, 1, 1).subscribe({
        next: data => {
          this.searchCallback(data);
          // Only set results to the totals if we don't have a searchText
          if (!this.searchText.value) {
            this.totalResults = data;
          }
          this.displayDomainTotalsErrorMessage = false;
        },
        error: err => {
          let errorBody = {'message': ''};
          try {
              errorBody = JSON.parse(err._body);
          } catch (e) {
          }
          this.displayDomainTotalsErrorMessage = true;
          console.log('Error searching: ', errorBody.message);
          this.loading = false;
          this.resetDomainResults();
        }
      }));

    // Search when text value changes
    this.subscriptions.push(
      this.searchText.valueChanges
        .debounceTime(1000)
        .distinctUntilChanged()
        .switchMap((query) => this.searchDomains(query))
        .subscribe({
          next: (data: DomainInfosAndSurveyModulesResponse) => {
            this.searchCallback(data);
            this.displayDomainTotalsErrorMessage = false;
          },
          error: err => {
            let errorBody = {'message': ''};
            try {
                errorBody = JSON.parse(err._body);
            } catch (e) {
            }
            this.displayDomainTotalsErrorMessage = true;
            console.log('Error searching: ', errorBody.message);
            this.loading = false;
            this.resetDomainResults();
          }
        }));
  }
  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
  }

  public showDataType(showType) {
    return !this.loading && (!this.dataType || this.dataType === showType);
  }

  public resetDomainResults() {
    this.domainResults = [];
    this.surveyResults = [];
    this.physicalMeasurementsFound = 0;
  }

  private searchCallback(results: DomainInfosAndSurveyModulesResponse) {
    this.domainResults = results.domainInfos.filter(
      domain => domain.name.toLowerCase() !== 'physical measurements');
    const physicalMeasurementDomainInfo =
      results.domainInfos.filter(domain => domain.name.toLowerCase() === 'physical measurements');
    if (physicalMeasurementDomainInfo && physicalMeasurementDomainInfo.length > 0) {
      this.pmParticipantCount = physicalMeasurementDomainInfo[0].participantCount;
      if (this.searchText.value) {
        this.physicalMeasurementsFound = physicalMeasurementDomainInfo[0].standardConceptCount;
      } else {
        this.physicalMeasurementsFound = physicalMeasurementDomainInfo[0].allConceptCount;
      }
    }
    this.surveyResults = results.surveyModules;
    this.surveyResults.forEach(result => {
      if (result.name === 'Lifestyle') {
        result.description = result.description.replace('alcohol and', 'alcohol, and');
      }
    });
    this.loading = false;
  }

  public searchDomains(query: string) {
    if (query) {
      this.dbc.triggerEvent('searchOnLandingPage', 'Search', 'Homepage Search Across Data',
        null, query, null);
    }
    this.physicalMeasurementsFound = this.dbc.matchPhysicalMeasurements(query);
    this.prevSearchText = query;
    localStorage.setItem('searchText', query);
    // If query empty reset to already retrieved domain totals
    if (query.length === 0 && this.totalResults) {
      const resultsObservable = new Observable((observer) => {
        const domains: DomainInfosAndSurveyModulesResponse = {
          domainInfos: this.totalResults.domainInfos,
          surveyModules: this.totalResults.surveyModules
        };
        observer.next(domains);
        observer.complete();
      });
      return resultsObservable;
    }
    return this.api.getDomainTotals(query, 1, 1);
  }

  public viewSurvey(r, search: string) {
    if (!this.prevSearchText) {
      this.dbc.triggerEvent('domainTileClick', 'Domain Tile', 'Click',
        r.name, null, null);
    }
    localStorage.setItem('surveyModule', JSON.stringify(r));
    this.dbc.conceptIdNames.forEach(idName => {
      if (r.conceptId === idName.conceptId) {
        if (search) {
          this.router.navigate(['survey/' + idName.conceptName.toLowerCase().split(' ').join('-')],
            { queryParams: { search: search } });
        } else {
          this.router.navigate(['survey/' + idName.conceptName.toLowerCase().split(' ').join('-')]);
        }
      }
    });
  }

  public viewEhrDomain(r, search: string) {
    if (!this.prevSearchText) {
      this.dbc.triggerEvent('domainTileClick', 'Domain Tile', 'Click',
        r.name, null, null);
    }
    localStorage.setItem('ehrDomain', JSON.stringify(r));
    const url = 'ehr/' +
      this.dbc.domainToRoute[r.domain.toLowerCase()].replace(' ', '-');
    this.router.navigate([url], { queryParams: { search: search } });
  }

  public setEhrUrl(r) {
    const url = 'ehr/' +
      this.dbc.domainToRoute[r.domain.toLowerCase()].replace(' ', '-');
    return url;
  }

  public iconClickEvent(iconString: string) {
    this.dbc.triggerEvent('HelpEvent', 'Help', 'Click',
      iconString, null, null);
  }
  public hoverOnTooltip(label: string, searchTerm: string, action: string) {
    this.dbc.triggerEvent('tooltipsHover', 'Tooltips', 'Hover',
      label, this.searchText.value, action);
  }

  public clearSearch() {
    this.searchText.setValue('');
  }
}
