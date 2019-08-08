import { Component, OnInit } from '@angular/core';
import { ResearchDirWorkSpace } from '../../../../publicGenerated/model/researchDirWorkSpace';
import { RdTableData } from '../../classes/rd-table-data';

@Component({
  selector: 'app-research-dir-view',
  templateUrl: './research-dir-view.component.html',
  styleUrls: ['./research-dir-view.component.css', '../../../styles/template.css']
})
export class ResearchDirViewComponent implements OnInit {
  itemList: any[];
  workspaceTable: ResearchDirWorkSpace =
    {
      columnDefs: [{
        name: '',
        field: ''
      }],
      rowData: [{
        wsName: '',
        createdDate: '',
        accessLevel: '',
        researchers: [{
          name: '',
          researcherAccessLevel: '',
          removed: false,
          // workspaces: [{
          //   workspaceId: '',
          //   name: '',
          //   accessLevel: '',
          //   creationTime: '',
          //   archivalTime: '',
          //   reasonForAllOfUs: '',
          //   anticipatedFindings: '',
          //   intendedStudy: ''
          // }],
          affiliations: [{
            role: '',
            institute: ''
          }],
        }],
      }],
    };


  workspaceTableData: ResearchDirWorkSpace = {
    columnDefs: [{
      name: 'Workspace<br>Name',
      field: 'wsName'
    }, {
      name: 'Date<br>Created',
      field: 'createdDate'
    }, {
      name: 'Workspace<br>Access Level',
      field: 'accessLevel'
    }, {
      name: 'Researcher<br>Name',
      field: 'name'
    }, {
      name: 'Researcher<br>Access Level',
      field: 'wsName'
    }, {
      name: 'Institutional<br>Role',
      field: 'wsName'
    }, {
      name: 'Institutional<br>Affiliation',
      field: 'wsName'
    }],
    rowData: [{
      wsName: 'GeneX mutaton in woman with HS education',
      createdDate: 'Jan 1, 2020',
      accessLevel: 'Registered',
      researchers: [{
        name: 'Alex Berger',
        researcherAccessLevel: 'Owner',
        removed: false,
        affiliations: [{
          role: 'Professor',
          institute: 'NYU'
        },
        {
          role: 'Head Research Lead',
          institute: 'Broad Institute'
        },
        {
          role: 'Fellow',
          institute: 'Harvard Universty College of Medicine'
        }
        ],
      },
      {
        name: 'Bruce Crane',
        researcherAccessLevel: 'Writer',
        removed: false,
        affiliations: [{
          role: 'Post doctoral fellow',
          institute: 'GWU'
        }],
      },
      {
        name: 'Denise Egglton',
        researcherAccessLevel: 'Writer',
        removed: false,
        affiliations: [{
          role: 'Analyst',
          institute: 'Privacy Analytics'
        }],
      },
      {
        name: 'Erin Proust',
        researcherAccessLevel: 'Writer',
        removed: true,
        affiliations: [{
          role: 'Biostatistion',
          institute: 'Privacy Analytics'
        }],
      },

      ]
    }]
  }
  constructor() { }

  ngOnInit() {
    this.itemList =
      [{
        title: 'Workspaces',
        subInfo: '42'
      },
      {
        title: 'Researchers',
        subInfo: '234'
      }];
  }
}


