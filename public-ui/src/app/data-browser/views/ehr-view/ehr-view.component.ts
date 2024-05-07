import { environment } from "environments/environment";
import {
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DbConfigService } from "app/utils/db-config.service";
import { GraphType } from "app/utils/enum-defs";
import {
  DataBrowserService,
  DomainInfosAndSurveyModulesResponse,
  MatchType,
} from "publicGenerated";
import { ConceptListResponse } from "publicGenerated/model/conceptListResponse";
import { Domain } from "publicGenerated/model/domain";
import { SearchConceptsRequest } from "publicGenerated/model/searchConceptsRequest";
import { StandardConceptFilter } from "publicGenerated/model/standardConceptFilter";
import { Subscription as ISubscription } from "rxjs/internal/Subscription";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";

/* This displays concept search for a Domain. */

@Component({
  selector: "app-ehr-view",
  templateUrl: "./ehr-view.component.html",
  styleUrls: [
    "../../../styles/template.css",
    "../../../styles/cards.css",
    "../../../styles/page.css",
    "./ehr-view.component.css",
  ],
})
export class EhrViewComponent implements OnChanges, OnInit, OnDestroy {
  domainId: string;
  title: string;
  subTitle: string;
  ehrDomain: any;
  searchText: FormControl = new FormControl();
  prevSearchText = "";
  searchResult: ConceptListResponse;
  items: any[] = [];
  codeMatch = false;
  fullResultItemsList: any[] = [];
  standardConcepts: any[] = [];
  standardConceptIds: number[] = [];
  graphButtons: any = [];
  loadingCheck = false;
  selectedFilterGrid = false;
  totalParticipants: number;
  displayConceptErrorMessage = false;
  top10Results: any[] = []; // We graph top10 results
  searchRequest: SearchConceptsRequest;
  valueFilterCheck = { tests: true, orders: true };
  private subscriptions: ISubscription[] = [];
  private initSearchSubscription: ISubscription = null;
  /* Show more synonyms when toggled */
  showMoreSynonyms = {};
  showMoreDrugBrands = {};
  synonymString = {};
  drugBrands = {};
  /* Show different graphs depending on domain we are in */
  graphToShow = GraphType.BiologicalSex;
  showTopConcepts: boolean;
  medlinePlusLink: string;
  graphType = GraphType;
  treeData: any;
  expanded = true;
  treeLoading = false;
  searchFromUrl: string;
  totalResults: number;
  numPages: number;
  currentPage = 1;
  selectedConcept: any;
  testFilter = 0;
  orderFilter = 0;
  showStatement: boolean;
  testReact: boolean;
  ehrReact: boolean;
  routeDomainId: string;
  dataStatement = `The <i>All of Us</i> Research Program includes a demographically, geographically, and
  medically diverse group of participants, however, it is not a representative sample of the
  population of the United States. Enrollment in the <i>All of Us</i> Research program is open to all who
  choose to participate, and the program is committed to engaging with and encouraging participation
  of minority groups that are historically underrepresented in biomedical research.`;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private elm: ElementRef,
    private api: DataBrowserService,
    public dbc: DbConfigService
  ) {
    this.closePopUp = this.closePopUp.bind(this);
    this.changeResults = this.changeResults.bind(this);
    this.selectConcept = this.selectConcept.bind(this);
  }

  ngOnInit() {
    this.testReact = environment.testReact;
    this.ehrReact = environment.ehrReact;
    this.route.params.subscribe((params) => {
      this.routeDomainId = params.id;
      this.domainId = this.dbc.routeToDomain[params.id];
      this.prevSearchText = params.search ? params.search : "";
      if (this.prevSearchText) {
        this.searchText.setValue(this.prevSearchText);
      }
    });
    this.loadPage();
  }

  ngOnChanges(changes: SimpleChanges) {}

  ngOnDestroy() {
    if (this.subscriptions) {
      for (const s of this.subscriptions) {
        s.unsubscribe();
      }
    }
    if (this.initSearchSubscription) {
      this.initSearchSubscription.unsubscribe();
    }
    localStorage.removeItem("measurementTestsChecked");
    localStorage.removeItem("measurementOrdersChecked");
    localStorage.removeItem("fromDifferentPage");
    localStorage.removeItem("totalResults");
  }

  public loadPage() {
    this.items = [];
    // Get search text from localStorage
    this.loadingCheck = true;
    if (!this.prevSearchText) {
      if (this.searchFromUrl) {
        this.prevSearchText = this.searchFromUrl;
      } else {
        this.prevSearchText = "";
        this.prevSearchText = localStorage.getItem("searchText");
      }
    }
    this.searchText.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap((query) => this.searchDomain(query))
      )
      .subscribe({
        next: (results) => {
          this.searchCallback(results);
          this.displayConceptErrorMessage = false;
          localStorage.setItem(
            "searchText",
            this.searchText.value === null ? "" : this.searchText.value
          );
          this.loadingCheck = false;
        },
        error: (err) => {
          console.log("Error searching: ", err);
          const errorBody = JSON.parse(err._body);
          this.displayConceptErrorMessage = true;
          console.log("Error searching: ", errorBody.message);
          this.loadingCheck = false;
          this.toggleTopConcepts();
        },
      });
    const domainObj = JSON.parse(localStorage.getItem("ehrDomain"));
    // if no domainObj or if the domain in the obj doesn't match the route
    if (!domainObj || domainObj.domain !== this.domainId) {
      this.getThisDomain();
    } else {
      this.setDomain();
    }
    if (this.currentPage !== 1) {
      this.showTopConcepts = false;
    } else {
      this.showTopConcepts = true;
    }
    if (this.selectedConcept && this.selectedConcept.currentValue) {
      this.expandRow(this.selectedConcept, true);
    }
    if (this.treeData && this.treeData.currentValue) {
      this.selectedConcept = JSON.parse(
        localStorage.getItem("selectedConcept")
      );
      this.loadSourceTree(this.selectedConcept);
    }
    return true;
  }

  private domainSetup(domain) {
    if (domain) {
      this.loadingCheck = true;
      // Set the graphs we want to show for this domain
      // Run search initially to filter to domain,
      // a empty search returns top ordered by count_value desc
      // Note, we save this in its own subscription so we can unsubscribe when they start typing
      // and these results don't trump the search results in case they come back slower
      this.totalParticipants = this.ehrDomain.participantCount;
      if (this.ehrDomain.name.toLowerCase() === "labs & measurements") {
        this.graphButtons = [
          "Values",
          "Sex Assigned at Birth",
          "Age",
          "Sources",
        ];
      } else {
        this.graphButtons = ["Sex Assigned at Birth", "Age", "Sources"];
      }
      this.initSearchSubscription = this.searchDomain(
        this.prevSearchText
      ).subscribe({
        next: (results) => {
          this.searchCallback(results);
          this.displayConceptErrorMessage = false;
          this.loadingCheck = false;
          if (
            this.selectedConcept &&
            localStorage.getItem("fromDifferentPage") === "true"
          ) {
            this.expandRow(this.selectedConcept, true);
          }
        },
        error: (err) => {
          const errorBody = JSON.parse(err._body);
          this.displayConceptErrorMessage = true;
          console.log("Error searching: ", errorBody.message);
          this.loadingCheck = false;
        },
      });
    }
  }

  private setDomain() {
    const obj = localStorage.getItem("ehrDomain");
    if (obj) {
      this.ehrDomain = JSON.parse(obj);
      this.subTitle = "Keyword: " + this.searchText;
      this.title = this.ehrDomain.name;
      this.domainSetup(this.ehrDomain);
    }
    if (!obj) {
      this.getThisDomain();
    }
  }

  // get the current ehr domain by its route
  public getThisDomain() {
    this.subscriptions.push(
      this.api
        .getDomainTotals(
          this.searchText.value,
          this.valueFilterCheck.tests === true ? 1 : 0,
          this.valueFilterCheck.orders === true ? 1 : 0
        )
        .subscribe({
          next: (data: DomainInfosAndSurveyModulesResponse) => {
            this.loadingCheck = false;
            data.domainInfos.forEach((domain) => {
              const thisDomain = Domain[domain.domain];
              if (thisDomain && thisDomain.toLowerCase() === this.domainId) {
                localStorage.setItem("ehrDomain", JSON.stringify(domain));
                this.setDomain();
              }
            });
          },
          error: (err) => {
            const errorBody = JSON.parse(err._body);
            this.displayConceptErrorMessage = true;
            console.log("Error searching: ", errorBody.message);
            this.loadingCheck = false;
          },
        })
    );
  }

  public getNumberOfPages(query: string) {
    let domainResults = null;
    this.subscriptions.push(
      this.api
        .getDomainTotals(
          query && query != null ? query : "",
          this.valueFilterCheck.tests === true ? 1 : 0,
          this.valueFilterCheck.orders === true ? 1 : 0
        )
        .subscribe((results) => {
          domainResults = results.domainInfos.filter((d) => d.domain !== null);
          domainResults = domainResults.filter(
            (d) => d.name.toLowerCase() === this.ehrDomain.name.toLowerCase()
          );
          if (domainResults && domainResults.length > 0) {
            this.totalResults = domainResults[0].standardConceptCount;
            localStorage.setItem("totalResults", String(this.totalResults));
            this.numPages = Math.ceil(this.totalResults / 50);
          }
        })
    );
  }

  public searchCallback(results: any) {
    if (
      this.prevSearchText &&
      this.prevSearchText.length >= 3 &&
      results &&
      results.items &&
      results.items.length > 0
    ) {
      this.dbc.triggerEvent(
        "domainPageSearch",
        "Search",
        "Search Inside Domain " + this.ehrDomain.name,
        null,
        this.prevSearchText,
        null
      );
    } else if (
      this.prevSearchText &&
      this.prevSearchText.length >= 3 &&
      results &&
      (!results.items || results.items.length <= 0)
    ) {
      this.searchRequest.pageNumber = 0;
      this.searchRequest.measurementTests =
        this.valueFilterCheck.tests === true ? 1 : 0;
      this.searchRequest.measurementOrders =
        this.valueFilterCheck.orders === true ? 1 : 0;
      this.api.searchConcepts(this.searchRequest).subscribe({
        next: (res) => {
          if (res.items && res.items.length > 0) {
            this.processSearchResults(res);
          } else {
            this.dbc.triggerEvent(
              "domainPageSearch",
              "Search (No Results)",
              "Search Inside Domain " + this.ehrDomain.name,
              null,
              this.prevSearchText,
              null
            );
          }
          this.displayConceptErrorMessage = false;
          this.loadingCheck = false;
        },
        error: (err) => {
          const errorBody = JSON.parse(err._body);
          this.displayConceptErrorMessage = true;
          this.loadingCheck = false;
          console.log("Error searching: ", errorBody.message);
        },
      });
    }
    this.processSearchResults(results);
  }

  public getGraphButtons(r: any) {
    if (r.domainId.toLowerCase() === "measurement") {
      return ["Values", "Sex Assigned at Birth", "Age", "Sources"];
    }
    return this.graphButtons;
  }

  public clickAlertBox(message: string, e: any) {
    const alertBox = document.createElement("div");
    alertBox.style.position = "absolute";
    alertBox.style.top = e.pageY + 10 + "px";
    alertBox.style.left = e.pageX - 60 + "px";
    alertBox.innerHTML = `<div class="copy-alert">
        ${message}
      </div>`;
    // alertBox.innerText = message;
    document.body.appendChild(alertBox);
    setTimeout(() => {
      document.body.removeChild(alertBox);
    }, 400);
  }

  public share(conceptId: string, e) {
    const selBox = document.createElement("textarea");
    const pathNames = window.location.pathname.split("/");
    const copystr =
      window.location.origin +
      "/" +
      pathNames[1] +
      "/" +
      pathNames[2] +
      "/" +
      conceptId;
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = copystr.toLowerCase();
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
    this.clickAlertBox("Link copied to clipboard", e);
  }

  public checkIfExpanded(concept: any, event: any, sources?: boolean) {
    const classList = event.target.classList;
    for (let i = 0; i < classList.length; i++) {
      const item = classList[i];
      if (item === "is-solid" || item === "source-btn_active") {
        this.expanded = false;
        for (const s of this.subscriptions) {
          s.unsubscribe();
        }
      } else {
        this.expanded = true;
      }
    }
    if (
      this.selectedConcept &&
      this.selectedConcept.conceptCode === concept.conceptCode
    ) {
      // if already expanded than just change the graph
      if (sources) {
        concept.graphToShow = GraphType.Sources;
      } else if (
        !sources &&
        this.ehrDomain.name.toLowerCase() === "labs & measurements"
      ) {
        concept.graphToShow = GraphType.Values;
      } else {
        concept.graphToShow = GraphType.BiologicalSex;
      }
    } else if (sources) {
      // if not expand the row
      concept.graphToShow = GraphType.Sources;
      this.loadSourceTree(concept);
      this.expandRow(concept, false, true);
    } else {
      if (this.ehrDomain.name.toLowerCase() === "labs & measurements") {
        concept.graphToShow = GraphType.Values;
      } else {
        concept.graphToShow = GraphType.BiologicalSex;
      }
      this.expandRow(concept);
    }
  }

  public expandRow(concept: any, fromChart?: boolean, sources?: boolean) {
    this.loadSourceTree(concept);
    this.expanded = true;
    // analytics
    this.dbc.triggerEvent(
      "conceptClick",
      "Concept",
      "Click",
      concept.conceptName + " - " + concept.domainId,
      this.prevSearchText,
      null
    );
    if (
      this.expanded &&
      this.selectedConcept &&
      concept.conceptCode === this.selectedConcept.conceptCode
    ) {
      if (fromChart && localStorage.getItem("selectedConceptCode")) {
        this.selectedConcept = concept;
        setTimeout(() => {
          // wait till previous selected row shrinks
          this.scrollTo("#c" + localStorage.getItem("selectedConceptCode"));
        }, 50);
      } else {
        this.selectedConcept = null;
        this.expanded = false;
      }
    } else {
      this.selectedConcept = concept;
      setTimeout(() => {
        // wait till previous selected row shrinks
        this.scrollTo("#c" + this.selectedConcept.conceptId);
      }, 1);
    }
    if (this.ehrDomain.name.toLowerCase() === "labs & measurements") {
      if (
        concept.measurementConceptInfo !== null &&
        concept.measurementConceptInfo.hasValues === 1 &&
        !sources
      ) {
        concept.graphToShow = GraphType.Values;
      }
    } else {
      if (fromChart) {
        this.selectGraph(concept.graphToShow, concept);
      }
    }
  }

  public getConceptIndex(i: number) {
    if (this.totalResults > this.searchRequest.maxResults) {
      return i + (this.currentPage - 1) * this.searchRequest.maxResults + 1;
    }
    return i + 1;
  }

  public processSearchResults(results) {
    this.searchResult = results;
    this.searchResult.items = this.searchResult.items.filter(
      (x) => this.dbc.PM_CONCEPTS.indexOf(x.conceptId) === -1
    );
    this.items = this.searchResult.items;
    if (this.items.length === 1) {
      this.expandRow(this.items[0], true);
    }
    this.items = this.items.sort((a, b) => {
      if (a.countValue > b.countValue) {
        return -1;
      }
      if (a.countValue < b.countValue) {
        return 1;
      }
      return 0;
    });
    this.medlinePlusLink =
      "https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=" +
      "medlineplus&v%3Asources=medlineplus-bundle&query=" +
      this.getTerm();
    this.codeMatch = this.searchResult.matchType === MatchType.Code;
    for (const concept of this.items) {
      this.synonymString[concept.conceptId] =
        concept.conceptSynonyms.join(", ");
      this.drugBrands[concept.conceptId] = concept.drugBrands;
      if (this.ehrDomain.domain.toLowerCase() === "measurement") {
        concept.graphToShow = GraphType.Values;
      } else {
        concept.graphToShow = GraphType.BiologicalSex;
      }
      if (concept.standardConcepts) {
        this.standardConcepts = this.standardConcepts.concat(
          concept.standardConcepts
        );
      }
    }
    this.standardConceptIds = this.standardConcepts.map((a) => a.conceptId);
    if (this.currentPage === 1) {
      this.top10Results = this.searchResult.items.slice(0, 10);
    }
  }

  public searchDomain(query: string) {
    if (query) {
      this.router.navigate([
        "ehr/" +
          this.dbc.domainToRoute[this.domainId].toLowerCase() +
          "/" +
          query,
      ]);
    } else {
      this.router.navigate([
        "ehr/" + this.dbc.domainToRoute[this.domainId].toLowerCase(),
      ]);
    }
    this.getNumberOfPages(query);
    // Unsubscribe from our initial search subscription if this is called again
    if (this.initSearchSubscription) {
      this.initSearchSubscription.unsubscribe();
    }
    const maxResults = 50;
    if (
      this.currentPage > 1 &&
      this.ehrDomain.domain.toLowerCase() === "measurement"
    ) {
      this.searchRequest = {
        query: query,
        domain: this.ehrDomain.domain.toUpperCase(),
        standardConceptFilter: StandardConceptFilter.StandardOrCodeIdMatch,
        maxResults: maxResults,
        minCount: 1,
        pageNumber: this.currentPage - 1,
        measurementTests: this.valueFilterCheck.tests === true ? 1 : 0,
        measurementOrders: this.valueFilterCheck.orders === true ? 1 : 0,
      };
    } else {
      this.searchRequest = {
        query: query,
        domain: this.ehrDomain.domain.toUpperCase(),
        standardConceptFilter: StandardConceptFilter.StandardOrCodeIdMatch,
        maxResults: maxResults,
        minCount: 1,
        pageNumber: this.currentPage - 1,
      };
      if (this.ehrDomain.domain.toLowerCase() === "measurement") {
        this.searchRequest.measurementTests =
          this.valueFilterCheck.tests === true ? 1 : 0;
        this.searchRequest.measurementOrders =
          this.valueFilterCheck.orders === true ? 1 : 0;
      }
    }
    this.prevSearchText = query;
    if (!query) {
      this.searchRequest.query = "";
    }
    return this.api.searchConcepts(this.searchRequest);
  }

  public toggleSources(row) {
    if (row.showSources) {
      row.showSources = false;
    } else {
      row.showSources = true;
      row.expanded = true;
      row.viewSynonyms = true;
    }
  }

  public toggleSynonyms(concept: any) {
    this.showMoreSynonyms[concept.conceptId] =
      !this.showMoreSynonyms[concept.conceptId];
    if (this.showMoreSynonyms[concept.conceptId]) {
      this.dbc.triggerEvent(
        "conceptClick",
        "Concept",
        "Click On See More Synonyms",
        concept.conceptName + " - " + concept.domainId,
        this.prevSearchText,
        null
      );
    }
  }

  public toggleDrugBrands(concept: any) {
    this.showMoreDrugBrands[concept.conceptId] =
      !this.showMoreDrugBrands[concept.conceptId];
  }

  public toggleTopConcepts() {
    this.showTopConcepts = !this.showTopConcepts;
  }

  public changeResults() {
    this.selectedConcept = undefined;
    this.loadPage();
  }

  public getTerm() {
    if (
      this.searchResult.matchType === MatchType.Id ||
      this.searchResult.matchType === MatchType.Code
    ) {
      return this.searchResult.matchedConceptName;
    }
    return this.searchText.value;
  }

  public getTopResultsSize() {
    if (this.top10Results.length < 10 && this.top10Results.length > 1) {
      return this.top10Results.length + " " + this.title;
    } else if (this.top10Results.length === 1) {
      return this.top10Results.length + " " + this.title.slice(0, -1);
    }
    return 10;
  }

  public getNextPage(event) {
    this.selectedConcept = undefined;
    this.searchRequest.pageNumber = this.currentPage;
    this.searchFromUrl = this.prevSearchText;
    window.scrollTo(0, 0);
    this.loadPage();
  }

  public selectConcept(concept: any, fromChart?: boolean) {
    this.selectedConcept = concept;
    localStorage.setItem(
      "selectedConceptCode",
      this.selectedConcept.conceptId.toString()
    );
    if (fromChart && this.currentPage !== 1) {
      this.currentPage = 1;
      localStorage.setItem("fromDifferentPage", "true");
      this.loadPage();
    } else {
      localStorage.setItem("fromDifferentPage", "false");
      this.expandRow(this.selectedConcept, true);
    }
  }

  public clearSearch() {
    this.searchText.setValue("");
  }

  public canDisplayTable() {
    if (
      this.ehrDomain &&
      this.ehrDomain.domain.toLowerCase() === "measurement"
    ) {
      return (
        (this.items && this.items.length > 0) ||
        !this.valueFilterCheck.tests ||
        !this.valueFilterCheck.orders
      );
    }
    return (
      (this.items && this.items.length > 0) ||
      (!this.valueFilterCheck.tests && !this.valueFilterCheck.orders)
    );
  }

  public checkCount(count: number) {
    if (count <= 20) {
      return true;
    } else {
      return false;
    }
  }

  public participantPercentage(count: number) {
    if (!count || count <= 0) {
      return 0;
    }
    let percent: number = count / this.totalParticipants;
    percent = parseFloat(percent.toFixed(4));
    return percent * 100;
  }

  public filterMeasurements(box: string, value: boolean) {
    localStorage.setItem(
      "measurementTestsChecked",
      this.valueFilterCheck.tests === true ? "true" : "false"
    );
    localStorage.setItem(
      "measurementOrdersChecked",
      this.valueFilterCheck.orders === true ? "true" : "false"
    );
    const searchRequest = {
      query: this.searchRequest.query,
      domain: this.searchRequest.domain,
      standardConceptFilter: this.searchRequest.standardConceptFilter,
      maxResults: this.searchRequest.maxResults,
      minCount: this.searchRequest.minCount,
      pageNumber: this.searchRequest.pageNumber,
      measurementTests: this.valueFilterCheck.tests === true ? 1 : 0,
      measurementOrders: this.valueFilterCheck.orders === true ? 1 : 0,
    };
    this.api.searchConcepts(searchRequest).subscribe({
      next: (results) => {
        this.items = results.items;
        this.top10Results = results.items.slice(0, 10);
        this.loadingCheck = false;
      },
      error: (err) => {
        const errorBody = JSON.parse(err._body);
        this.displayConceptErrorMessage = true;
        console.log("Error searching: ", errorBody.message);
        this.loadingCheck = false;
      },
    });
    this.api
      .getDomainTotals(
        this.searchText.value,
        this.valueFilterCheck.tests === true ? 1 : 0,
        this.valueFilterCheck.orders === true ? 1 : 0
      )
      .subscribe({
        next: (results) => {
          const domainResults = results.domainInfos.filter(
            (d) => d.domainConceptId === 21
          );
          this.totalResults = domainResults[0].standardConceptCount;
          this.loadingCheck = false;
        },
        error: (err) => {
          const errorBody = JSON.parse(err._body);
          this.displayConceptErrorMessage = true;
          this.loadingCheck = false;
          console.log("Error searching: ", errorBody.message);
        },
      });
  }

  private loadSourceTree(concept: any) {
    // clear out treeData
    this.treeData = [];
    this.treeLoading = true;
    // close previous subscription
    if (this.subscriptions.length > 0) {
      for (const s of this.subscriptions) {
        s.unsubscribe();
      }
    }
    this.subscriptions.push(
      this.api
        .getCriteriaRolledCounts(concept.conceptId, this.ehrDomain.domain)
        .subscribe({
          next: (result) => {
            this.treeData = [result.parent];
            this.treeLoading = false;
          },
        })
    );
  }

  public scrollTo(id: string) {
    const el = this.elm.nativeElement.querySelector(id);
    if (el !== null) {
      el.scrollIntoView(true);
      window.scrollBy(0, -60);
    } else {
      console.log("Scroll failed ID:", id);
    }
  }

  public filterMeasurementDataTypes() {
    if (this.selectedFilterGrid) {
      this.selectedFilterGrid = false;
    } else {
      this.selectedFilterGrid = true;
    }
  }

  public selectGraph(g: string, r: any) {
    this.resetSelectedGraphs(r);
    r.graphToShow = g;
    this.dbc.triggerEvent(
      "conceptClick",
      "Concept Graph",
      "Click On " + r.graphToShow + " Chart",
      r.conceptName + " - " + r.domainId,
      this.prevSearchText,
      null
    );
    if (
      r.graphToShow === GraphType.Sources &&
      ((r.domainId === "Condition" &&
        (r.vocabularyId === "SNOMED" ||
          r.vocabularyId === "ICD9CM" ||
          r.vocabularyId === "ICD10CM")) ||
        (r.domainId === "Procedure" &&
          (r.vocabularyId === "SNOMED" ||
            r.vocabularyId === "CPT4" ||
            r.vocabularyId === "ICD9CM" ||
            r.vocabularyId === "ICD10PCS" ||
            r.vocabularyId === "ICD9Proc")))
    ) {
      this.loadSourceTree(r);
    }
  }

  public resetSelectedGraphs(concept: any) {
    concept.graphToShow = GraphType.None;
  }

  closePopUp() {
    this.showStatement = false;
  }

  getTestFilter() {
    return this.valueFilterCheck.tests === true ? 1 : 0;
  }

  getOrderFilter() {
    return this.valueFilterCheck.orders === true ? 1 : 0;
  }
}
