import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})

export class HelpTextService {
  helptexts = { 'QuickSearchPopup': {
    title: 'PUBLIC DATA USE STATEMENT',
    statement: `<i>All of Us</i> Research Program data are not representative of the population of the United States.
                 If you present, publish, or distribute <i>All of Us</i> data, please include the following disclaimer:<br>
                 “The <i>All of Us</i> Research Program includes a demographically, geographically, and medically diverse group of participants,
                 however, it is not a representative sample of the population of the United States.
                 Enrollment in the <i>All of Us</i> Research program is open to all who choose to participate,
                 and the program is committed to engaging with and encouraging participation of minority groups that are
                 historically underrepresented in biomedical research."`
  },
  'EhrViewPopUp': {
    title: 'DATA DISCLAIMER',
    statement: `The <i>All of Us</i> Research Program includes a demographically, geographically, and
                 medically diverse group of participants, however, it is not a representative sample of the
                 population of the United States. Enrollment in the <i>All of Us</i> Research program is open to all who
                 choose to participate, and the program is committed to engaging with and encouraging participation
                 of minority groups that are historically underrepresented in biomedical research.`
  },
  'CopePopUp': {
    title: 'COvid-19 Participant Experience (COPE) survey',
    statement: `<div class="cope-statement"><span class='cope-statement-body'>This optional survey was released to participants for completion
                   at multiple time points during the COVID-19 pandemic. As a result, a participant may have
                   multiple data points if they completed more than one survey.</span>
                   <span class='cope-statement-body'>This survey has multiple versions. Even though most of the content is consistent between
                   versions, some questions were modified.</span> <span class='cope-statement-box'><strong>Please Note:</strong><br> While these aggregate data are available
                   in the Data Browser tool, to protect participant privacy, only select data will be available in the Registered Tier dataset (i.e., data describing COVID
                   positive status will not be made available)</span></div>`
  },
  'QuickSearchDisclaimerBtn': {
    class: 'disclaimer-btn',
    title: 'public data use statement'
  },
  'EhrViewDisclaimerBtn': {
    class: 'disclaimer-btn disclaimer-btn-ehr',
    title: 'data disclaimer'
  },
  'CopeDisclaimerBtn': {
    class: 'disclaimer-btn disclaimer-btn-survey',
    title: 'IMPORTANT CONSIDERATIONS FOR COPE SURVEY - LEARN MORE'
  }};

  constructor() { }
}
