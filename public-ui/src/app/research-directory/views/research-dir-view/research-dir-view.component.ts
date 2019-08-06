import { Component, OnInit } from '@angular/core';
import { RdTableData } from '../../classes/rd-table-data';

@Component({
  selector: 'app-research-dir-view',
  templateUrl: './research-dir-view.component.html',
  styleUrls: ['./research-dir-view.component.css', '../../../styles/template.css']
})
export class ResearchDirViewComponent implements OnInit {
  itemList: any[];

  workspaceTableData: RdTableData = {
    header: [{
      title: 'Workspace<br>Name'
    }, {
      title: 'Date<br>Created',
    }, {
      title: 'Workspace<br>Access Level',
    }, {
      title: 'Researcher<br>Name',
    }, {
      title: 'Researcher<br>Access Level',
    }, {
      title: 'Institutional<br>Role',
    }, {
      title: 'Institutional<br>Affiliation',
    }],
    rowData: [{
      name: 'GeneX mutaton in woman with HS education',
      createdDate: 'Jan 1, 2020',
      accessLevel: 'Registered',
      researchers: [{
        name: 'Alex Berger',
        accessLevel: 'Owner',
        institute: [{
          role: 'Professor',
          affiliation: 'NYU'
        },
        {
          role: 'Head Research Lead',
          affiliation: 'Broad Institute'
        },
        {
          role: 'Fellow',
          affiliation: 'Harvard Universty College of Medicine'
        }
        ],
        removed: false
      },
      {
        name: 'Bruce Crane',
        accessLevel: 'Writer',
        institute: [{
          role: 'Post doctoral fellow',
          affiliation: 'GWU'
        }],
        removed: false
      },
      {
        name: 'Denise Egglton',
        accessLevel: 'Writer',
        institute: [{
          role: 'Analyst',
          affiliation: 'Privacy Analytics'
        }],
        removed: true
      },
      {
        name: 'Erin Proust',
        accessLevel: 'Writer',
        institute: [{
          role: 'Biostatistion',
          affiliation: 'Privacy Analytics'
        }],
        removed: true
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
