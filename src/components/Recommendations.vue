<template>

  <section>
    <div class="d-flex">
      <div class="col self-center mt-n2">
        <div class="text-caption">Age</div>
        <strong>{{ patient.age }}</strong>
        <div class="text-caption" v-if="recommendations[date].age && recommendations[date].age != patient.age">today
        </div>
      </div>
      <div class="col self-center mt-n2" v-if="recommendations[date].age && recommendations[date].age != patient.age">
        <div class="text-caption text--secondary">Back</div>
        <div class="text--secondary font-weight-bold"> {{ recommendations[date].age }}</div>
        <div class="text-caption text--secondary">then</div>
      </div>
      <div>
        <v-select v-model="pregnancySelection" dense filled @input="submitPregnancySelection"
                  label="Current state"
                  :items=pregnancyStateList>

        </v-select>
      </div>
      <div>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-select v-model="immunocompromiseSelection" dense filled @input="submitImmunocompromiseSelelection"
                      label="E.g., HIV, on immunosuppressant meds" v-on="on"
                      :items=immunocompromiseStateList>

            </v-select>
          </template>
          <span>
          Mark <b>Immunocompromised</b> for patients with:
          <ul>
            <li>HIV</li>
            <li>Solid organ or allogenic stem call transplant,</li>
            <li>IBD, SLE or rheum disease on immunosuppressive medication</li>
          </ul>
            <i>per Guidelines section K.3.</i>
          </span>

        </v-tooltip>

      </div>
      <div>
        <v-select v-model="scenarioSelection" dense small filled @input="submitScenarioSelection"
                  label="Scenario"
                  :selected="scenarioSelection"
                  :items=scenarioList>

        </v-select>
      </div>
    </div>
    <v-container>
      <v-row>
        <v-col>
          <v-radio-group v-model="date" @change="submitDate">
            <v-simple-table dense>
              <colgroup>
                <col style="background-color:white">
                <col style="background-color:grey">
              </colgroup>

              <template v-slot:default>
                <thead>
                <tr>
                  <th colspan="2">
                    <span class="text-subtitle-1">Select result</span>
                    <br/><span class="text-caption">to base recommendations on</span>
                  </th>
                </tr>

                </thead>
                <tbody>


                <tr v-for="result in (top4 ? dailyResultsTop4 : dailyResults)" :key="result.date">

                  <td class="px-1"
                      :style="{ backgroundColor: (date === result.date ? colors.blue.lighten5 : colors.grey.lighten4) }">
                    <v-radio :name="result.date" :value="result.date">
                      <template v-slot:label>
                        <div class="text-caption">{{ result.date }}</div>
                      </template>
                    </v-radio>
                  </td>
                  <td class="text-caption px-3"
                      :style="{ backgroundColor: (date === result.date ? colors.blue.lighten5 : 'transparent') }">

                      <span v-if="result.pap != undefined">
                        Cytology
                        <span v-if="result.pap" style="font-weight:bold">{{ result.pap }}</span>
                        <span v-else :style="{ color: colors.blue.lighten1 }">
                          Unreconciled
                        </span>
                      </span>

                    <span v-if="result.colposcopy != undefined">
                        Colposcopy
                        <span v-if="result.colposcopy"
                              :style="{ color: (isThereHSIL(dailyResults, result.date) ? colors.pink.darken2 : colors.black) }">
                          <span style="font-weight:bold">{{ result.colposcopy }}</span>
                        </span>
                        <span v-else :style="{ color: colors.blue.lighten1 }">
                          Unreconciled
                        </span>
                      </span>
                    <span v-if="result.ecc != undefined">
                        ECC
                        <span v-if="result.ecc" style="font-weight:bold">{{ result.ecc }}</span>
                        <span v-else :style="{ color: colors.blue.lighten1 }">
                          Unreconciled
                        </span>
                      </span>
                    <span v-if="result.excision != undefined">
                        Excision
                        <span v-if="result.excision"
                              :style=" { color: (isThereHSIL(dailyResults, result.date) ? colors.pink.darken2 : colors.black) }">
                          <span style="font-weight:bold">{{ result.excision }}</span>
                        </span>
                        <span v-else :style="{ color: colors.blue.lighten1 }">
                          Unreconciled
                        </span>
                      </span>
                    <span v-if="result.ablation != undefined">
                        Ablation
                        <span v-if="result.ablation" style="font-weight:bold">{{ result.ablation }}</span>
                        <span v-else :style="{ color: colors.blue.lighten1 }">
                          Unreconciled
                        </span>
                    </span>


                    <span class="text--secondary px-3">
                      <br/>
                      <span class="indigo--text" v-if="result.hpv || result.excision">
                        {{ result.hpv }} {{ result.hpv16 }} {{ result.hpv18 }}  {{ result.margins }}
                      </span>
                    </span>
                  </td>


                </tr>

                </tbody>

              </template>

            </v-simple-table>
          </v-radio-group>
          <v-btn small class="text-caption" v-model="top4" :depressed="top4" @click="limitLookback">
            <div v-if="top4">
              Show all
              <v-icon right>mdi-chevron-down</v-icon>
            </div>
            <div v-else>
              Top 4
              <v-icon right>mdi-chevron-up</v-icon>
            </div>
          </v-btn>

        </v-col>

        <v-col>
          <v-card>
            <v-card-title class="text-subtitle-1">
              Management recommendation
            </v-card-title>
            <v-card-subtitle class="text-caption">
              Per <a href="https://journals.lww.com/jlgtd/Fulltext/2020/04000/Risk_Estimates_Supporting_the_2019_ASCCP.4.aspx"
                     target="_blank">ASCCP 2019 Guidelines</a>

              <v-row>
                <v-col>
                  <v-alert v-if="recommendations[date][scenario]" border="left" colored-border
                           :color='MGMT_COLOR[recommendations[date][scenario].management]' elevation="1">
                    {{ recommendations[date][scenario].management }}

                  </v-alert>
                  <v-alert v-if="!recommendations[date][scenario]" border="left" colored-border color='grey'
                           elevation="1">
                    No recommendation for this scenario. Use clinical judgment.

                  </v-alert>
                </v-col>
                <v-col>
                  <confidence-gauge v-if="recommendations[date][scenario]"
                                    :confidence="recommendations[date][scenario].confidence"></confidence-gauge>
                </v-col>
              </v-row>
            </v-card-subtitle>
          </v-card>





          <v-card v-if="notes[date]['unreconciledData'].length">
            <v-row>
              <v-col>
                <v-card-title>
                  <v-alert border="left" color="accent" elevation="1">
                    Unreconciled data
                  </v-alert>
                </v-card-title>
              </v-col>
              <v-col>
                <v-simple-table dense>
                  <tbody>
                  <tr v-for="data in notes[date]['unreconciledData']" :key="data.date">
                    <td class="text-caption" style="background-color: palegoldenrod">{{ data.date }}</td> <td style="text-transform: capitalize;background-color: skyblue">{{ data.result }}</td>

                  </tr>
                  </tbody>
                </v-simple-table>

              </v-col>
            </v-row>
            <v-card-subtitle class="text-body-2">
              Unreconciled data invalidates all subsequent recommendations. Reconcile the missing findings noted above, then refresh.
            </v-card-subtitle>
          </v-card>

          <v-card v-if="notes[date]['histologicHSIL']">
            <v-row >
              <v-col>
                <v-card-title>

                  <v-alert border="left" elevation="1" :color=colors.pink.lighten3>
                    Histologic <b>HSIL</b>
                  </v-alert>
                </v-card-title>
              </v-col>
              <v-col>
                    <span class="text-body-2">
                          (CIN 2/3+), last noted {{ notes[date]['histologicHSIL'] }}.
                    </span>
                <span class="text-caption">
                          <br/>Necessitates HPV or co-testing q3 y minimum for at least 25 years after treatment
                            (through {{ addYears(notes[date]['histologicHSIL'], 25) }}).
                    </span>
              </v-col>
            </v-row>
          </v-card>

          <v-card>
            <risk-gauge v-if="recommendations[date][scenario]"
                        :riskImmediate="recommendations[date][scenario].cin3risk"
                        :risk5y="recommendations[date][scenario].cin3risk5y"></risk-gauge>
          </v-card>

          <v-card v-if="recommendations[date][scenario] && recommendations[date][scenario].figure">

              <span v-for="(figure) in recommendations[date][scenario].figure" :key="figure.file">
                <!-- <embed width="191" height="207" name="plugin"
                       :src="recommendations[date][scenario].figure" type="application/pdf"> -->

                <a :href="`/${figure.file}`" target="_blank"> {{ figure.title }}</a>
                <thumbnail :filename="figure.file" :url="`http://${location.host}/${URLify(figure.file)}`"></thumbnail>

              </span>
          </v-card>

        </v-col>
      </v-row>
      <v-timeline dense>
        <v-timeline-item small subtitle="Recommendations">
          {{ recommendations[date][scenario] }}
          <br/>
          Date selected: {{ date }}
          Age: {{ recommendations[date].age }}

          <br/>
          <b> Scenario </b>{{ scenarioSelection }}
          <br/>
        </v-timeline-item>
      </v-timeline>

    </v-container>
  </section>
</template>

<script>


// Epic's standard CCS tracking nomenclature:
// Procedure ("findings"): Pap Smear, Colposcopy, Excision, Ablation, Endometrial Biopsy, Endocervical Curettage
//

import Graph from "@dagrejs/graphlib/lib/graph";
import RiskGauge from "@/components/RiskGauge";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import Thumbnail from "@/components/Thumbnail";
import colors from 'vuetify/lib/util/colors'


// import {json} from "@dagrejs/graphlib";

// eslint-disable-next-line no-unused-vars
const FIGURE = {
  '3': {file: 'figures/Figure 3.pdf', title: "Figure 3"},
  '4': {file: 'figures/Figure 4.pdf', title: "Figure 4"},
  '5': {file: 'figures/Figure 5.pdf', title: "Figure 5"},
  '6': {file: 'figures/Figure 6.pdf', title: "Figure 6"},
  '7': {file: 'figures/Figure 7.pdf', title: "Figure 7"},
  '8': {file: 'figures/Figure 8.pdf', title: "Figure 8"},
  '9': {file: 'figures/Figure 9.pdf', title: "Figure 9"},
  '10': {file: 'figures/Figure 10.pdf', title: "Figure 10"},
  '11': {file: 'figures/Figure 11.pdf', title: "Figure 11"},
  '12': {file: 'figures/Figure 12.pdf', title: "Figure 12"},
  '13': {file: 'figures/Figure 13.pdf', title: "Figure 13"},
}

// eslint-disable-next-line no-unused-vars
const HEADINGS = {
  pap: 'Current PAP Result',
  hpv: 'Current HPV Result',
  priorPapAndHPV: 'PAST HISTORY (most recent)',
  priorPriorPap: 'PAST HISTORY (previous 2)',
  papAfterColpo: 'Post-Colpo Test Result - PAST HISTORY',
  papBeforeColpo: 'Pre-Colpo Test Result',
  referralPap: 'Referral Screen Result',
  colpoResult: 'Biopsy Result',
  preTxColpoResult: 'Biopsy Result Before Treatment',
  management: 'Management',
  cin3risk: 'CIN3+ Immediate risk (%)',
  cin3risk5y: 'CIN3+ 5 year risk  (%)',
  confidence: 'Management Confidence Probability',
  treatment: 'Treatment',
  margins: 'Margins'

}


const PROCEDURE = {
  pap: 'Pap Smear',
  colposcopy: 'Colposcopy',
  excision: 'Excision',
  ablation: 'Ablation',
  emb: 'Endometrial Biopsy',
  ecc: 'Endocervical Curettage',
  hpvHighRisk: 'HPV, HIGH RISK',
  hpv16: 'HPV GENOTYPE 16',
  hpv18: 'HPV GENOTYPE 18',
  hpv: 'HPV'
}

// Pap smear results: NILM, ASC-US, ASC-H, LSIL, HSIL, Squamous Cell Carcinoma, AGC, AGC-FN, AIS, Adenocarcinoma, Other

const PAPRESULT = {
  nilm: 'NILM',
  ascus: 'ASC-US',
  asch: 'ASC-H',
  lsil: 'LSIL',
  hsil: 'HSIL',
  scc: 'Squamous Cell Carcinoma',
  agc: 'AGC',
  agcfn: 'AGC-FN',
  ais: 'AIS',
  adenocarcinoma: 'Adenocarcinoma',
  other: 'Other',
  none: 'NONE'
}

// HPV: HRHPV -, HRHPV +, HRHPV 16 -, HRHPV 16 +, HRHPV 18 -, HRHPV 18 +, N/A
// THe first two are the nomenclature used by the ASCCP, the rest by Epic
const HPVRESULT = {
  hpvNegative: 'HPV-negative',
  hpvPositive: 'HPV-positive',

  hrhpvNegative: 'HR HPV -',
  hrhpvPositive: 'HR HPV +',
  positive: 'Positive',
  negative: 'Negative',
  detected: 'Detected',
  notDetected: 'Not Detected',
  hpv16Negative: 'HRHPV 16 +',
  hpv16Positive: 'HRHPV 16 +',
  hpv18Negative: 'HRHPV 18 -',
  hpv18Positive: 'HRHPV 18 +',
  na: 'N/A'
}

// EC/TZ: Present, Absent, N/A

// eslint-disable-next-line no-unused-vars
const TZRESULT = {
  present: 'Present',
  absent: 'Absent',
  na: 'N/A'
}

// Follow-up actions: Ablation, Excision, Endometrial biopsy, Endocervical curettage, Colposcopy, HPV testing, HPV typing, HPV typing 16/18.
//                    Cotesting, Pap, Refer to GYN, Refer to GYN ONC, Pap no longer indicated Other
// Next due date:
//
// Colposcopy: Normal, Unsatisfactory, CIN1, CIN2, CIN3, AIS, ECC Not Done, ECC Negative, ECC Positive, Squamous Cell Carcinoma, Adenocarcinoma, Other

// As of Epic Aug 2020, they changed results like CIN 1 to CIN1
const COLPORESULT = {
  normal: 'Normal',
  cin1: 'CIN1',
  cin2: 'CIN2',
  cin3: 'CIN3',
  ais: 'AIS',
  scc: 'Squamous Cell Carcinoma',
  adenocarcinoma: 'Adenocarcinoma',
  marginsNegative: 'Margins Negative',
  marginsPositive: 'Margins Positive',
  other: 'Other'
}

// Excision: Normal, CIN1, CIN2, CIN3, AIS, Squamous Cell Carcinoma, Adenocarcinoa, Margins Negative, Margins Positive, Other

// eslint-disable-next-line no-unused-vars
const EXCISIONRESULT = {
  normal: 'Normal',
  cin1: 'CIN1',
  cin2: 'CIN2',
  cin3: 'CIN3',
  ais: 'AIS',
  scc: 'Squamous Cell Carcinoma',
  adenocarcinoma: 'Adenocarcinoma',
  marginsNegative: 'Margins Negative',
  marginsPositive: 'Margins Positive',
  other: 'Other'
}

// Ablation: Performed

// eslint-disable-next-line no-unused-vars
const ABLATIONRESULT = {
  performed: 'Performed'
}

// Endometrial Biopsy: Negative, Polyp, Hyperplasia without atypia, Hyperplasia with atypia, Adenocarcinoma-Endocervical, Adenocarcinoma-Endometrial,
//                     Insufficient, Other

// eslint-disable-next-line no-unused-vars
const EMBRESULT = {
  negative: 'Negative',
  polyp: 'Polyp',
  hyperplasiaWithoutAtypia: 'Hyperplasia without atypia',
  hyperplastiaWithAtype: 'Hyperplasia with atypia',
  adenocaEndocervical: 'Adenocarcinoma-Endocervical',
  adenocaEndometrial: 'Adenocarcinoma-Endometrial',
  insufficient: 'Insufficient',
  other: 'Other'
}

// Endocervical Curettage: Negative, LSIL, HSIL, AIS, Squamous cell carcinoma, Adenocarcinom-Endocervical, Insufficient, Other
// eslint-disable-next-line no-unused-vars
const ECCRESULT = {
  negative: 'Negative',
  lsil: 'LSIL',
  hsil: 'HSIL',
  ais: 'AIS',
  scc: 'Squamous cell carcinoma',
  adenocaEndocervical: 'Adenocarcinoma-Endocervical',
  insufficient: 'Insufficient',
  other: 'Other'
}

const pregnancyStateList = [
  'Not pregnant', 'Pregnant'
];

const immunocompromiseStateList = [
  'Not immunocompromised', 'Immunocompromised'
];

const scenarioList = [
  {text: 'Pap management', value: 0, disabled: true},
  {text: 'Pap w/prior abnormal Pap', value: 1, disabled: true},
  {text: 'Post-colposcopy plan', value: 2, disabled: true},
  {text: 'Pap after colposcopy', value: 3, disabled: true},
  {text: 'Pap after treatment', value: 4, disabled: true},
  // Excel file lists bx result just as CIN 3, but article CIN 2 or 3; "ALL" Pap means primary HPV screening without Pap
  // Cotest-negative x 2 row with no current result equates to co-test neg x 1, current co-test negative in article
  // and similar for the rest of the current Pap results - they are blank, but they are really included in the Current HPV result column
  {text: 'Post-treatment', value: 5, disabled: true}
];

const SCENARIO = {
  undefined: -1,
  papManagement: 0,
  papPriorAbnormal: 1,
  postColposcopy: 2,
  papAfterColposcopy: 3,
  papAfterTreatment: 4,
  postTreatment: 5
}

// Color for alert highlighting, depending on management recommendation
const MGMT_COLOR = {
  '5-year follow-up': 'green',
  '3-year follow-up': 'blue',
  '1-year follow-up': 'orange',
  'Colposcopy': 'purple',
  'Colposcopy/Treatment': 'pink',
  'Treatment': 'red'
}

// Sometimes the tables have one item which actually means a lot of things
// Also account for alternative spellings
const papExpansion = {
  'HSIL+': [PAPRESULT.hsil, PAPRESULT.adenocarcinoma, PAPRESULT.ais, PAPRESULT.scc, PAPRESULT.agcfn],
  'High Grade': [PAPRESULT.hsil, PAPRESULT.asch, PAPRESULT.agc, PAPRESULT.adenocarcinoma, PAPRESULT.ais, PAPRESULT.scc, PAPRESULT.agcfn],
  'Low Grade': [PAPRESULT.ascus, PAPRESULT.lsil, PAPRESULT.nilm + '|' + HPVRESULT.hpvPositive],
  'ASC_US': [PAPRESULT.ascus],
  'ASCUS/LSIL': [PAPRESULT.ascus, PAPRESULT.lsil],
  'ASC-US/LSIL': [PAPRESULT.ascus, PAPRESULT.lsil],
  'ASC-US, LSIL': [PAPRESULT.ascus, PAPRESULT.lsil],

  // Moved these to splitCombinedResult
  // 'Cotest-negative': [ PAPRESULT.nilm + '|' + HPVRESULT.hpvNegative ],
  // 'HPV-negative/ASC-US': [ PAPRESULT.ascus + '|' + HPVRESULT.hpvNegative ],
  // 'HPV-positive/NILM': [ PAPRESULT.nilm + '|' + HPVRESULT.hpvPositive ],
  // 'HPV-negative/LSIL' : [ PAPRESULT.lsil + '|' + HPVRESULT.hpvNegative ],
  // 'HPV-negative/ASCUS/LSIL': [ PAPRESULT.ascus + '|' + HPVRESULT.hpvNegative, PAPRESULT.lsil + '|' + HPVRESULT.hpvNegative ],
  'ALL': [''],  // All in the ASCCP spreadsheet means they summed results for all cytology to use as statistics for NONE cytology, e.g., HPV-only testing
  'HPV-negative': ['|' + HPVRESULT.hpvNegative],
  '<CIN1': [COLPORESULT.normal],
  'CIN1': COLPORESULT.cin1,
  'CIN2': COLPORESULT.cin2,
  'CIN3': COLPORESULT.cin3,
  '<CIN2': [COLPORESULT.cin1, COLPORESULT.normal],
  'Cancer': [COLPORESULT.adenocarcinoma, COLPORESULT.scc]
  // Low grade (https://journals.lww.com/jlgtd/Fulltext/2020/04000/2019_ASCCP_Risk_Based_Management_Consensus.3.aspx E.2)
  // defined as HPV+ ASC-US, HPV+ LSIL, HPV+ NILM; see legend for Table 4A
}


// Which of the 5 scenarios is most likely based on the results?
// We're assuming ccsResults is in reverse chronological order
//
// Scenario 1, "Initial management of abnormal screening results" - including both patients without recent HPV
// and with a negative HPV in the last 5 years
//
// Scenario 2, Pap after prior abnormal, is how we handle a Pap smear after an abnormality not requiring colposcopy - it
// includes how to handle a current co-test after prior ASCUS/LSIL with negative HPV and HPV-positive NILM
//
// Scenario 3 is to determine what to do with a colposcopy result; no Paps have been done yet
//
// Scenario 4, Pap after colposcopy, accounts for patients who had a colposcopy and then 1, 2 or 3 Paps - and the
// colposcopy did not find CIN 2 or CIN 3 or worse (so they didn't get treated). THe "pre-colpo" test result
// is what got them referred for colposcopy, and it's either low grade (LSIL, ASCUS, HPV+ NILM) or high grade (ASC-H, AGC, HSIL+).
// So we're looking for Pap, { Pap and/or HPV }
//
// Scenario 5, post-treatment, in the 2019 guidelines is restricted to patients with CIN 2 and 3 who get treated
// then return for the "first post-treatment surveillance round." They are counting the "second and third follow-up rounds."
// That means we are in Scenario 5 if we are looking at a Pap result and have 0, 1 or 2 prior Paps. Table 5A is short-term followup,
// and Table 5B is longer-term with 2-3 negative followup tests after CIN 2/3.
//


function determineScenario(dailyResults, date) {
  let scenario = SCENARIO.undefined;
  let papCount = 0
  let i;
  let dateList = [];
  // let priorDate;


  console.log(`Determining scenario for ${date}`)
  // If the most recent procedure is Colposcopy, we're in scenario 3
  // If Pap and colpo done same day... this is still a colpo
  // if (ccsResults[0].procedure === PROCEDURE.colposcopy || (ccsResults[0].procedure === PROCEDURE.pap && papAndColpoSameDay((ccsResults, ccsResults[0].date)))) {
  if (dailyResults[date].colposcopy) {

    scenario = SCENARIO.postColposcopy
    console.log(`(a) Determined ${date} is scenario ${scenario}`)
    return scenario;

  } else if (dailyResults[date].excision || dailyResults[date].ablation) {
    scenario = SCENARIO.postTreatment
    console.log(`(b) Determined ${date} is scenario ${scenario}`)
    return scenario;

  } else if (dailyResults[date].pap && Object.keys(dailyResults).length === 1) {
    // If there is only one procedure and it's a Pap, we're in scenario 1

    scenario = SCENARIO.papManagement;
    console.log(`(c) Determined ${date} is scenario ${scenario}`)
    return scenario;
  }

  // Count backwards to see how many Paps there are following a colposcopy (Scenario 4) or tx (Scenario 5)
  // for (i = 0; i < ccsResults.length; i++) {
  // Assumes the object is stored in order of dates, which is how we built it
  // We may not be able to guarantee this for all browsers... so we'll sort the array just in case
  // priorDate = date;
  dateList = Object.keys(dailyResults);
  dateList.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });
  console.log("Sorted date list:", dateList)
  for (i = 0; i < dateList.length; i++) {
    // Object.keys(dailyResults).forEach(priorDate => {

    if (Date.parse(dateList[i]) <= Date.parse(date)) {
      console.log(`Checking prior date ${dateList[i]}, iteration ${i}`);
      console.log(dailyResults[dateList[i]]);
      // Don't count Paps occurring on the same day as colposcopies
      if (dailyResults[dateList[i]].pap && !(dailyResults[dateList[i]].pap && dailyResults[dateList[i]].colposcopy)) {
        papCount++;
        console.log(`Pap ${papCount} on ${dateList[i]}`)
      }

      if (dailyResults[dateList[i]].excision || dailyResults[dateList[i]].ablation) {
        console.log(`Found an excision/ablation.`);
        console.log(dailyResults[dateList[i]]);
        if (papCount <= 3) {
          scenario = SCENARIO.papAfterTreatment;
          console.log(`(d) Determined ${date} is scenario ${scenario}`)

          return (scenario);
        }
      }

      if (dailyResults[dateList[i]].colposcopy) {
        console.log(`Found a colposcopy.`);
        console.log(dailyResults[dateList[i]]);
        if (papCount <= 3) {
          scenario = SCENARIO.papAfterColposcopy
          console.log(`(e) Determined ${date} is scenario ${scenario}`)

          return (scenario)
        }
      }

    }
  }
  // if (scenario != SCENARIO.undefined) {
  //   return (scenario);
  // }


  // We're not in scenario 3, 4 or 5 or 6 so now we decide between 1 and 2
  // We'll start by assuming we're in scenario 1, then go back 5 years looking for a positive HPV, ASCUS or LSIL
  // We will look at the prior result even if it's more than 5 years ago to handle flaky people who didn't return for
  // screening for 5 years
  scenario = SCENARIO.papManagement;

  // dateList = Object.keys(dailyResults);
  // for (i = 1; i < ccsResults.length; i++) {
  for (i = 1; i < dateList.length; i++) {
    // Skip the first one

    // And skip any newer than the date we're examining
    if (Date.parse(dateList[i]) >= Date.parse(date)) {
      continue;
    }
    console.log(`Checking ${dateList[i]}`);
    console.log(dailyResults[dateList[i]]);

    if ((dailyResults[dateList[i]].hpv && dailyResults[dateList[i]].hpv.isInList(HPVRESULT.detected, HPVRESULT.hrhpvPositive,
        HPVRESULT.hpvPositive, HPVRESULT.positive, HPVRESULT.hpv16Positive, HPVRESULT.hpv18Positive)) ||
        ((dailyResults[dateList[i]].pap) && (dailyResults[dateList[i]].pap.isInList(PAPRESULT.ascus, PAPRESULT.lsil)))) {
      scenario = SCENARIO.papPriorAbnormal;
      break;
    }
    // We've looked at at least the most recent result; is the next one more than 5 years old?
    // Converting the difference from milliseconds to seconds to minutes to hours to days to years by division
    if (((Date.parse(date) - Date.parse(ccsResults[i].date)) / 1000 / 60 / 60 / 24 / 365.25) > 5) {
      break;
    }
  }

  console.log(`(f) Determined this is scenario ${scenario}`)

  return scenario;

}


// Does an ASCCP table HPV result match what's in a patient's CCS table result?
// ASCCP: HPV-negative, HPV-positive, HPV16+, HPV16-,18+
// CCS result table: HPVRESULT object literal above
// eslint-disable-next-line no-unused-vars
function hpvMatch(asccpResult, ccsResults, date) {
  var i, j;
  var hpvResult = [];

  for (i = 0; i < ccsResults.length; i++) {
    if (date === ccsResults[i].date && ccsResults[i].procedure.startsWith('HPV')) {
      hpvResult.push({procedure: ccsResults[i].procedure, result: ccsResults[i].result});
    }
  }

  switch (asccpResult) {
    case 'HPV-negative':
      for (i = 0; i < hpvResult.length; i++) {
        if (hpvResult[i].procedure.isInList(PROCEDURE.hpvHighRisk, PROCEDURE.hpv) &&
            hpvResult[i].result.isInList(HPVRESULT.notDetected, HPVRESULT.negative, HPVRESULT.hrhpvNegative, HPVRESULT.hpvNegative)) {
          return true;
          // break;
        }
      }
      return false;
      // break;
    case 'HPV-positive':
      for (i = 0; i < hpvResult.length; i++) {
        if (hpvResult[i].procedure.isInList(PROCEDURE.hpvHighRisk, PROCEDURE.hpv) &&
            hpvResult[i].result.isInList(HPVRESULT.detected, HPVRESULT.positive, HPVRESULT.hrhpvPositive, HPVRESULT.hpvPositive)) {
          return true;
          // break;
        }
      }
      return false;
      // break;
    case 'HPV16+':
      for (i = 0; i < hpvResult.length; i++) {
        if (hpvResult[i].procedure.isInList(PROCEDURE.hpv16) &&
            hpvResult[i].result.isInList(HPVRESULT.hpv16Positive)) {
          return true;
          // break;
        }
      }
      return false;
      // break;
    case 'HPV16-,18+':
      for (i = 0; i < hpvResult.length; i++) {
        if (hpvResult[i].procedure.isInList(PROCEDURE.hpv16) &&
            hpvResult[i].result.isInList(HPVRESULT.hpv16Negative, HPVRESULT.notDetected, HPVRESULT.negative, HPVRESULT.hpvNegative)) {
          for (j = 0; j < hpvResult.length; j++) {
            if (hpvResult[j].procedure.isInList(PROCEDURE.hpv18) &&
                hpvResult[j].result.isInList(HPVRESULT.hpv18Positive, HPVRESULT.detected, HPVRESULT.positive, HPVRESULT.hpvPositive)) {
              return true;
              // break;
            }
          }
        }
      }
      return false;
      // break;
    default:
      return false;

  }

}

// Combine all the results on a given date into one item
function combineDailyResults(ccsResults) {
  let i, serial = 0;
  let date;
  let dailyResult = {};

  console.log(`Combining results. Starting with:`);
  console.log(ccsResults);

  for (i = 0; i < ccsResults.length; i++) {
    date = ccsResults[i].date;

    if (!dailyResult[date]) {
      dailyResult[date] = {}
      dailyResult[date].date = date;
      dailyResult[date].age = Math.floor((Date.parse(date) - Date.parse(patient.birthdate)) / (1000 * 60 * 60 * 24 * 365.25))
      // console.log("Set result age to ", dailyResult[date].age)
      dailyResult[date].index = serial++;
    }

    if (!ccsResults[i].procedure) {
      continue;
    }
    if (ccsResults[i].procedure.includes(PROCEDURE.pap)) {
      dailyResult[date].pap = ccsResults[i].result;
      dailyResult[date].tz = ccsResults[i].tz;
    }
    if (ccsResults[i].procedure.includes(PROCEDURE.hpv16)) {
      dailyResult[date].hpv16 = ccsResults[i].result
    }
    if (ccsResults[i].procedure.includes(PROCEDURE.hpv18)) {
      dailyResult[date].hpv18 = ccsResults[i].result
    }
    if (ccsResults[i].procedure.isInList("HPV", "HPV, high-risk", "HPV, HIGH RISK")) {
      dailyResult[date].hpv = ccsResults[i].result;
    }
    if (ccsResults[i].procedure.includes(PROCEDURE.colposcopy)) {
      dailyResult[date].colposcopy = ccsResults[i].result;
    }
    if (ccsResults[i].procedure.includes(PROCEDURE.excision)) {
      console.log(`### Found an excision on ${date}, and it's a(n) ${typeof (ccsResults[i].result)}`)

      if (typeof (ccsResults[i].result) === "object") {
        // TODO: Assumes the excision comes first; we need a general way of splitting up arrays here as scalars
        // Could probably just swap them if needed
        [dailyResult[date].excision, dailyResult[date].margins] = ccsResults[i].result;

      } else {
        dailyResult[date].excision = ccsResults[i].result;
      }
    }
    if (ccsResults[i].procedure.includes(PROCEDURE.emb)) {
      dailyResult[date].emb = ccsResults[i].result;
    }
    if (ccsResults[i].procedure.includes(PROCEDURE.ecc)) {
      dailyResult[date].ecc = ccsResults[i].result;
    }
    if (ccsResults[i].procedure.includes(PROCEDURE.ablation)) {
      dailyResult[date].ablation = ccsResults[i].result;
    }


  }
  console.log(`Daily results`);
  console.log(JSON.stringify(dailyResult));
  console.log(dailyResult);


  return dailyResult;
}

//
// When is N years form now? (E.g., 25 y, because that's when we can stop screening after CIN2/3
//

function addYears(date, n) {
  let newDate = new Date(date);
  return(`${newDate.getMonth() + 1}/${newDate.getFullYear() + n}`);
}

function getPriorDate(dailyResults, date) {
  let resultDates = Object.keys(dailyResults);

  for (let i = 1; i < resultDates.length; i++) {
    if (Date.parse(resultDates[i]) < Date.parse(date)) {

      // console.log(`(${Date.parse(date)}) precedes (${Date.parse(resultDates[i])}) by ${Date.parse(date) - Date.parse(resultDates[i])}`);


      return resultDates[i];
    }
  }

  return null;
}

// Is a patient's age in the range of this graph node? (e.g., 45 is in 25-65?)
// Takes a node, not the whole array of node objects
function ageInRange(age, node) {
  let min, max;
  // console.log(`In ageInRange with ${node}`)
  // for (i = 0; i < node.length; i++) {
  if (node.ageRange) {
    [min, max] = node.ageRange.split('-');
    // console.log(`Is ${age} between ${min} and ${max}?`)
    if ((age >= min) && age <= max) {
      return true;
    }
  }
  //}

  return false;
}

// Recursively traverse (depth-wise) the scenario tree, looking for the leaf node
// Start with a matching node, stop at leaf nodes, if we run out of nodes without a match, or if the age range isn't a match
// Returns array of matches per scenario

// synonym: are we being called from a synonym? If so, no need to check for matches - we already matched
// preColposcopy: in scenario 4, we skipped over a colposcopy result and are looking for pre-colpo results
function burrow(scenarioTree, scenario, level, nodeName, dailyResults, date, patient, synonym, preColposcopy) {
  let node, childNodeList, childNodeName, i, j, priorDate, childNodeList2;

  priorDate = getPriorDate(dailyResults, date);

  console.log(`Burrowing: scenario ${scenario}, searching for node ${nodeName}, date ${date}, level ${level}`) // ${scenarioTree.outEdges(nodeName).length} children:`)
  // console.log(scenarioTree.outEdges(nodeName));

  if (!scenarioTree.hasNode(nodeName)) {
    console.log("Entry node not found");
    return null;
  }
  node = scenarioTree.node(nodeName);

  console.log("Landed on this node to start:", node);
  console.log("Daily results: ", dailyResults[date])

  if (node.leaf && ageInRange(dailyResults[date].age, node) && node.procedure === dailyResults[date].pap && (node.hpv === dailyResults[date].hpv || node.hpv === 'Any') && !dailyResults[date].colposcopy) {
    console.log(`Burrow: matched ${nodeName} at entry, level ${level}, scenario ${scenario}`);
    if (isNaN(node.cin3risk5y)) {
      node.cin3risk5y = -1;
    }
    return (node)
  }
  console.log("Children:", scenarioTree.outEdges(nodeName));

  if (!dailyResults[date].pap) {  // handles HPV-only screens
    dailyResults[date].pap = '';
  }
  if (!dailyResults[date].hpv) {  // Handles Pap only results
    dailyResults[date].hpv = '';
  }

  if (date) {   // We haven't run out of results yet
    switch (scenario) {
      case SCENARIO.papManagement: // Scenario 1
        // childNodeList = scenarioTree.outEdges(nodeName);
        // for (i = 0; i < childNodeList.length; i++) {
        //   childNodeName = childNodeList[i]['w'];
        //   console.log(`Burrow scenario ${scenario} considering child node ${childNodeName}`)
        //   node = scenarioTree.node(childNodeName);
        //   level++;
        //
        //   // Check for synonym nodes and skip them
        //   if (node.procedure === dailyResults[date].pap && (node.hpv == dailyResults[date].hpv || node.hpv ==="Any")
        //       && (node.synonym || childNodeName.startsWith('s|'))) {
        //     node = burrow(scenarioTree, scenario, level, childNodeName, dailyResults, date, patient, true);
        //     return (node);
        //   } else {
        //
        //     if ((node.noHistory ||
        //         (synonym ||
        //             (node.procedure === dailyResults[date].pap) && ((node.hpv === dailyResults[date].hpv) || node.hpv === "Any")))) {
        //       console.log("Found a potential match")
        //       if (node.leaf) {
        //         console.log(`Burrow: matched ${childNodeName} at level ${level}, scenario ${scenario}`);
        //         if (isNaN(node.cin3risk5y)) {
        //           node.cin3risk5y = -1;
        //         }
        //         return (node)
        //       } else {
        //         console.log("Burrowing further");
        //         if (priorDate) {
        //           node = burrow(scenarioTree, scenario, level, childNodeName, dailyResults, priorDate, patient, false);
        //           return (node);
        //         } else {
        //           return null;
        //         }
        //       }
        //     }
        //
        //   }
        // }
        //
        // break;
        // eslint-disable-next-line no-fallthrough
      case SCENARIO.papPriorAbnormal: // Scenario 2

        childNodeList = scenarioTree.outEdges(nodeName);
        if (node.synonym) {
          synonym = true; // May also be true if !node.synonym (e.g., if it's passed in)
        }
        for (i = 0; i < childNodeList.length; i++) {
          childNodeName = childNodeList[i]['w'];
          console.log(`Burrow scenario ${scenario} considering child node ${childNodeName}`)
          node = scenarioTree.node(childNodeName);
          console.log(node);
          level++;

          if (!priorDate) {
            if (node.noHistory &&  ageInRange(dailyResults[date].age, node)) {
              console.log(`Ran out of results at a NO HISTORY node: that's a match.`);
              if (isNaN(node.cin3risk5y)) {
                node.cin3risk5y = -1;
              }
              return (node);
            }
          } else if (node.procedure === dailyResults[priorDate].pap && (node.hpv == dailyResults[priorDate].hpv || node.hpv === "Any")
              || (node.synonym || childNodeName.startsWith('s|'))) {
            console.log("It's a synonym. Burrowing downward.")
            node = burrow(scenarioTree, scenario, level, childNodeName, dailyResults, date, patient, true, false);
            return (node);
          } else {
            console.log(`Does ${childNodeName} match with ${dailyResults[priorDate].pap}|${dailyResults[priorDate].hpv} - age ${dailyResults[priorDate].age}, done on ${date}?`)
            console.log("Child node: ", node);
            if (synonym || (ageInRange(dailyResults[priorDate].age, node) && node.procedure === dailyResults[priorDate].pap &&
                (node.hpv === dailyResults[priorDate].hpv || node.hpv === "Any") && ageInRange(dailyResults[priorDate].age, node))) {
              level++;
              console.log(`It does.`);

              if (node.leaf) {
                console.log(`Burrow: matched ${childNodeName} at level ${level}, scenario ${scenario}`);
                if (isNaN(node.cin3risk5y)) {
                  node.cin3risk5y = -1;
                }
                return (node);
              } else {
                console.log("Burrowing further (it's not a leaf)");
                if (priorDate) {
                  node = burrow(scenarioTree, scenario, level, childNodeName, dailyResults, priorDate, patient, false, false);
                  return (node);
                } else {
                  return null;
                }
              }
            } else {
              console.log("It doesn't match.");
            }
          }
        }
        break;

      case SCENARIO.postColposcopy:   // Scenario 3
        // node = scenarioTree.node(nodeName);

        if (node.leaf && ageInRange(dailyResults[date].age, node)) { // Higher grade biopsies show up as primary leaf nodes (with '-' as the Referral screen result;
          if (isNaN(node.cin3risk5y)) {
            node.cin3risk5y = -1;
          }
          return (node)
        }

        childNodeList = scenarioTree.outEdges(nodeName);

        for (i = 0; i < childNodeList.length; i++) {
          childNodeName = childNodeList[i]['w'];
          if (node.synonym) {
            console.log("Node is a synonym. Burrowing deeper.", node)
            node = burrow(scenarioTree, scenario, level, childNodeName, dailyResults, date, patient, synonym, false);
            return (node);
          }
          level++;

          console.log(`(3) Burrow scenario ${scenario} considering child node ${childNodeName}`)
          node = scenarioTree.node(childNodeName);
          console.log(node);

          if (priorDate) {
            date = priorDate;
          } else {
            console.log("Didn't match.")

            return null;
          }
          let hpvIrrelevant = false;

          // We care about referral screen HPV results for NILM, ASC-US and LSIL; we don't seem to care about them
          // for ASC-H, AGC, or HSIL+ - this is the same as what's in papExpansion['High Grade']
          if (papExpansion['High Grade'].includes(dailyResults[date].pap)) {
            hpvIrrelevant = true;
          }
          console.log("Does it match daily results? ", dailyResults[date]);
          // For Scenario 3, ASCCP isn't consider isotypes - just HPV positive or negative
          // and really only no HPV considered or HPV-positive - we're not matching on HPV-negative
          if (ageInRange(dailyResults[date].age, node) && (node.procedure === dailyResults[date].pap && (hpvIrrelevant || node.hpv ? HPVRESULT.hpvPositive : dailyResults[date].hpv.isInList(HPVRESULT.hpvPositive,
              HPVRESULT.hrhpvPositive, HPVRESULT.positive, HPVRESULT.detected, HPVRESULT.hpv16Positive, HPVRESULT.hpv18Positive)) || node.procedure === 'Any') ) {
            level++;
            if (!node.leaf) {
              // This is a synonym; go down one more node
              console.log("So far, matched daily results:", dailyResults[date]);
              childNodeName = scenarioTree.outEdges(childNodeName); // There will only be one
              node = scenarioTree.node(childNodeName);
            }
            console.log("Matched node: ", node);
            if (!node.cin3risk5y || isNaN(node.cin3risk5y)) {
              node.cin3risk5y = -1;
            }
            return (node)
          } else {
            console.log("Not that child.");
          }

        }
        console.log("Didn't match.");

        break;

      case SCENARIO.papAfterColposcopy:   // Scenario 4
        childNodeList = scenarioTree.outEdges(nodeName);
        if (node.synonym) {
          synonym = true; // May also be true if !node.synonym (e.g., if it's passed in)
        }
        for (i = 0; i < childNodeList.length; i++) {
          childNodeName = childNodeList[i]['w'];
          console.log(`Burrow scenario ${scenario} considering child node ${childNodeName}`)
          node = scenarioTree.node(childNodeName);
          console.log(node);
          level++;

          if (node.synonym) { // Synonyms (like "ASCUS/LSIL") don't need to match; they should hve just one child
            console.log(`It's a synonym. Burrowing downward in tree, with date ${priorDate}.`)
            node = burrow(scenarioTree, scenario, level, childNodeName, dailyResults, priorDate, patient, true, false);
            return (node);
          } else {
            console.log(`Does ${childNodeName} match with ${dailyResults[date].pap}|${dailyResults[date].hpv} - done on ${date}?`)
            console.log("Child node: ", node);
            console.log("Daily results: ", dailyResults[date]);
            if (node.procedure === dailyResults[date].pap &&
                (node.hpv === dailyResults[date].hpv || node.hpv === "Any") && !dailyResults.colposcopy) {
              level++;
              console.log(`It does.`);

              if (node.leaf && node.preColposcopy ) {
                console.log(`Burrow: matched ${childNodeName} at level ${level}, scenario ${scenario}`);
                if (isNaN(node.cin3risk5y)) {
                  node.cin3risk5y = -1;
                }
                return (node)
              } else {
                console.log("Can we burrow further? (Not a leaf)");
                if (priorDate) {
                  console.log("Yes.")
                  node = burrow(scenarioTree, scenario, level, childNodeName, dailyResults, priorDate, patient, false, preColposcopy);
                  return (node);
                } else {
                  console.log("Nope.")
                }
              }
            } else if (dailyResults[date].colposcopy) {   // Handle the case of a node showing nothing (no Pap prior to colposcopy)
              console.log(`Date ${date} is a colposcopy; burrowing downward before the colposcopy to prior date ${priorDate} and lower node.`)
              console.log(`Children of child node ${childNodeName}:`);
              console.log(scenarioTree.outEdges(childNodeName));
              childNodeList2 = scenarioTree.outEdges(childNodeName);

              for (j = 0; j < childNodeList2.length; j++) {

                node = burrow(scenarioTree, scenario, level, childNodeList2[j]['w'], dailyResults, priorDate, patient, false, true);
                if (node) {
                  return (node);
                }
              }

            } else {
              console.log("It doesn't match.");
            }
          }
        }
        break;

      case SCENARIO.papAfterTreatment:    // Scenario 5
        childNodeList = scenarioTree.outEdges(nodeName);
        for (i = 0; i < childNodeList.length; i++) {
          childNodeName = childNodeList[i]['w'];

          // The next node down will either be a Bx result before treatment or prior Pap
          node = scenarioTree.node(childNodeName);
          level++;

          // Check for synonym nodes and skip them
          if (node.synonym || childNodeName.startsWith('s|')) {
            node = burrow(scenarioTree, scenario, level, childNodeName, dailyResults, date, patient);
            return (node);
          } else {


            if ((node.procedure === dailyResults[date].pap) && ((node.hpv === dailyResults[date].hpv) || node.hpv === "Any") ||
                (node.colposcopy === dailyResults[date].colposcopy)) {
              console.log("Found a potential match")
              if (node.leaf && ageInRange(dailyResults[date].age, node)) {  // We matched a leaf
                console.log(`Burrow: matched ${childNodeName} at level ${level}, scenario ${scenario}`);
                if (isNaN(node.cin3risk5y)) {
                  node.cin3risk5y = -1;
                }
                return (node)
              } else {
                console.log("Burrowing further")
                if (priorDate) {
                  node = burrow(scenarioTree, scenario, level, childNodeName, dailyResults, date, patient);
                  return (node);
                } else {
                  return null;
                }
              }
            }

          }
        }
        break;
    }
  }
  return null;
}

//
// Add a reference ot a figure if it isn't already there
//
function addFigure(figures, figure) {


  let i;

  for (i = 0; i < figures.length; i++) {
    if (figures[i].title === `Figure ${figure}`) {
      return;
    }
  }
  figures.push(FIGURE[figure.toString()]);

}

// Is there histologic HSIL on a given date?
function isThereHSIL(dailyResults, date) {
  // console.log(`Checking for HSIL on ${date}`)
  // console.log(dailyResults[date]);
  if (!dailyResults[date]) {
    return false;
  }

  if ((dailyResults[date].colposcopy &&
      dailyResults[date].colposcopy.isInList(COLPORESULT.cin3, COLPORESULT.cin2, COLPORESULT.ais, COLPORESULT.adenocarcinoma)) ||
      (dailyResults[date].excision &&
          dailyResults[date].excision.isInList(EXCISIONRESULT.cin3, EXCISIONRESULT.cin2,
              EXCISIONRESULT.ais, EXCISIONRESULT.adenocarcinoma, EXCISIONRESULT.scc))) {
    // console.log("Found it");
    return true;
  }
  return false;
}

//
// Returns most recent date of HSIL if there is a history of histologic HSIL (CIN 2 or CIN 3) in the last 25 years from a given date
// (In which case the patient needs ot be screened at least every 3 years)
//
function isThereHSILWithin25y(dailyResults, date) {
  let i;
  let dateList = Object.keys(dailyResults);
  dateList.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });
  console.log("Datelist: ", dateList)
  for (i = 0; i < dateList.length; i++) {
    if (Date.parse(date) >= Date.parse(dateList[i])) {
      // console.log(`Looking for HSIL on ${i}, ${dateList[i]}`)

      if (isThereHSIL(dailyResults, dateList[i])) {
        // console.log(`Found HSIL on ${dateList[i]}, comparing to ${date} - ${Date.parse(date)} vs ${Date.parse(dateList[i])}`);
        if (((Date.parse(date) - Date.parse(dateList[i])) / 1000 / 60 / 60 / 24 / 365.25) <= 25)
            // console.log(`Found HSIL within 25 years of ${date}`);
          return dateList[i];
      }
    }
  }
  return null;
}

//
// Return true if there is any unreconciled data on or before a given date, which
// may make all of the results from that date forward invalid
//
function isThereUnreconciledData(dailyResults, date) {
  let i, j;
  let resultList = [];
  let unreconciledList = [];
  let dateList = Object.keys(dailyResults);


  dateList.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  for (i = 0; i < dateList.length; i++) {
    if (Date.parse(date) >= Date.parse(dateList[i])) {

      resultList = Object.keys(dailyResults[dateList[i]]);
      for (j = 0; j < resultList.length; j++) {
        // console.log(`Checking ${resultList[j]} on ${dateList[i]} for unreconciled data: ${dailyResults[dateList[i]][resultList[j]]}`)

        if (dailyResults[dateList[i]][resultList[j]] === '') {
          unreconciledList.push({"result": resultList[j], "date": dateList[i]});
          // console.log(`Unreconciled data found at ${dateList[i]}: ${resultList[j]}`)
        }
      }
    }
  }
  return unreconciledList;
}

// Given a patient and their cervical cancer screening results, go through each scenario
// and come up with recommendations for it
//
// Continued surveillance with HPV or co-testing at 3 year intervals for at least 25 y is recommended after tx and initial post-tx management
// of histologic HSIL, CIN 2, CIN 3 or AIS. Continued surveillance at 3 y intervlas beyond 25 y is acceptable if life expectancy/ability to be screened exists
//
function makeRecommendations(patient, dailyResultsOriginal, scenarioTree, date) {

  let i;
  // eslint-disable-next-line no-unused-vars
  let node = {};
  let notes = {};
  // let level = 0;
  // let priorLevel = 0;
  let childNode = {};
  let match = [];
  let originalDate = date;

  let nodeName;
  let hpvResult, papResult;

  // Work on a copy of the results; we're going to set some undefined values to blank
  // which will mess up our display if we keep those
  let dailyResults = {};
  dailyResults = JSON.parse(JSON.stringify(dailyResultsOriginal));

  let age = dailyResults[date].age
  let figure = [];

  notes.histologicHSIL = isThereHSILWithin25y(dailyResults, date);
  notes.unreconciledData = isThereUnreconciledData(dailyResults, date);

  // Not every scenario will be appropriate for every patient, and we'll come up with the one to display by default, but we want the others visible too
  // on the chance there's useful information there
  for (i = 0; i < scenarioList.length; i++) {
    date = originalDate;        // Start at the most recent result for each search
    match[i] = {};
    match[i].figure = [];

    console.log(`makeRecommendations Scenario ${i}, date ${date}, age ${age}`);
    // GO back to an unmodified dailyResults so we can search for the HSIL+ and High Grade cases again...
    // dailyResults = JSON.parse(JSON.stringify(dailyResultsCopy));

    if (!dailyResults[date].pap) {  // handles HPV-only screens (which will come in as undefined)
      dailyResults[date].pap = '';
    }
    if (!dailyResults[date].hpv) {  // Handles HPV-less (e.g., Pap only) results
      dailyResults[date].hpv = '';
    }

    // The ASCCP uses ALL (which we translate to NONE) to mean HPV only, so the Pap part will be blank
    if (dailyResults[date].pap === 'NONE') {
      dailyResults[date].pap = '';
    }

    if (dailyResults[date].pap === PAPRESULT.ais) {
      // figure.push(FIGURE['11']);
      addFigure(figure, 11);
    }

    if (dailyResults[date].pap === PAPRESULT.agc || dailyResults.pap === PAPRESULT.agcfn) {
      // figure.push(FIGURE['11']);
      addFigure(figure, 3);
    }

    if (age < 25 && dailyResults[date].pap.isInList(PAPRESULT.ascus, PAPRESULT.lsil, PAPRESULT.asch, PAPRESULT.hsil)) {
      addFigure(figure, 12);
    }

    // TODO: Absent transformation zone: Figure 6
    // TODO: Unsatisfactory cytology: Figure 5

    switch (i) {
        // Scenario 1, Initial management of abnormal screening results
      case SCENARIO.papManagement:
        console.log(`makeRecommendations: Handling scenario ${i}`);


        nodeName = `${i}|${dailyResults[date].pap}|${dailyResults[date].hpv}`;
        console.log(`(a) Looking for ${nodeName}`);
        match[i] = burrow(scenarioTree, scenario, 0, nodeName, dailyResults, date, patient, false);
        if (match[i]) {
          match[i].figure = match[i].figure.concat(figure);
        }

        // if (scenarioTree.hasNode(nodeName)) {
        //   node = scenarioTree.node(nodeName);
        //   console.log(`(a) Level ${level} match in scenario ${i}, node ${nodeName}. ${scenarioTree.outEdges(nodeName).length} children:`);
        //
        //   match[i] = burrow(scenarioTree, scenario, 0, nodeName, dailyResults, date, patient);
        //
        //   if (match[i]) {
        //     match[i].figure = match[i].figure.concat(figure);
        //   }
        // }


        // if (ageInRange(age, node)) {
        //   do {
        //     console.log(`(a) Level ${level} match in scenario ${i}, node ${nodeName}. ${scenarioTree.outEdges(nodeName).length} children:`);
        //     console.log(scenarioTree.outEdges(nodeName));
        //     date = getPriorDate(dailyResults, date);
        //     if (date) {       // We still have results to process
        //       childNode = {};
        //       priorLevel = level;
        //
        //       if (!dailyResults[date].pap) {  // handles HPV-only screens
        //         dailyResults[date].pap = '';
        //       }
        //       if (!dailyResults[date].hpv) {  // Handles Pap only results
        //         dailyResults[date].hpv = '';
        //       }
        //
        //       (scenarioTree.outEdges(nodeName)).forEach(childNodeName => {
        //         childNodeName = childNodeName['w'];
        //
        //
        //         // If the childNodeName starts with s| it's a synonym (like HSIL+) we're meant to skip through to its children
        //         if (childNodeName.startsWith('s|')) {
        //           console.log(`Skipping through ${childNodeName} to its children:`);
        //           console.log(scenarioTree.outEdges(childNodeName));
        //           (scenarioTree.outEdges(childNodeName)).forEach(childNodeName => {
        //             childNodeName = childNodeName['w'];
        //             childNode = scenarioTree.node(childNodeName);
        //
        //             console.log(`Trying to match ${childNodeName} with Pap ${dailyResults[date].pap} and HPV ${dailyResults[date].hpv} - ${date}`)
        //             if (childNode.procedure === dailyResults[date].pap && childNode.hpv === dailyResults[date].hpv) {
        //               console.log(`>> (a1a) Level ${level} match, scenario 1 childNode:`);
        //               console.log(childNode);
        //               // node = childNode;
        //               match[i] = scenarioTree.node(childNodeName);
        //               match[i].figure.concat(figure);
        //               if (isNaN(match[i].cin3risk5y)) {
        //                 match[i].cin3risk5y = -1;
        //               }
        //             } else {
        //               nodeName = childNodeName;
        //               node = scenarioTree.node(nodeName);
        //
        //             }
        //
        //           });
        //
        //         } else {
        //           childNode = scenarioTree.node(childNodeName);
        //
        //
        //           console.log(`Trying to match ${childNodeName} with Pap ${dailyResults[date].pap} and HPV ${dailyResults[date].hpv} - ${date}`)
        //           if (childNode.procedure === dailyResults[date].pap && childNode.hpv === dailyResults[date].hpv) {
        //             console.log(`>> (a1) Level ${level} match, scenario 1 childNode:`);
        //             console.log(childNode);
        //             // node = childNode;
        //             match[i] = scenarioTree.node(childNodeName);
        //             match[i].figure.concat(figure);
        //
        //             if (isNaN(match[i].cin3risk5y)) {
        //               match[i].cin3risk5y = -1;
        //             }
        //           } else {
        //             nodeName = childNodeName;
        //             node = scenarioTree.node(nodeName);
        //
        //           }
        //         }
        //       })
        //
        //     }
        //   } while (node && !node.leaf && !match[i] && date)
        //
        // }
        // }
        break;

        // Scenario 2, Pap after prior abnormal
        // We're looking at the current Pap smear and HPV results, the prior one, and the one before that
        // We can base results on 1 prior if 2 Paps ago isn't included
      case SCENARIO.papPriorAbnormal:
        console.log(`makeRecommendations: Handling scenario ${i} (papPriorAbnormal)`);

        nodeName = `${i}|${dailyResults[date].pap}|${dailyResults[date].hpv}`;

        console.log(`(b) Looking for ${nodeName}`);
        match[i] = burrow(scenarioTree, scenario, 0, nodeName, dailyResults, date, patient, false);
        if (match[i]) {
          match[i].figure = match[i].figure.concat(figure);
        }

        // if (scenarioTree.hasNode(nodeName)) {
        //   node = scenarioTree.node(nodeName)
        //   console.log(`(b0) Level ${level} match in scenario ${i}, node ${nodeName}. ${scenarioTree.outEdges(nodeName).length} children:`);
        //   console.log(scenarioTree.outEdges(nodeName));
        //   do  {
        //
        //     date = getPriorDate(dailyResults, date);
        //     if (date) {   // e.g., we haven't run out of results yet
        //       console.log(`Looking for matches on ${date}`)
        //       childNode = {};
        //       priorLevel = level;
        //
        //       if (!dailyResults[date].pap) {  // handles HPV-only screens
        //         dailyResults[date].pap = '';
        //       }
        //       if (!dailyResults[date].hpv) {  // Handles Pap only results
        //         dailyResults[date].hpv = '';
        //       }
        //
        //
        //       (scenarioTree.outEdges(nodeName)).forEach(childNodeName => {
        //         childNodeName = childNodeName['w'];
        //
        //         // If the childNodeName starts with s| it's a synonym (like HSIL+) we're meant to skip through to its children
        //         if (childNodeName.startsWith('s|')) {
        //           console.log(`Skipping through ${childNodeName} to its children:`);
        //           console.log(scenarioTree.outEdges(childNodeName));
        //           (scenarioTree.outEdges(childNodeName)).forEach(childNodeName => {
        //             childNodeName = childNodeName['w'];
        //             childNode = scenarioTree.node(childNodeName);
        //
        //             console.log(`Does ${childNodeName} match with ${dailyResults[date].pap}|${dailyResults[date].hpv} - done on ${date}?`)
        //             if (childNode.procedure === dailyResults[date].pap && childNode.hpv === dailyResults[date].hpv) {
        //               level++;
        //               console.log(`It does.`);
        //
        //               if (childNode.leaf) {
        //                 console.log(`>> Level ${level} match scenario 2 childNode:`);
        //                 console.log(childNode);
        //                 match[i] = scenarioTree.node(childNodeName);
        //                 match[i].figure = match[i].figure.concat(figure);
        //
        //                 if (isNaN(match[i].cin3risk5y)) {
        //                   match[i].cin3risk5y = -1;
        //                 }
        //               } else {
        //                 console.log("But it's not a leaf.")
        //                 nodeName = childNodeName;
        //                 node = scenarioTree.node(nodeName);
        //               }
        //             }
        //           });
        //         } else {
        //
        //           childNode = scenarioTree.node(childNodeName);
        //           console.log(`Does ${childNodeName} match with ${dailyResults[date].pap}|${dailyResults[date].hpv} - done on ${date}?`)
        //           if ((childNode.procedure === dailyResults[date].pap) && (childNode.hpv === dailyResults[date].hpv)) {
        //             level++;
        //             console.log("It does.")
        //             if (childNode.leaf) {
        //               console.log(`>> Level ${level} match scenario 2 childNode:`);
        //               console.log(childNode);
        //               match[i] = scenarioTree.node(childNodeName);
        //               match[i].figure = match[i].figure.concat(figure);
        //
        //               if (isNaN(match[i].cin3risk5y)) {
        //                 match[i].cin3risk5y = -1;
        //               }
        //             } else {
        //               console.log("But it's not a leaf.")
        //               nodeName = childNodeName;
        //               node = scenarioTree.node(nodeName);
        //             }
        //
        //           }
        //         }
        //       })
        //     }
        //   } while (node && !node.leaf && !match[i] && date)
        //   node = childNode;
        //   if (node) {
        //     nodeName = childNode.name;
        //
        //   }
        //
        //
        // }
        break;
        // Scenario 3
      case SCENARIO.postColposcopy:
        console.log(`makeRecommendations: Handling scenario ${i}, current result: ${dailyResults[date].colposcopy}`);
        nodeName = `${i}|${dailyResults[date].colposcopy}`
        console.log(`(c) Looking for match for scenario ${i}, node ${nodeName}`);
        match[i] = burrow(scenarioTree, scenario, 0, nodeName, dailyResults, date, patient, false);

        // if (scenarioTree.hasNode(nodeName)) {
        //   node = scenarioTree.node(nodeName)
        //   // if (ageInRange(age, node)) {
        //   console.log(`(c) Level ${level} match in scenario ${i}, node ${nodeName}. There are ${scenarioTree.outEdges(nodeName).length} children:`);
        //   console.log(scenarioTree.outEdges(nodeName));
        //
        //
        //
        //
        //   date = getPriorDate(dailyResults, date);
        //   if (date) {         // There are still prior results to look at
        //     if (node.leaf) {    // Higher grade biopsies show up in leaf nodes (with '-' as the Referral screen result;
        //       // It doesn't matter what came before; they are getting treated
        //       console.log(`(c1) Level ${level} match is a leaf.`);
        //       match[i] = scenarioTree.node(nodeName);
        //       match[i].figure = match[i].figure.concat(figure);
        //
        //       console.log("Here's our match:" + JSON.stringify(match[i]))
        //
        //       if (isNaN(match[i].cin3risk5y)) {
        //         match[i].cin3risk5y = -1;
        //       }
        //       break;
        //     }
        //
        //     priorLevel = level;
        //
        //     (scenarioTree.outEdges(nodeName)).forEach(childNodeName => {
        //       let hpvIrrelevant = false;
        //
        //       childNodeName = childNodeName['w'];
        //       childNode = scenarioTree.node(childNodeName);
        //       console.log(`Examining child node ${childNodeName}`)
        //
        //
        //
        //       // We care about referral screen HPV results for NILM, ASC-US and LSIL; we don't seem to care about them
        //       // for ASC-H, AGC, or HSIL+ - this is the same as what's in papExpansion['High Grade']
        //       // TODO: and for any of those high-grade results, the app returns an algorithm figure, not just what's in the table
        //       if (papExpansion['High Grade'].includes(dailyResults[date].pap)) {
        //         hpvIrrelevant = true;
        //
        //         // Stick a reference to the figure in the results
        //         // ASC-H: Figure 10 (CIN 1 preceded by ASC-H, Followup after AGC)
        //         // AGC: Figure 3 + 4 (initial workup of AGC)
        //         // HSIL: Figure 9 (CIN 1 preceded by HSIL)
        //
        //
        //       }
        //       // And for CIN 2 or 3, refer to figure 7
        //       // And for CIN 2, add a reference to Figure 8 with the link "Concerns about future pregnancy?"
        //       // For AIS, figure 11
        //       // For pregnancy, yield the message: "ECC, EMB, and treatment without biopsy are not acceptable during pregnancy.
        //       // Excision or repeat biopsy is recommended only if cancer is suspect based on cytology, visualization during colposcopy or the colposcopic biopsy result.
        //
        //       // if (papExpansion["HSIL+"].includes(dailyResults[date].pap)) {
        //       //   dailyResults[date].pap = papExpansion["HSIL+"].toString();
        //       //
        //       // }
        //
        //       // console.log(`Trying to match ${childNodeName} with referral screen Pap ${priorResult.pap} and HPV ${priorResult.hpv}`)
        //       // console.log(`Child node: ${childNode.procedure.length}|${childNode.hpv}; prior Pap: ${priorResult.pap.length}|${priorResult.hpv}`)
        //       // console.log(`Pap comparison: ${childNodeName.procedure === priorResult.pap}, HPV comparison: ${childNode.hpv === priorResult.hpv}`);
        //
        //
        //       if (childNode.procedure === dailyResults[date].pap && ( (childNode.hpv === dailyResults[date].hpv) || hpvIrrelevant)) {
        //         level++;
        //         console.log(`(c2) Level ${level} match for ${dailyResults[date].pap}|${dailyResults[date].hpv}, post-colpo childNode:`);
        //         console.log(childNode);
        //         if (!childNode.leaf) { // This is a synonym; go down one more node
        //           console.log(`Working our way down from synonym ${childNodeName}...`);
        //           // console.log(`Umm, just checking. Children of 2-13-2|HSIL+| are: ${scenarioTree.children('2-13-2|HSIL+|')}`)
        //           console.log(`...which has the following child: ${scenarioTree.outEdges(childNodeName)}`);
        //           childNodeName = scenarioTree.outEdges(childNodeName); // There will only be one
        //           console.log(`To ${childNodeName}`)
        //         }
        //         match[i] = scenarioTree.node(childNodeName);
        //         match[i].figure = match[i].figure.concat(figure);
        //
        //         if (isNaN(match[i].cin3risk5y)) {
        //           match[i].cin3risk5y = -1;
        //         }
        //       }
        //     })
        //
        //
        //
        //
        //     if (level === priorLevel) {  // We went through all the child nodes and none matches
        //       break;
        //     }
        //   }
        // }
        break;

      case SCENARIO.papAfterColposcopy: // Scenario 4
        console.log(`makeRecommendations: Handling scenario ${i}.`);


        // All high grade results are lumped into one scenario
        // if (papExpansion["High Grade"].includes(dailyResults[date].pap)) {
        //   dailyResults[date].pap = papExpansion["High Grade"].toString();
        // }

        // // The ASCCP uses ALL (which we translate to NONE) to mean HPV only, so the Pap part will be blank
        // if (dailyResults[date].pap === 'NONE') {
        //   dailyResults[date].pap = '';
        // }
        nodeName = `${i}|${dailyResults[date].pap}|${dailyResults[date].hpv}`;
        console.log(`(e) Looking for ${nodeName}`);

        match[i] = burrow(scenarioTree, scenario, 0, nodeName, dailyResults, date, patient, false);
        console.log("(e) Came back from burrow with:", match[i])
        if (match[i]) {
          match[i].figure = match[i].figure.concat(figure);
        }

        // if (scenarioTree.hasNode(nodeName)) {
        //   node = scenarioTree.node(nodeName);
        //   // if (ageInRange(age, node)) {
        //   do {
        //     console.log(`(d) Level ${level} match in scenario ${i}, node ${nodeName}. ${scenarioTree.outEdges(nodeName).length} children:`);
        //     console.log(scenarioTree.outEdges(nodeName));
        //     date = getPriorDate(dailyResults, date);
        //     if (date) {     // We haven't run out of results yet
        //       console.log(`Looking at results on ${date}`);
        //       if (!dailyResults[date].pap) {  // handles HPV-only screens
        //         dailyResults[date].pap = '';
        //       }
        //       if (!dailyResults[date].hpv) {  // Handles Pap only results
        //         dailyResults[date].hpv = '';
        //       }
        //
        //
        //
        //       // [ priorResult.pap, priorResult.hpv ] = splitCombinedResult(priorResult.pap);
        //       childNode = {};
        //
        //       priorLevel = level;
        //
        //       (scenarioTree.outEdges(nodeName)).forEach(childNodeName => {
        //         childNodeName = childNodeName['w'];
        //
        //
        //         // If the childNodeName starts with s| it's a synonym (like HSIL+) we're meant to skip through to its children
        //         if (childNodeName.startsWith('s|')) {
        //           console.log(`Skipping through ${childNodeName} to its children:`);
        //           console.log(scenarioTree.outEdges(childNodeName));
        //           (scenarioTree.outEdges(childNodeName)).forEach(childNodeName => {
        //             childNodeName = childNodeName['w'];
        //             childNode = scenarioTree.node(childNodeName);
        //             console.log(`Trying to match prior ${dailyResults[date].pap} / ${dailyResults[date].hpv} to child node ${childNodeName}`);
        //             if ((childNode.procedure === dailyResults[date].pap) && (childNode.hpv === dailyResults[date].hpv)) {
        //               level++;
        //               if (childNode.leaf) {
        //                 console.log(`>> Level ${level} match scenario 2 childNode:`);
        //                 console.log(childNode);
        //                 match[i] = scenarioTree.node(childNodeName);
        //                 match[i].figure = match[i].figure.concat(figure);
        //
        //                 if (isNaN(match[i].cin3risk5y)) {
        //                   match[i].cin3risk5y = -1;
        //                 }
        //               } else {
        //                 nodeName = childNodeName;
        //                 node = scenarioTree.node(nodeName);
        //               }
        //             }
        //           });
        //
        //         } else {
        //
        //           childNode = scenarioTree.node(childNodeName);
        //           console.log(`Trying to match prior ${dailyResults[date].pap} / ${dailyResults[date].hpv} to child node ${childNodeName}`);
        //           if ((childNode.procedure === dailyResults[date].pap) && (childNode.hpv === dailyResults[date].hpv)) {
        //             level++;
        //
        //             if (childNode.leaf) {
        //               console.log(`>> Level ${level} match scenario 2 childNode:`);
        //               console.log(childNode);
        //               match[i] = scenarioTree.node(childNodeName);
        //               match[i].figure = match[i].figure.concat(figure);
        //
        //               if (isNaN(match[i].cin3risk5y)) {
        //                 match[i].cin3risk5y = -1;
        //               }
        //             } else {
        //               nodeName = childNodeName;
        //               node = scenarioTree.node(nodeName);
        //             }
        //
        //           }
        //         }
        //       })
        //       console.log(`Came in at level ${priorLevel}, now at level ${level}`)
        //       // if (level === priorLevel) {    // No matching nodes among the children
        //       //   break;
        //       // }
        //     }
        //   } while (node && !node.leaf && !match[i] && date)
        //
        //
        // }
        //
        // node = childNode;
        // if (node) {
        //   nodeName = childNode.name;
        // }

        break;

      case SCENARIO.papAfterTreatment:  // Scenario 5
        console.log(`makeRecommendations: Handling scenario ${i}.`);
        // In scenario 5, we don't distinguish between HPV16/18 and HPV positive, so convert 16/18 to HPV positive
        papResult = dailyResults[date].pap;
        hpvResult = dailyResults[date].hpv;
        if (hpvResult === HPVRESULT.hpv18Positive || hpvResult === HPVRESULT.hpv16Positive || hpvResult === "HPV16+" || hpvResult === "HPV18+") {
          hpvResult = HPVRESULT.hpvPositive;
        }

        nodeName = `${i}|${papResult}|${hpvResult}`;
        console.log(`(5) Looking for ${nodeName}, age ${age}`);
        match[i] = burrow(scenarioTree, scenario, 0, nodeName, dailyResults, date, patient, false)
        if (match[i]) {
          match[i].figure = match[i].figure.concat(figure);
        }

        // if (scenarioTree.hasNode(nodeName)) {
        //   console.log("(5) Found it.")
        //   node = scenarioTree.node(nodeName);
        //   console.log("Off to burrow.")
        //   match[i] = burrow(scenarioTree, scenario, 0, nodeName, dailyResults, date, patient)
        //   console.log("Done burrowing:");
        //   console.log(match[i]);
        //   if (match[i]) {
        //     match[i].figure = match[i].figure.concat(figure);
        //   }
        // }
        break;

      case SCENARIO.postTreatment: // Scenario 6
        console.log(`makeRecommendations: handling scenario ${i}.`);
        console.log(dailyResults[date]);
        if (dailyResults[date].excision) {
          nodeName = `${i}|Excision|${dailyResults[date].margins == EXCISIONRESULT.marginsNegative ? 'Negative' : 'Positive'}`;

        } else if (dailyResults[date].ablation) {
          nodeName = `${i}|Ablation|`;

        }

        console.log(`Looking for node ${nodeName}`)
        if (scenarioTree.hasNode(nodeName)) {
          node = scenarioTree.node(nodeName);
          console.log("Found it.")
          date = getPriorDate(dailyResults, date);
          if (date) { // We haven't run out of results
            console.log(`Looking for results on ${date}`);
            console.log(dailyResults[date]);
            childNode = {};
            if (!dailyResults[date].colposcopy) {
              dailyResults[date].colposcopy = '';
            }
            (scenarioTree.outEdges(nodeName)).forEach(childNodeName => {
              childNodeName = childNodeName['w'];
              console.log(`Do the results match ${childNodeName}? Node contents:`)
              childNode = scenarioTree.node(childNodeName);
              console.log(childNode);

              // Assumes the child node is a leaf

              if (childNode && (childNode.bxResult === dailyResults[date].colposcopy && ageInRange(age, childNode))) {
                match[i] = scenarioTree.node(childNodeName);

                match[i].figure = match[i].figure.concat(figure);

              }

            });
          }
        }
        break;
    }

    // Storing null objects makes the view a pain (testing for a null object), so we'll store a null instead
    if (match[i] && typeof (match[i]) === "object" && Object.keys(match[i]).length === 0) {
      match[i] = null;
    }
  }
  return [match, notes];

}


function getPatientResults() {
  let ccsResults;
  let hpvResults = [];
  let i, date, result, hpv16, hpv18, hpv, newResult;

  // ccsResults = [
  //   { date: '9/20/2020', procedure: 'Pap Smear', result: 'HSIL', tz: 'Present' },
  //   { date: '9/20/2020', procedure: 'HPV, HIGH RISK', result: 'Detected' },
  //   { date: '9/20/2020', procedure: 'HPV GENOTYPE 16', result: 'Detected'},
  //   { date: '9/20/2020', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
  //   { date: '9/12/2020', procedure: 'Excision', result: ['CIN 2', 'Margins Negative']},
  //   { date: '9/6/2020', procedure: 'Colposcopy', result: 'CIN 1'},
  //   { date: '9/2/2020', procedure: 'Pap Smear', result: 'HSIL', tz: 'Present' },
  //   { date: '9/2/2020', procedure: 'HPV, HIGH RISK', result: 'Detected' },
  //   { date: '9/2/2020', procedure: 'HPV GENOTYPE 16', result: 'Detected'},
  //   { date: '9/2/2020', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
  //   { date: '6/3/2019', procedure: 'Pap Smear', result: 'NILM', tz: 'Present'},
  //   { date: '6/3/2019', procedure: 'HPV, HIGH RISK', result: 'Detected' },
  //   { date: '6/3/2019', procedure: 'HPV GENOTYPE 16', result: 'Not Detected'},
  //   { date: '6/3/2019', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
  //   { date: '6/23/2014', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
  //   { date: '6/23/2014', procedure: 'HPV, HIGH RISK', result: 'Not Detected' },
  //   { date: '6/23/2014', procedure: 'HPV GENOTYPE 16', result: 'Not Detected'},
  //   { date: '6/23/2014', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
  //   { date: '10/12/2009', procedure: 'Pap Smear', result: 'NILM', tz: 'Present'},
  // ];

  // ccsResults = [
  //   { date: '9/21/2020', procedure: 'Pap Smear', result: 'HSIL', tz: 'Present' },
  //   { date: '9/21/2020', procedure: 'HPV, HIGH RISK', result: 'Detected' },
  //   { date: '9/21/2020', procedure: 'HPV GENOTYPE 16', result: 'Detected'},
  //   { date: '9/21/2020', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
  //   { date: '9/21/2020', procedure: 'Colposcopy', result: 'CIN 2'},
  //   { date: '1/22/2020', procedure: 'Colposcopy', result: 'Normal' },
  //   { date: '1/10/2020', procedure: 'HPV, HIGH RISK', result: 'Detected' },
  //   { date: '1/10/2020', procedure: 'HPV GENOTYPE 16', result: 'Detected'},
  //   { date: '1/10/2020', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
  //   { date: '1/10/2020', procedure: 'Pap Smear', result: 'LSIL', tz: 'Present'},
  //   { date: '3/28/2018', procedure: 'Pap Smear', result: 'LSIL', tz: 'Present'},
  // ];

  ccsResults = [
    {date: '7/24/2020', procedure: 'Excision', result: ['CIN2', 'Margins Negative']},
    {date: '6/5/2020', procedure: 'Colposcopy', result: 'CIN2'},
    {date: '5/15/2020', procedure: 'HPV, HIGH RISK', result: 'Detected'},
    {date: '5/15/2020', procedure: 'HPV GENOTYPE 16', result: 'Not Detected'},
    {date: '5/15/2020', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
    {date: '5/15/2020', procedure: 'Pap Smear', result: 'LSIL', tz: 'Present'},
    { date: '1/20/2017', procedure: 'Pap Smear', result: '', tz: 'Present'},
    {date: '6/17/2016', procedure: 'Pap Smear', result: 'NILM', tz: 'Present'},
    {date: '11/20/2015', procedure: 'Pap Smear', result: 'ASC-US', tz: 'Present'},
    {date: '11/20/2015', procedure: 'HPV, HIGH RISK', result: 'Detected'},
    {date: '11/20/2015', procedure: 'HPV GENOTYPE 16', result: 'Not Detected'},
    {date: '11/20/2015', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
    {date: '5/18/2015', procedure: 'Pap Smear', result: 'LSIL', tz: 'Present'},
    {date: '5/18/2015', procedure: 'HPV, HIGH RISK', result: 'Detected'},
    {date: '5/18/2015', procedure: 'HPV GENOTYPE 16', result: 'Not Detected'},
    {date: '5/18/2015', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
    {date: '5/18/2015', procedure: 'Colposcopy', result: 'Normal'},
    {date: '11/4/2014', procedure: 'Pap Smear', result: 'ASC-H', tz: 'Present'},
    {date: '11/4/2014', procedure: 'HPV, HIGH RISK', result: 'Detected'},
    {date: '11/4/2014', procedure: 'HPV GENOTYPE 16', result: 'Not Detected'},
    {date: '11/4/2014', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
    {date: '9/5/2014', procedure: 'Colposcopy', result: 'CIN2'},
    {date: '8/1/2014', procedure: 'Pap Smear', result: 'LSIL', tz: 'Present'},
    {date: '8/1/2014', procedure: 'HPV, HIGH RISK', result: 'Detected'},
    {date: '8/1/2014', procedure: 'HPV GENOTYPE 16', result: 'Not Detected'},
    {date: '8/1/2014', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
  ];

  // Process the input to get the nomenclature to match the ASCCP spreadsheets
  // Combine all the HPV results from one date into one result
  // HPV-negative, HPV-positive, HPV16+, HPV16-,18+

  console.log("getPatientResults: combining HPV results.");
  for (i = 0; i < ccsResults.length; i++) {
    if (ccsResults[i].procedure.startsWith('HPV')) {
      date = ccsResults[i].date;
      if (date in hpvResults === false) {
        hpvResults[date] = [];
      }
      hpvResults[date].push(ccsResults[i]);
    }
  }


  for (date of Object.keys(hpvResults)) {
    hpv = hpv16 = hpv18 = false;

    console.log(date, hpvResults[date])
    for (result of Object.keys(hpvResults[date])) {
      // console.log(`Handling ${result} ${hpvResults[date][result].procedure} for ${date}`);

      if (hpvResults[date][result].procedure.isInList(PROCEDURE.hpv, PROCEDURE.hpvHighRisk)) {
        hpv = hpvResults[date][result].result.isInList(HPVRESULT.positive, HPVRESULT.detected, HPVRESULT.hpvPositive);
      } else if (hpvResults[date][result].procedure.isInList(PROCEDURE.hpv16)) {
        hpv16 = hpvResults[date][result].result.isInList(HPVRESULT.positive, HPVRESULT.detected, HPVRESULT.hpvPositive, HPVRESULT.hpv16Positive);
      } else if (hpvResults[date][result].procedure.isInList(PROCEDURE.hpv18)) {
        hpv18 = hpvResults[date][result].result.isInList(HPVRESULT.positive, HPVRESULT.detected, HPVRESULT.hpvPositive, HPVRESULT.hpv18Positive);
      }
    }
    // console.log(`hpv ${hpv}, hpv16 ${hpv16}, hpv18 ${hpv18}`)
    newResult = {
      date: date,
      procedure: PROCEDURE.hpv
    }

    if (hpv && !hpv16 && !hpv18) {
      newResult.result = 'HPV-positive'
    } else if (!hpv && !hpv16 && !hpv18) {
      newResult.result = 'HPV-negative'
    } else if (hpv16 && !hpv18) {
      newResult.result = 'HPV16+'
    } else if (!hpv16 && hpv18) {
      newResult.result = 'HPV16-, HPV18+'
    }
    // console.log(`New result ${newResult.procedure} ${newResult.result}`)
    for (i = 0; i < ccsResults.length; i++) {
      if (ccsResults[i].date === date && ccsResults[i].procedure.startsWith('HPV')) {
        // console.log(`Replacing ccsResults at ${date}`)
        ccsResults[i].procedure = newResult.procedure;
        ccsResults[i].result = newResult.result;

        newResult.procedure = '';
        newResult.result = '';
        newResult.date = '';
      }
    }
  }

  // Remove the now blank (replaced) entries
  for (i = ccsResults.length - 1; i >= 0; --i) {
    if (ccsResults[i].procedure === '') {
      ccsResults.splice(i, 1);
    }
  }
  //
  // console.log("HPV results: ");
  // console.log(hpvResults);
  console.log("Returning CCS results: ");
  console.log(ccsResults);
  return ccsResults;
}

function getPatient() {
  var patient = {
    birthdate: '10/3/1989',
    pregnant: 0,
    immunocompromised: 0,
    age: 0
  };

  return patient;
}


// Load up the JSON scenario tables from json files (which convertxlsx made from the ASCCP Excel files
function getScenarioTable() {

// const req = require.context('@/assets/json', true, /^.*\.json$/);

// Anonymous function to load up JSON files
  let scenarioTable = [];
  // The files are named scenario 1-5, but we store them as 0-4 (hence the - 1 below)
  const importJSON = requireContext =>
      requireContext.keys().forEach(key =>
          scenarioTable[parseInt(key.match(/\d+/), 10) - 1] = requireContext(key));
  // importJSON(require.context('!!raw-loader!@/assets', true, /^.*\.json$/));

  // Call the function to load the files
  importJSON(require.context('@/assets/json', true, /^.*\.json$/));

  return scenarioTable;
}


// For spreadsheet entries that represent Paps + HPV's in one cell, like Cotest negative, HPV-negative
// Return things like [ NILM, HPV-Negative ] and [ NONE, HPV-Negative ]
// Some of the spreadsheet values (in 2020) had leading spaces - trim those
function splitCombinedResult(combinedResult) {
  if (!combinedResult) {
    return ['', '']
  }
  combinedResult = combinedResult.trim();
  switch (combinedResult) {
    case 'NO HISTORY':
      return ['', ''];
    case 'HPV-negative':
      return ['', HPVRESULT.hpvNegative];
    case 'Cotest-negative':
      return [PAPRESULT.nilm, HPVRESULT.hpvNegative];
    case 'HPV-negative/ASC-US':
      return [PAPRESULT.ascus, HPVRESULT.hpvNegative];
    case 'HPV-negative/LSIL':
      return [PAPRESULT.lsil, HPVRESULT.hpvNegative];
    case 'HPV-positive/NILM':
      return [PAPRESULT.nilm, HPVRESULT.hpvPositive];
    case 'HPV-positive NILM':
      return [PAPRESULT.nilm, HPVRESULT.hpvPositive];
    case 'HPV-positive ASC-US':
      return [PAPRESULT.ascus, HPVRESULT.hpvPositive];
    case 'HPV-positive LSIL':
      return [PAPRESULT.lsil, HPVRESULT.hpvPositive];
    case 'HPV-negative/ASCUS/LSIL':
      return [[PAPRESULT.ascus, PAPRESULT.lsil], HPVRESULT.hpvNegative];

    default:
      return ['', ''];

  }
}

//
// Add nodes to the tree for Pap results that expand to a synonym
//

// eslint-disable-next-line no-unused-vars
function addPapSynonyms(tree, papResult, hpvResult, ageRange, scenario, leaf) {
  let papResults = papExpansion[papResult];
  console.log(`Handling synonyms (in addPapSynonyms) of ${papResult}: ${papResults}`);
  papResults.forEach(papSynonym => {

    let synonymNodeName = `${scenario}|${papSynonym}|${hpvResult}`
    let node = {
      procedure: papSynonym,
      hpv: hpvResult,
      ageRange: ageRange,
      scenario: scenario,
      // synonym: true, // We will only mark as synonyms the inbound (lower) nodes as they will not match with the results
      leaf: leaf
    };
    if (!tree.hasNode(synonymNodeName)) {
      tree.setNode(synonymNodeName, [node]);
    }

  });
}


// Convert the JSON scenario table into a tree
//
// Top nodes are name <scenario>|Pap|HPV
// Lower nodes in the directed graph are named <scenario>-<row in ASCCP Excel table>-level|procedure|hpv
// Below the top level, synonyms nodes can be labeled s| (e.g., synonyms of HSIL+ are HSIL, AGC, ASC-H, so the s| node will have all of those point to HSIL+.
// Empty nodes (like "NO HISTORY") can be labeled x| to denote they don't have anything in them and we don't need to look at a prior date
// Leaf nodes have the ageRange appended to their name to account
// for different recommendations beased on different age ranges
//
// Uses https://www.npmjs.com/package/graphlib
function makeScenarioTree(scenarioTable) {
  console.log("In makeScenarioTree")
  console.log(scenarioTable);

  const tree = new Graph({multigraph: true, compound: true, directed: true});
  let i, j, nodeName, synonymNodeName, previousNodeName, papResult, hpvResult, bxResult, histologyResult, treatment;

  for (i = 0; i < scenarioList.length; i++) {
    for (j = 2; j < scenarioTable[i][0].length; j++) {
      let node = {};
      let nextNode = {};
      let k = 1;
      let papResults = [];
      let figure = [];
      papResult = hpvResult = null;


      // console.log(`Tree processing scenario ${i}, item ${j}`);

      switch (i) {
        case SCENARIO.papManagement:      // Scenarios 1 and 2
        case SCENARIO.papPriorAbnormal:

          if (!scenarioTable[i][0][j]['Current PAP Result']) {
            // console.log(`Dumping out at top node, item ${j}`);
            continue;
          } else {
            papResult = scenarioTable[i][0][j]['Current PAP Result'];
            hpvResult = scenarioTable[i][0][j]['Current HPV Result'];
            if (hpvResult === 'None') {
              hpvResult = '';
            }
          }

          // Handle HPV result of Any during interpretation step

          if (papResult === PAPRESULT.agc || papResult === PAPRESULT.agcfn) {
            // figure.push(FIGURE['3']);
            addFigure(figure, 3);

          }

          // Entries in the ASCCP table like HSIL+ stand for a bunch of possible Pap results
          // We'll store those as a bunch of incoming nodes to a primary node so they are easier to search for
          // using the actual patient results later
          if (papExpansion[papResult] && typeof (papExpansion[papResult]) != "string") { // papResult === 'HSIL+' || papResult === 'High Grade' || papResult == ) {
            // nodeName = `${i}|${papResult}|${hpvResult}`

            addPapSynonyms(tree, papResult, hpvResult, scenarioTable[i][0][j]['Age'], i, false);
            papResults = papExpansion[papResult];

          } else if (papExpansion[papResult]) {
            papResult = papExpansion[papResult];  // This converts scalars to scalars, like ASC_US -> ASC-US
          }

          // Handles the scalar version, and the original (synonymed) node, like HSIL+
          node = {
            procedure: papResult,
            hpv: hpvResult,
            ageRange: scenarioTable[i][0][j]['Age'],
            scenario: i,
            synonym: (papExpansion[papResult] && typeof (papExpansion[papResult]) != "string"),
            leaf: false
          };

          nodeName = `${node.scenario}|${node.procedure}|${node.hpv}`;
          if (!tree.hasNode(nodeName)) {
            tree.setNode(nodeName, node)
          }
          previousNodeName = nodeName;

          if (papResults.length) {
            // Handle the array version of papResult

            // Make all of the synonyms the parent of the common node (like HSIL+)
            // And that node will start with s instead of the level so we know to skip through it when making
            // recommendations
            // previousNodeName = "s|" + previousNodeName;
            papResults.forEach(papSynonym => {
              nodeName = `${node.scenario}|${papSynonym}|${hpvResult}`;
              // tree.setParent(previousNodeName, nodeName); // Can't set multiple parents
              tree.setEdge(nodeName, previousNodeName);
            });
            // console.log(`Parents of ${previousNodeName}: ${tree.parent(previousNodeName)}`)
            console.log(`Inward edges of ${previousNodeName}:`);
            console.log(tree.inEdges(previousNodeName))
          }

          // Handle the first sub-node
          [papResult, hpvResult] = splitCombinedResult(scenarioTable[i][0][j]['PAST HISTORY (most recent)']);
          // console.log(`Scenario ${i}, first sub-node, line ${j}: Pap ${papResult}, HPV ${hpvResult}`)
          // if (papExpansion[papResult]) {
          //   papResult = papExpansion[papResult];
          // }
          node = {
            procedure: papResult,
            hpv: hpvResult,
            leaf: (i === SCENARIO.papManagement),
            scenario: i,
            noHistory: (papResult === '' && hpvResult === ''),  // Both are blank, meaning no prior history can be present (e.g., first Pap)
            figure: figure,
            ageRange: scenarioTable[i][0][j]['Age'],
            management: scenarioTable[i][0][j]['Management'],
            cin3risk: scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'],
            cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
            confidence: scenarioTable[i][0][j]['Management Confidence Probability']
          }


          nodeName = `${i}-${j}-${k++}|${node.procedure}|${node.hpv}`;
          if (!tree.hasNode(nodeName)) {
            tree.setNode(nodeName, node);
          }
          tree.setEdge(previousNodeName, nodeName);
          // console.log(`Made ${nodeName} a child of of ${previousNodeName}`);
          // console.log(tree.children(previousNodeName))
          previousNodeName = nodeName;

          // Handle the second sub-node if needed
          if (i === SCENARIO.papPriorAbnormal) { // Scenario 2 has a second sub node
            // The ASCCP column header here notes "previous 2" but the guidelines article Table 2C doesn't have the same column.
            // In the app, it doesn't look for 2 - just a previous 1.
            //
            // https://journals.lww.com/jlgtd/Fulltext/2020/04000/Risk_Estimates_Supporting_the_2019_ASCCP.4.aspx


            if (!scenarioTable[i][0][j]['PAST HISTORY (previous 2)']) {
              node.leaf = true;
              node.figure = figure;
              node.ageRange = scenarioTable[i][0][j]['Age'];

              node.management = scenarioTable[i][0][j]['Management'];
              node.cin3risk = scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'];
              node.cin3risk5y = scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'];
              node.confidence = scenarioTable[i][0][j]['Management Confidence Probability'];

              nodeName = `${i}-${j}-${k++}|${node.procedure}|${node.hpv}|${node.ageRange}`;
              if (!tree.hasNode(nodeName)) {
                tree.setNode(nodeName, node);
              }
              tree.setEdge(previousNodeName, nodeName);

              // console.log(`Leaf at subnode 1, item ${j}`);

              continue;
            }
            [papResult, hpvResult] = splitCombinedResult(scenarioTable[i][0][j]['PAST HISTORY (previous 2)']);


            node = {
              procedure: papResult,
              hpv: hpvResult,
              scenario: i,
              figure: figure,
              ageRange: scenarioTable[i][0][j]['Age'],
              management: scenarioTable[i][0][j]['Management'],
              cin3risk: scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'],
              cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
              confidence: scenarioTable[i][0][j]['Management Confidence Probability'],
              leaf: true
            }
            nodeName = `${i}-${j}-${k++}|${papResult}|${hpvResult}|${node.ageRange}`;
            if (!tree.hasNode(nodeName)) {
              tree.setNode(nodeName, node);
            }
            tree.setEdge(previousNodeName, nodeName);

          }


          break;

        case SCENARIO.postColposcopy: // Scenario 3
          histologyResult = scenarioTable[i][0][j]['Biopsy Result'];  // Epic reports results like CIN 1, CIN 2;

          // Rename things like CIN2 to CIN 2; handle non-scalars below
          if (papExpansion[histologyResult] && typeof (papExpansion[histologyResult]) != 'object') {
            histologyResult = papExpansion[histologyResult];    // Handle things like CIN1 -> CIN 1
          }

          // The ASCCP tables have things like CIN1, <CIN1
          // if (papExpansion[scenarioTable[i][0][j]['Biopsy Result']]) {    // We'll handle that in papExpansion (convert them to Epic-like results)
          //   histologyResult = papExpansion[scenarioTable[i][0][j]['Biopsy Result']];
          // }
          // Store those synonyms as extra nodes pointing down as synonyms

          if (histologyResult === COLPORESULT.cin3) {
            // figure.push(FIGURE['8']);
            addFigure(figure, 8);
          }
          if (histologyResult === COLPORESULT.cin2 || histologyResult === COLPORESULT.cin3) {
            // figure.push(FIGURE['7']);
            addFigure(figure, 7);
          }


          node = {
            histologyResult: histologyResult,
            ageRange: scenarioTable[i][0][j]['Age'],
            scenario: i,
            figure: figure,
            // synonym: (histologyResult === '<CIN1' || histologyResult === 'Cancer'),
            management: scenarioTable[i][0][j]['Management'],
            // cin3risk: scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'],  // Doesn't exist as of 2020
            cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
            // confidence: scenarioTable[i][0][j]['Management Confidence Probability'], // Doesn't exist as of 2020
            leaf: (scenarioTable[i][0][j]['Referral Screen Result'] === '-')  // This is a leaf if we have '-' for the referral screen result
          }
          nodeName = `${node.scenario}|${node.histologyResult}`;
          if (!tree.hasNode(nodeName)) {
            tree.setNode(nodeName, node)
          }

          if (histologyResult === '<CIN1' || histologyResult === 'Cancer') {
            // nodeName = `${i}|${histologyResult}`
            papExpansion[histologyResult].forEach(histologySynonym => {
              previousNodeName = `${i}|${histologySynonym}`
              node = {
                procedure: histologySynonym,
                ageRange: scenarioTable[i][0][j]['Age'],
                scenario: i,
                synonym: true,
                leaf: false
              };
              if (!tree.hasNode(previousNodeName)) {
                tree.setNode(previousNodeName, node);
              }
              tree.setEdge(previousNodeName, nodeName);
            });

          }


          if (!node.leaf) {
            previousNodeName = nodeName;
            // Most cases have a single subnode for Referral Screen Result
            [papResult, hpvResult] = splitCombinedResult(scenarioTable[i][0][j]['Referral Screen Result']);
            if (papResult === '' && hpvResult === '') {   // Turns out this wasn't a combined result after all
              papResult = scenarioTable[i][0][j]['Referral Screen Result'];     // If this isn't combined (like HPV-positive NILM) then it's a Pap (including things like HSIL+)
              // if (papExpansion[papResult]) {
              //   papResult = papExpansion[papResult];
              // }
              //
              // Handle HSIL+ by storing it in a bunch of synonym nodes
              if (papResult === PAPRESULT.asch && histologyResult === COLPORESULT.cin1) {
                // figure.push(FIGURE['10']);
                addFigure(figure, 10);

              }

              if (papResult === 'HSIL+') {
                console.log('%%%%%% Scenario 3 - found the HSIL+ referral screen result');
                nodeName = `${i}-${j}-${k}|${papResult}|${hpvResult}`;
                papExpansion[papResult].forEach(papSynonym => {
                  if (papSynonym === PAPRESULT.hsil && histologyResult === COLPORESULT.cin1) {
                    // figure.push(FIGURE['9']);
                    addFigure(figure, 9);

                  }
                  node = {
                    procedure: papSynonym,
                    hpv: '',
                    scenario: i,
                    figure: figure,

                    ageRange: scenarioTable[i][0][j]['Age'],
                    management: scenarioTable[i][0][j]['Management'],
                    cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
                    leaf: true
                  };
                  let synonymNodeName = `${i}-${j}-${k}|${papSynonym}|${hpvResult}|${node.ageRange}`;

                  if (!tree.hasNode(synonymNodeName)) {
                    tree.setNode(synonymNodeName, node)
                  }
                  // tree.setParent(synonymNodeName, previousNodeName);
                  tree.setEdge(previousNodeName, synonymNodeName);
                  console.log(`Set up synonym node ${synonymNodeName}, parent is ${previousNodeName}`)

                });
                continue;
              }

            }
            node = {
              procedure: papResult,
              hpv: hpvResult,
              scenario: i,
              figure: figure,
              ageRange: scenarioTable[i][0][j]['Age'],
              management: scenarioTable[i][0][j]['Management'],
              // cin3risk: scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'],  // Doesn't exist as of 2020
              cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
              // confidence: scenarioTable[i][0][j]['Management Confidence Probability'], // Doesn't exist as of 2020
              leaf: true
            }
            nodeName = `${i}-${j}-${k++}|${node.procedure}|${node.hpv}|${nodeName}`;
            if (!tree.hasNode(nodeName)) {
              tree.setNode(nodeName, node);
              console.log(`>> Set node ${nodeName}, parent ${tree.parent(nodeName)}, children ${tree.outEdges(nodeName)}`);
            }
            // tree.setParent(nodeName, previousNodeName);
            tree.setEdge(previousNodeName, nodeName);
          }
          break;

        case SCENARIO.papAfterColposcopy: // Scenario 4; similar but not totally similar to 1 and 2

          if (!scenarioTable[i][0][j]['Current PAP Result']) {
            // console.log(`Dumping out at top node, item ${j}`);
            continue;
          } else {
            papResult = scenarioTable[i][0][j]['Current PAP Result'];
            hpvResult = scenarioTable[i][0][j]['Current HPV Result'];
            if (hpvResult === 'None') {
              hpvResult = '';
            }
          }

          if (papResult === PAPRESULT.agc || papResult === PAPRESULT.agcfn) {
            // figure.push(FIGURE['3']);
            addFigure(figure, 3);

          }

          // Entries in the ASCCP table like HSIL+ stand for a bunch of possible Pap results
          // We'll store those as a bunch of incoming nodes to a primary node so they are easier to search for
          // using the actual patient results later
          if (papExpansion[papResult] && typeof (papExpansion[papResult]) != "string") { // papResult === 'HSIL+' || papResult === 'High Grade' || papResult == ) {
            // nodeName = `${i}|${papResult}|${hpvResult}`

            addPapSynonyms(tree, papResult, hpvResult, scenarioTable[i][0][j]['Age'], i, false);
            papResults = papExpansion[papResult];

          } else if (papExpansion[papResult]) {
            papResult = papExpansion[papResult];  // This converts scalars to scalars, like ASC_US -> ASC-US
          }

          // Handles the scalar version, and the original (synonymed) node, like HSIL+
          node = {
            procedure: papResult,
            hpv: hpvResult,
            ageRange: scenarioTable[i][0][j]['Age'],
            scenario: i,
            synonym: (papExpansion[papResult] && typeof (papExpansion[papResult]) != "string"),
            leaf: false
          };

          nodeName = `${node.scenario}|${node.procedure}|${node.hpv}`;
          if (!tree.hasNode(nodeName)) {
            tree.setNode(nodeName, node)
          }
          previousNodeName = nodeName;

          if (papResults.length) {

            // Make all of the synonyms the parent of the common node (like HSIL+)
            // And that node will start with s instead of the level so we know to skip through it when making
            // recommendations
            // previousNodeName = "s|" + previousNodeName;
            papResults.forEach(papSynonym => {
              nodeName = `${node.scenario}|${papSynonym}|${hpvResult}`;
              // tree.setParent(previousNodeName, nodeName); // Can't set multiple parents
              tree.setEdge(nodeName, previousNodeName);
            });
            // console.log(`Parents of ${previousNodeName}: ${tree.parent(previousNodeName)}`)
            console.log(`Inward edges of ${previousNodeName}:`);
            console.log(tree.inEdges(previousNodeName))
          }

          // Handle first sub-node
          // if (i === SCENARIO.papAfterColposcopy) { // Scenario 4
          papResult = scenarioTable[i][0][j]['Post-Colpo Test Result - PAST HISTORY'];

          if (papResult && papResult.includes('x2')) {
            // Handle an extra node for things like Cotest-negative x2
            [papResult, hpvResult] = splitCombinedResult(papResult.substring(0, papResult.search('x2') - 1));

            node = {
              procedure: papResult,
              hpv: hpvResult,
              leaf: false,
              postColposcopy: true,
              scenario: i
            };
            nodeName = `${i}-${j}-${k++}|${node.procedure}|${node.hpv}`;
            if (!tree.hasNode(nodeName)) {
              tree.setNode(nodeName, node);
            }
            tree.setEdge(previousNodeName, nodeName);

            previousNodeName = nodeName;

            node = {
              procedure: papResult,
              hpv: hpvResult,
              leaf: false,
              postColposcopy: true,
              scenario: i
            };
            nodeName = `${i}-${j}-${k++}|${node.procedure}|${node.hpv}`;
            if (!tree.hasNode(nodeName)) {
              tree.setNode(nodeName, node);
            }
            tree.setEdge(previousNodeName, nodeName);

            previousNodeName = nodeName;

          } else {  // Handle the non-x2 results
            [papResult, hpvResult] = splitCombinedResult(papResult);
            if (typeof (papResult) === 'object') { // Scalar, not array

              // This synonym node goes below the following two
              node = {
                procedure: 'ASCUS/LSIL',
                hpv: hpvResult,
                leaf: false,
                postColposcopy: true,
                synonym: true,
                scenario: i
              }
              synonymNodeName = `s|${i}-${j}-${k}|${node.procedure}|${node.hpv}`
              if (!tree.hasNode(synonymNodeName)) {
                tree.setNode((synonymNodeName, node))
              }

              papResult.forEach(papSynonym => {
                node = {
                  procedure: papSynonym,
                  hpv: hpvResult,
                  leaf: false,
                  postColposcopy: true,
                  scenario: i
                }
                nodeName = `${i}-${j}-${k++}|${node.procedure}|${node.hpv}`;
                if (!tree.hasNode(nodeName)) {
                  tree.setNode((nodeName, node))
                }
                tree.setEdge(previousNodeName, nodeName);
                tree.setEdge(nodeName, synonymNodeName);
              });
              previousNodeName = synonymNodeName;
            } else {
              node = {
                procedure: papResult,
                hpv: hpvResult,
                leaf: false,
                postColposcopy: true,
                scenario: i
              };
              nodeName = `${i}-${j}-${k++}|${node.procedure}|${node.hpv}`;
              if (!tree.hasNode(nodeName)) {
                tree.setNode(nodeName, node);
              }
              tree.setEdge(previousNodeName, nodeName);
            }
          }


          // console.log(`Made ${nodeName} a child of of ${previousNodeName}`);
          // console.log(tree.children(previousNodeName))
          previousNodeName = nodeName;

          // Handle the second sub-node for Scenario 4; it's all "Low Grade" or "High Grade"
          papResult = scenarioTable[i][0][j]['Pre-Colpo Test Result'];
          if (papResult === 'Low Grade' || papResult === 'High Grade') {
            nodeName = `${i}-${j}-${k}|${papResult}`
            papExpansion[papResult].forEach(papSynonym => {
              // previousNodeName = `s|${i}-${j}-${k}|${papSynonym}`
              synonymNodeName = `${i}-${j}-${k}|${papSynonym}`
              hpvResult = '';
              if (papSynonym === PAPRESULT.nilm + '|' + HPVRESULT.hpvPositive) {
                papSynonym = PAPRESULT.nilm;
                hpvResult = HPVRESULT.hpvPositive;
              } else {
                hpvResult = 'Any' // For high grade and low grade Paps we generally don't seem to care about the HPV result except for NILM cytology
              }

              node = {
                procedure: papSynonym,
                hpv: hpvResult,
                preColposcopy: true,
                // synonym: true,
                scenario: i,
                figure: figure,
                ageRange: scenarioTable[i][0][j]['Age'],
                management: scenarioTable[i][0][j]['Management'],
                cin3risk: scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'],
                cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
                confidence: scenarioTable[i][0][j]['Management Confidence Probability'],
                leaf: true
              };
              if (!tree.hasNode(synonymNodeName)) {
                tree.setNode(synonymNodeName, node);
              }
              tree.setEdge(previousNodeName, synonymNodeName);
              // console.log(`/// Synonym node ${synonymNodeName} (for synonym ${papSynonym} child of ${previousNodeName}:`)
              // console.log(tree.outEdges(previousNodeName));

            });
            // console.log(`+++ Scenario ${i}, children of ${previousNodeName}`)
            // console.log(tree.outEdges(previousNodeName));

          }

          break;


        case SCENARIO.papAfterTreatment:    // Scenario 5
          // In Table 5, the authors have 4 cases were current Pap result is blank but current HPV result says something
          // like HPV-negative x2, Co-test negative x2, HPV-negative x3, Cotest-negative x3

          hpvResult = scenarioTable[i][0][j]['Current HPV Result'];
          // console.log(`Tree generation, scenario ${i}, item ${j}, HPV ${hpvResult}`)
          if (scenarioTable[i][0][j]['Current PAP Result']) {
            papResult = scenarioTable[i][0][j]['Current PAP Result'];
            if (papResult === 'ALL') {
              papResult = ''; // By ALL, ASCCP actually means 'None' (HPV-only testing)
            } else if (papExpansion[papResult]) {

              // addPapSynonyms(tree, papResult, hpvResult, scenarioTable[i][0][j]['Age'], i, false);
              papExpansion[papResult].forEach(papSynonym => {
                // if (papSynonym === PAPRESULT.ais) {
                //   // figure.push(FIGURE['11']);
                //   addFigure(figure, 11);
                //
                // }

                node = {
                  procedure: papSynonym,
                  hpv: hpvResult,
                  ageRange: scenarioTable[i][0][j]['Age'],
                  scenario: i,
                  synonym: true,
                  management: scenarioTable[i][0][j]['Management'],
                  cin3risk: scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'],
                  cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
                  confidence: scenarioTable[i][0][j]['Management Confidence Probability'],
                  leaf: false
                };
                synonymNodeName = `${i}|${papSynonym}|${hpvResult}`;

                if (!tree.hasNode(synonymNodeName)) {
                  tree.setNode(synonymNodeName, node);
                }


                bxResult = scenarioTable[i][0][j]['Biopsy Result Before Treatment'];
                k++;
                // Turns out though even the Excel file says CIN 3, the published table (table 5A) lists CIN 2 or 3 for all
                // https://journals.lww.com/jlgtd/Fulltext/2020/04000/Risk_Estimates_Supporting_the_2019_ASCCP.4.aspx
                if (bxResult === 'CIN3') {   // ASCCP uses CIN3, Epic CIN 3
                  bxResult = [COLPORESULT.cin2, COLPORESULT.cin3];
                  // figure.push(FIGURE['7'])
                  // console.log('!!! Adding figure 7')
                  addFigure(figure, 7);
                }
                if (typeof (bxResult) === 'string') {
                  bxResult = [bxResult];
                }

                bxResult.forEach(bxResult => {
                  if (bxResult === EXCISIONRESULT.cin2) {
                    // figure.push(FIGURE['8'])
                    addFigure(figure, 8);

                  }
                  node = {
                    scenario: i,
                    procedure: bxResult,
                    figure: figure,
                    ageRange: scenarioTable[i][0][j]['Age'],
                    management: scenarioTable[i][0][j]['Management'],
                    cin3risk: scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'],
                    cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
                    confidence: scenarioTable[i][0][j]['Management Confidence Probability'],
                    leaf: true
                  }
                  nodeName = `${node.scenario}-${j}-${k}|${node.procedure}|${node.ageRange}`
                  if (!tree.hasNode(nodeName)) {
                    tree.setNode(nodeName, node)
                  }

                  tree.setEdge(synonymNodeName, nodeName);

                });

              });
            }
          } else {
            papResult = null;
          }

          // Blank Pap result but Pap result hanging out in the HPV result.
          if (!papResult) {
            if (!scenarioTable[i][0][j]['Current HPV Result']) {
              continue;
            } else {
              hpvResult = scenarioTable[i][0][j]['Current HPV Result'];
              let remaining = '';
              node = {

                ageRange: scenarioTable[i][0][j]['Age'],
                scenario: i,

                leaf: false
              };

              if (hpvResult === 'HPV-negative x2') {
                hpvResult = HPVRESULT.hpvNegative;
                papResult = '';
                remaining = 'hpv';
              } else if (hpvResult === 'Cotest-negative x2') {
                hpvResult = HPVRESULT.hpvNegative;
                papResult = PAPRESULT.nilm;
                remaining = 'cotest'
              } else if (hpvResult === 'HPV-negative x3') {
                hpvResult = HPVRESULT.hpvNegative;
                papResult = '';
                remaining = 'hpv x2';
              } else if (hpvResult === 'Cotest-negative x3') {
                hpvResult = HPVRESULT.hpvNegative;
                papResult = PAPRESULT.nilm;
                remaining = 'cotest x2'

              }
              node.procedure = papResult;
              node.hpv = hpvResult;
              nodeName = `${node.scenario}|${node.procedure}|${node.hpv}`;
              if (!tree.hasNode(nodeName)) {
                tree.setNode(nodeName, node)
              }
              previousNodeName = nodeName;

              if (remaining === 'hpv') {
                node = {
                  procedure: '',
                  hpv: HPVRESULT.hpvNegative,
                  leaf: false
                }

              } else if (remaining === 'cotest') {
                node = {
                  procedure: PAPRESULT.nilm,
                  hpv: HPVRESULT.hpvNegative,
                  leaf: false
                }

              } else if (remaining === 'hpv x2') {
                node = {
                  procedure: '',
                  hpv: HPVRESULT.hpvNegative,
                  leaf: false
                }
                nextNode = {
                  procedure: '',
                  hpv: HPVRESULT.hpvNegative,
                  leaf: false
                }

              } else if (remaining === 'cotest x2') {
                node = {
                  procedure: PAPRESULT.nilm,
                  hpv: HPVRESULT.hpvNegative,
                  leaf: false
                }
                nextNode = {
                  procedure: PAPRESULT.nilm,
                  hpv: HPVRESULT.hpvNegative,
                  leaf: false
                }

                nodeName = `${node.scenario}-${j}-${k++}|${node.procedure}|${node.hpv}`
                if (!tree.hasNode(nodeName)) {
                  tree.setNode(nodeName, node)
                }
                // tree.setParent(nodeName, previousNodeName);
                tree.setEdge(previousNodeName, nodeName);

                previousNodeName = nodeName;

                if (nextNode) {
                  nodeName = `${node.scenario}-${j}-${k++}|${nextNode.procedure}|${nextNode.hpv}`
                  if (!tree.hasNode(nodeName)) {
                    tree.setNode(nodeName, nextNode)
                  }
                  // tree.setParent(nodeName, previousNodeName);
                  tree.setEdge(previousNodeName, nodeName);

                  previousNodeName = nodeName;
                }
              }

              // Finish scenario 5
              bxResult = scenarioTable[i][0][j]['Biopsy Result Before Treatment'];
              // Turns out though even the Excel file says CIN 3, the published table (table 5A) lists CIN 2 or 3 for all
              // https://journals.lww.com/jlgtd/Fulltext/2020/04000/Risk_Estimates_Supporting_the_2019_ASCCP.4.aspx
              if (bxResult === 'CIN3') {   // ASCCP uses CIN3, Epic CIN 3
                bxResult = [COLPORESULT.cin2, COLPORESULT.cin3];
                // figure.push(FIGURE['7'])
                console.log('!!!! Adding figure 7')

                addFigure(figure, 7);

              }
              bxResult.forEach(bxResult => {
                if (bxResult === EXCISIONRESULT.cin2) {
                  // figure.push(FIGURE['8'])
                  addFigure(figure, 8);

                }
                node = {
                  scenario: i,
                  procedure: bxResult,
                  figure: figure,
                  ageRange: scenarioTable[i][0][j]['Age'],
                  management: scenarioTable[i][0][j]['Management'],
                  cin3risk: scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'],
                  cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
                  confidence: scenarioTable[i][0][j]['Management Confidence Probability'],
                  leaf: true
                }
                nodeName = `${node.scenario}-${j}-${k++}|${node.procedure}|${nodeName}|${node.ageRange}`
                if (!tree.hasNode(nodeName)) {
                  tree.setNode(nodeName, node)
                }
                // tree.setParent(nodeName, previousNodeName);
                tree.setEdge(previousNodeName, nodeName);
              })


              continue;
            }
          }
          break;


        case SCENARIO.postTreatment:    // Scenario 6: What do we do immediately following excision/ablation?
          bxResult = scenarioTable[i][0][j]['Biopsy Result Before Treatment'];
          treatment = scenarioTable[i][0][j]['Treatment'];

          node = {
            scenario: i,
            procedure: treatment,
            margins: scenarioTable[i][0][j]['Margins'] || '',
            leaf: false,
          }
          nodeName = `${node.scenario}|${node.procedure}|${node.margins}`;
          if (!tree.hasNode(nodeName)) {
            tree.setNode(nodeName, node)
          }
          previousNodeName = nodeName;

          if (papExpansion[bxResult]) {   // e.g., CIN1 -> CIN 1
            bxResult = papExpansion[bxResult];
            if (bxResult === COLPORESULT.cin3) {
              // figure.push(FIGURE['8']);
              addFigure(figure, 8);
            }
            if (bxResult === COLPORESULT.cin2 || bxResult === COLPORESULT.cin3) {
              // figure.push(FIGURE['7']);
              addFigure(figure, 7);
            }
          }
          node = {
            scenario: i,
            procedure: treatment,
            ageRange: scenarioTable[i][0][j]['Age'],
            margins: scenarioTable[i][0][j]['Margins'] || '',
            management: scenarioTable[i][0][j]['Management'],
            bxResult: bxResult,
            figure: figure,
            leaf: true,
          }
          nodeName = `${i}-${j}-${k++}|${node.procedure}|${bxResult}|${node.margins}|${node.ageRange}`;
          if (!tree.hasNode(nodeName)) {
            tree.setNode(nodeName, node);
          }
          tree.setEdge(previousNodeName, nodeName);


          break;

        default:
          break;
      }
      // console.log(`Scenario ${i}, item ${j}; node ${nodeName}`)
    }

  }
  console.log("Tree grown:");
// console.log(JSON.stringify(json.write(tree)));
  console.log(tree.nodes());

  return tree;

}


//
//
// Main execution entry
//

// Define a new isInList property for strings
// From https://stackoverflow.com/questions/2430000/determine-if-string-is-in-list-in-javascript
if (!String.prototype.isInList) {
  Object.defineProperty(String.prototype, 'isInList', {
    get: () => function (...args) {
      let value = this.valueOf();
      for (let i = 0, l = args.length; i < l; i += 1) {
        if (arguments[i] === value) return true;
      }
      return false;
    }
  });
}

// Per guidelines zK.3, immunocompromised patients should start screening within 1 y o f insertional sex,
// continue throughout lifetime (not 65), annually x 3 y, then q 3 y (cytology only) until 30, then cytology laone or co-testing q3y
// with colposcopy for ASC-US HPV+ or higher (if no HPV, repeat cutology in 6-12 m, with colpo for ASUS+)
// For ASCUS+ on repeat cytology or HP positive, refer for colposcopy
// For cytology of LSIL+ (ASC-H, AGC, AIS, HSIL) colposcopy, regardless of whether HPV test is done


let patient = getPatient();
let ccsResults = getPatientResults();
let dailyResults = combineDailyResults(ccsResults, patient);


let scenario;
// let scenarioSelection = scenarioList[scenario];
let scenarioSelection;
let scenarioTable = getScenarioTable()
let scenarioTree = makeScenarioTree(scenarioTable)


const birthdateTime = Date.parse(patient.birthdate);
// const today = new Date();
let pregnancySelection = pregnancyStateList[patient.pregnant];
let immunocompromiseSelection = immunocompromiseStateList[patient.immunocompromised];
let recommendations = {};
let date;
let notes = {};
patient.age = Math.floor((new Date() - birthdateTime) / (1000 * 60 * 60 * 24 * 365.25));

// console.log(`Scenario table:`)
// console.log(scenarioTable);
// console.log(req.keys());
// console.log(`Patient age: ${patient.age}`);


Object.keys(dailyResults).forEach(date => {
  console.log(`>>>>>>> Getting recommendations for ${date}`);
  scenario = determineScenario(dailyResults, date);
  recommendations[date] = {};
  // console.log(`Age at ${date}: ${Date.parse(date)} - ${birthdateTime}`)
  // dailyResults[date].age = Math.floor((Date.parse(date) - birthdateTime) / (1000 * 60 * 60 * 24 * 365.25));
  // console.log(`${recommendations[date].age}`)

  [recommendations[date], notes[date]] = makeRecommendations(patient, dailyResults, scenarioTree, date);
  recommendations[date].age = dailyResults[date].age;
  recommendations[date].scenario = scenario;

})

// Set the default date to the latest one, and the default scenario to that date's corresponding one
date = Object.keys(dailyResults)[0];
scenario = recommendations[date].scenario;
scenarioSelection = scenarioList[scenario];


// console.log("CCS results: ")
// console.log(ccsResults);
// console.log(`${JSON.stringify(recommendations)}`);
// console.log(`Scenario ${scenario}`)
console.log("Done with main.");
console.log(location);


export default {
  name: "Recommendations",
  methods: {
    submitPregnancySelection() {
      console.log(`Pregnancy state selected: ${this.pregnancySelection}`);
    },
    submitImmunocompromiseSelelection() {
      console.log(`Immunocompromise selected: ${this.immunocompromiseSelection}`);
    },
    submitScenarioSelection() {
      // console.log(`Scenario selected: ${this.scenarioSelection} (${scenario} -> ${scenarioList.indexOf(this.scenarioSelection)})`);
      this.scenario = scenarioList.indexOf(this.scenarioSelection);
      // scenarioSelection = this.scenarioSelection;
    },
    submitDate() {
      // console.log(`Changing date to ${this.date}, from scenario ${this.scenario} to ${this.recommendations[this.date].scenario}...`)
      this.scenario = this.recommendations[this.date].scenario;
      this.scenarioSelection = this.scenarioList[this.scenario];
      // console.log(`To scenario ${this.scenario}.`)

    },
    limitLookback() {
      this.top4 = !this.top4;
      // console.log(`Top 4: ${this.top4}`)
    },
    URLify(string) {
      return string.trim().replace(/\s/g, '%20');
    }
  },
  components: {
    RiskGauge,
    ConfidenceGauge,
    Thumbnail
  },
  computed: {
    dailyResultsTop4: function () {
      let newObj = {};
      // return this.dailyResults.slice(0, 3);
      let dates = Object.keys(this.dailyResults)
      dates.forEach(date => {
        if (this.dailyResults[date].index < 4) {
          newObj[date] = this.dailyResults[date];
        }
      });
      return newObj;
    }
  },

  data() {
    return {
      patient: patient,
      pregnancySelection,
      pregnancyStateList,
      dailyResults,
      isThereHSIL,
      addYears,
      colors,
      notes,
      top4: false,
      date: ccsResults[0].date,
      immunocompromiseSelection,
      immunocompromiseStateList,
      scenarioSelection, // The selected description of the scenario
      scenarioList,      // The list of descriptions
      scenario,          // The selected scenario
      recommendations,
      location,
      MGMT_COLOR
    }
  },
  watch: {
    // scenario: function () {
    //   console.log(`Noted change in scenario: ${this.scenario}`)
    // }
  }
}

</script>

<style scoped>

</style>
