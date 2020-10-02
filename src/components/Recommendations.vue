<template>

  <section>
    <div class="d-flex">
      <div class="col self-center mt-n2">
        <div class="text-caption">Age</div> <strong>{{ patient.age }}</strong>
      </div>
      <div>
        <v-select v-model="pregnancySelection"  dense filled @input="submitPregnancySelection"
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
    <v-container class="pa-2 mx-2">
      <v-row>
        <v-simple-table dense>
          <template v-slot:default>
            <thead>
            <tr>
              <th>
                <span class="text-subtitle-1">Select result</span>
                <br/><span class="text-caption">to base recommendations on ({{ date }})</span>
              </th>
            </tr>

            </thead>
            <tbody>

            <v-radio-group v-model="date">
              <tr v-for="result in dailyResults" :key="result.date">

                <td class="px-3">
                  <v-radio :name="result.date" :value="result.date">
                    <template v-slot:label>
                      <div class="text-caption">{{ result.date }}</div>
                    </template>
                  </v-radio>
                </td>
                <td class="text-caption px-3">
                      <span  v-if="result.pap">
                        Cytology
                        <strong>{{ result.pap }}</strong>
                      </span>
                  <span v-if="result.colposcopy">
                        Colposcopy
                        <strong>{{ result.colposcopy }}</strong>
                      </span>
                  <span v-if="result.ecc">
                        Colposcopy
                        <strong>{{ result.ecc }}</strong>
                      </span>
                  <span v-if="result.excision">
                        Excisional procedure
                        <strong>{{ result.excision }}</strong>
                      </span>
                  <span v-if="result.ablation">
                        Excisional procedure
                        <strong>{{ result.ablation }}</strong>
                      </span>



                <span class="text--secondary px-3">
                  <br/>
                      <span class="indigo--text" v-if="result.hpv">
                        {{ result.hpv }} {{ result.hpv16 }} {{ result.hpv18 }}
                      </span>
                </span>
                </td>
                <v-divider></v-divider>

              </tr>
            </v-radio-group>
            </tbody>
            <v-btn color="black"  elevation="1" outlined small>Top 4</v-btn>
          </template>
        </v-simple-table>

        <v-divider vertical></v-divider>
        <v-col class="d-flex flex-column pa-3">
          Management recommendation<br/>
          <span class="text-caption">
                  Per <a href="https://journals.lww.com/jlgtd/Fulltext/2020/04000/Risk_Estimates_Supporting_the_2019_ASCCP.4.aspx"
                         target="_blank">ASCCP 2019 Guidelines</a>
                      </span>
          <v-list dense flat two-line class="pa-2">
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title>
                  <v-row>
                    <v-col>
                      <v-alert v-if="recommendations[date][scenario]" border="left" colored-border :color='MGMT_COLOR[recommendations[date][scenario].management]' elevation="1">
                        {{ recommendations[date][scenario].management}}

                      </v-alert>
                      <v-alert v-if="!recommendations[date][scenario]" border="left" colored-border color='grey' elevation="1">
                        No match in this scenario. Use clinical judgment.

                      </v-alert>
                    </v-col>

                    <v-col>
                      <confidence-gauge v-if="recommendations[date][scenario]" :confidence="recommendations[date][scenario].confidence"></confidence-gauge>
                    </v-col>


                  </v-row>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>

                  <risk-gauge v-if="recommendations[date][scenario]" :riskImmediate="recommendations[date][scenario].cin3risk" :risk5y="recommendations[date][scenario].cin3risk5y"></risk-gauge>

                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>

      <v-timeline dense>
        <v-timeline-item small subtitle="Recommendations">
          {{ recommendations[date][scenario] }} {{ recommendations[date] }} <b> Scenario </b>{{ scenarioSelection }}
        </v-timeline-item>
      </v-timeline>

    </v-container>
  </section>
</template>

<script>


// Could use SyncFusion linear gauge: https://ej2.syncfusion.com/vue/documentation/linear-gauge/getting-started/ (licensing tricky)
// Or jqWidgets: https://www.jqwidgets.com/vue-components-documentation/documentation/jqxgauge/vue-gauge-styling-and-appearance.htm?search= (free for non-profit)
// DevExtreme/DevExpress - free for non-profits - https://js.devexpress.com/Demos/WidgetsGallery/Demo/Gauges/DifferentValueIndicatorTypesLinearGauge/Vue/Light/

// Epic's standard CCS tracking nomenclature:
// Procedure ("findings"): Pap Smear, Colposcopy, Excision, Ablation, Endometrial Biopsy, Endocervical Curettage
//

import Graph from "@dagrejs/graphlib/lib/graph";
import RiskGauge from "@/components/RiskGauge";
import ConfidenceGauge from "@/components/ConfidenceGauge";

// import {json} from "@dagrejs/graphlib";

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

// eslint-disable-next-line no-unused-vars
const COLPORESULT = {
  normal: 'Normal',
  cin1: 'CIN 1',
  cin2: 'CIN 2',
  cin3: 'CIN 3',
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
  cin1: 'CIN 1',
  cin2: 'CIN 2',
  cin3: 'CIN 3',
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
  'Pap management',
  'Pap w/prior abnormal Pap',
  'Post-colposcopy plan',
  'Pap after colposcopy',
  'Pap after treatment'       // Excel file lists bx result just as CIN 3, but article CIN 2 or 3; "ALL" Pap means primary HPV screening without Pap
                              // Cotest-negative x 2 row with no current result equates to co-test neg x 1, current co-test negative in article
                              // and similar for the rest of the current Pap results - they are blank, but they are really included in the Current HPV result column
];

const SCENARIO = {
  undefined: -1,
  papManagement: 0,
  papPriorAbnormal: 1,
  postColposcopy: 2,
  papAfterColposcopy: 3,
  papAfterTreatment: 4
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
  'HSIL+':      [ PAPRESULT.hsil,                                PAPRESULT.adenocarcinoma, PAPRESULT.ais, PAPRESULT.scc, PAPRESULT.agcfn ],
  'High Grade': [ PAPRESULT.hsil, PAPRESULT.asch, PAPRESULT.agc, PAPRESULT.adenocarcinoma, PAPRESULT.ais, PAPRESULT.scc, PAPRESULT.agcfn ],
  'Low Grade': [ PAPRESULT.ascus, PAPRESULT.lsil, PAPRESULT.nilm + '|' + HPVRESULT.hpvPositive],
  'ASC_US': [ PAPRESULT.ascus ],
  'ASCUS/LSIL': [ PAPRESULT.ascus, PAPRESULT.lsil ],

  // Moved these to splitCombinedResult
  // 'Cotest-negative': [ PAPRESULT.nilm + '|' + HPVRESULT.hpvNegative ],
  // 'HPV-negative/ASC-US': [ PAPRESULT.ascus + '|' + HPVRESULT.hpvNegative ],
  // 'HPV-positive/NILM': [ PAPRESULT.nilm + '|' + HPVRESULT.hpvPositive ],
  // 'HPV-negative/LSIL' : [ PAPRESULT.lsil + '|' + HPVRESULT.hpvNegative ],
  // 'HPV-negative/ASCUS/LSIL': [ PAPRESULT.ascus + '|' + HPVRESULT.hpvNegative, PAPRESULT.lsil + '|' + HPVRESULT.hpvNegative ],
  'ALL': [ 'NONE' ],  // All in the ASCCP spreadsheet means they summed results for all cytology to use as statsistics for NONE cytology, e.g., HPV-only testing
  'HPV-negative': ['NONE|' + HPVRESULT.hpvNegative ],
  '<CIN1': [ COLPORESULT.normal ] ,
  'CIN1': COLPORESULT.cin1,
  'CIN2': COLPORESULT.cin2,
  'CIN3': COLPORESULT.cin3,
  '<CIN2': [ COLPORESULT.cin1, COLPORESULT.normal ],
  'Cancer': [ COLPORESULT.adenocarcinoma, COLPORESULT.scc ]
  // Low grade (https://journals.lww.com/jlgtd/Fulltext/2020/04000/2019_ASCCP_Risk_Based_Management_Consensus.3.aspx E.2)
  // defined as HPV+ ASC-US, HPV+ LSIL, HPV+ NILM; see legend for Table 4A
}

// Returns true if a Pap and colposcopy are done on the same day. In this case,
// we don't count this as a Pap for scenario determination purposes
function papAndColpoSameDay(ccsResults, date) {
  const dailyResult = getDailyResults(ccsResults, date);

  if (dailyResult.pap && dailyResult.colposcopy) {
    return true;
  }

  return false;
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
function determineScenario(ccsResults) {
  let scenario = SCENARIO.undefined;
  let papCount = 0
  let i;
  const today = new Date();



  // If the most recent procedure is Colposcopy, we're in scenario 3
  // If Pap and colpo done same day... this is still a colpo
  if (ccsResults[0].procedure === PROCEDURE.colposcopy || (ccsResults[0].procedure === PROCEDURE.pap && papAndColpoSameDay((ccsResults, ccsResults[0].date)))) {
    scenario = SCENARIO.postColposcopy
    console.log(`Determined this is scenario ${scenario}`)
    return scenario;
  }

  // If there is only one procedure and it's a Pap, we're in scenario 1
  if (ccsResults[0].procedure === PROCEDURE.pap && ccsResults.length === 1) {
    scenario = SCENARIO.papManagement;
    console.log(`Determined this is scenario ${scenario}`)
    return scenario;
  }

  // Count backwards to see how many Paps there are following a colposcopy (Scenario 4) or tx (Scenario 5)
  for (i = 0; i < ccsResults.length; i++) {
    if (ccsResults[i].procedure == PROCEDURE.pap && !papAndColpoSameDay(ccsResults, ccsResults[i].date)) {
      papCount++;
    }
    if ((ccsResults[i].procedure == PROCEDURE.excision) || (ccsResults[i].procedure == PROCEDURE.ablation)) {
      if (papCount <= 3) {
        scenario = SCENARIO.papAfterTreatment;
        console.log(`Determined this is scenario ${scenario}`)

        return (scenario);
      }
    }
    if (ccsResults[i].procedure == PROCEDURE.colposcopy) {
      if (papCount <= 3) {
        scenario = SCENARIO.papAfterColposcopy
        console.log(`Determined this is scenario ${scenario}`)

        return (scenario)
      }
    }
  }


  // We're not in scenario 3, 4 or 5 so now we decide between 1 and 2
  // We'll start by assuming we're in scenario 1, then go back 5 years looking for a positive HPV, ASCUS or LSIL
  // We will look at the prior result even if it's more than 5 years ago to handle flaky people who didn't return for
  // screening for 5 years
  scenario = SCENARIO.papManagement;

  for (i = 1; i < ccsResults.length; i++) {
    if ((ccsResults[i].procedure.startsWith("HPV") && ccsResults[i].result.isInList(HPVRESULT.detected, HPVRESULT.hrhpvPositive, HPVRESULT.hpvPositive,
        HPVRESULT.positive, HPVRESULT.hpv16Positive, HPVRESULT.hpv18Positive)) ||
        ((ccsResults[i].procedure === PROCEDURE.pap) && (ccsResults[i].result.isInList(PAPRESULT.ascus, PAPRESULT.lsil)))) {
      scenario = SCENARIO.papPriorAbnormal;
      break;
    }
    // We've looked at at least the most recent result; is the next one more than 5 years old?
    // Converting the difference from milliseconds to seconds to minutes to hours to days to years by division
    if (((today - Date.parse(ccsResults[i].date)) / 1000 / 60 / 60 / 24 / 365.25) > 5) {
      break;
    }
  }
  console.log(`Determined this is scenario ${scenario}`)

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
function combineDailyResults (ccsResults) {
  var i;
  var date;
  var dailyResult = {};

  console.log(`Combining results. Starting with:`);
  console.log(ccsResults);

  for (i = 0; i < ccsResults.length; i++) {
      date = ccsResults[i].date;

      if (!dailyResult[date]) {
        dailyResult[date] = {}
        dailyResult[date].date = date;
      }

      if (!ccsResults[i].procedure) {
        continue;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.pap)) {
        dailyResult[date].pap = ccsResults[i].result;
        dailyResult[date].tz = ccsResults[i].tz;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.hpv16)) {
        dailyResult[date].hpv16 = ccsResults[i].result
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.hpv18)) {
        dailyResult[date].hpv18 = ccsResults[i].result
      }
      if (ccsResults[i].procedure.isInList("HPV", "HPV, high-risk", "HPV, HIGH RISK")) {
        dailyResult[date].hpv = ccsResults[i].result;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.colposcopy)) {
        dailyResult[date].colposcopy = ccsResults[i].result;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.excision)) {
        dailyResult[date].excision = ccsResults[i].result;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.emb)) {
        dailyResult[date].emb = ccsResults[i].result;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.ecc)) {
        dailyResult[date].ecc = ccsResults[i].result;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.ablation)) {
        dailyResult[date].ablation = ccsResults[i].result;
      }


  }
  console.log(`Daily results`);
  console.log(JSON.stringify(dailyResult));
  return dailyResult;
}


// Get all results from a given date
function getDailyResults(ccsResults, date) {
  let dailyResult = {};
  let i;

  // console.log(`Looking for results from ${date}`);

  for (i = 0; i < ccsResults.length; i++) {
    console.log(ccsResults[i]);
    if (ccsResults[i].date === date) {
      if (!ccsResults[i].procedure) {
        continue;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.pap)) {
        dailyResult.pap = ccsResults[i].result;
        dailyResult.tz = ccsResults[i].tz;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.hpv16)) {
        dailyResult.hpv16 = ccsResults[i].result
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.hpv18)) {
        dailyResult.hpv18 = ccsResults[i].result
      }
      if (ccsResults[i].procedure.isInList("HPV", "HPV, high-risk", "HPV, HIGH RISK")) {
        dailyResult.hpv = ccsResults[i].result;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.colposcopy)) {
        dailyResult.colposcopy = ccsResults[i].result;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.excision)) {
        dailyResult.excision = ccsResults[i].result;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.emb)) {
        dailyResult.emb = ccsResults[i].result;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.ecc)) {
        dailyResult.ecc = ccsResults[i].result;
      }
      if (ccsResults[i].procedure.isInList(PROCEDURE.ablation)) {
        dailyResult.ablation = ccsResults[i].result;
      }
    }

  }
  console.log(`Daily results for ${date}:`);
  console.log(dailyResult);
  return dailyResult;

}

// Get the daily result prior to a given date
// Assumes dates are in reverse chronological order
// eslint-disable-next-line no-unused-vars
function getPriorResult(ccsResults, date) {
  let i;

  for (i = 1; i < ccsResults.length; i++) {
    if (ccsResults[i].date === date || !ccsResults[i].procedure) {
      continue;
    }
    if (Date.parse(date) > Date.parse(ccsResults[i].date)) {
      // console.log(`Compared ${ccsResults[i].date} to ${date} - it's older!`)
      return getDailyResults(ccsResults, ccsResults[i].date)
    }
  }
  return null;
}

function getPriorDate(ccsResults, date) {
  let i;
  for (i = 1; i < ccsResults.length; i++) {
    if (ccsResults[i].date === date || !ccsResults[i].procedure) {
      continue;
    }
    if (Date.parse(date) > Date.parse(ccsResults[i].date)) {
      return(ccsResults[i].date)
    }
  }
  return null;
}

// Is a patient's age in the range of this graph node? (e.g., 45 is in 25-65?)
function ageInRange(age, node) {
  let min, max;
  // console.log(`In ageInRange with ${node}`)
  if (node.ageRange) {
    [ min, max ] = node.ageRange.split('-');
    // console.log(`Is ${age} between ${min} and ${max}?`)
    if ((age >= min) && age <= max) {
      return true;
    } else {
      return false;
    }

  } else {
    return false;
  }
}


// Given a patient and their cervical cancer screening results, go through each scenario
// and come up with recommendations for it
//
// Continued surveillance with HPV or co-testing at 3 year intervals for at least 25 y is recommended after tx and initial post-tx management
// of histologic HSIL, CIN 2, CIN 3 or AIS. Continued surveillance at 3 y intervlas beyond 25 y is acceptable if life epxectancy/ability to be screened exists
//
function makeRecommendations(patient, dailyResults, ccsResults, scenarioTree, date) {
  // eslint-disable-next-line no-unused-vars
  const age = patient.age;
  var i;
  let node = {};
  let level = 0;
  let priorLevel = 0;
  let childNode = {};
  let match = [];
  // eslint-disable-next-line no-unused-vars
  let dailyResult, priorResult, nodeName;

  // Not every scenario will be appropriate for every patient, and we'll come up with the one to display by default, but we want the others visible too
  // on the chance there's useful information there
  for (i = 0; i < scenarioList.length; i++) {
    // console.log(`Handling scenario ${i}, age ${age}`)
    console.log(`Scenario ${i}`);

    switch (i) {
        // Scenario 1, Initial management of abnormal screening results
      case SCENARIO.papManagement:
        console.log(`makeRecommendations: Handling scenario ${i}`);
        // dailyResult = getDailyResults(ccsResults, ccsResults[0].date);
        if (papExpansion[dailyResults[date].pap]) {
          // dailyResult.pap = papExpansion[dailyResult.pap].toString();
          dailyResults[date].pap = papExpansion[dailyResults[date].pap].toString();

        }

        // If our result is in the HSIL+ then we'll search for the whole list, since that's how we stored the name of the node
        // If that doesn't work we will also need to search in the High Grade category, which is more expansive than HSIL+
        if (papExpansion["HSIL+"].includes(dailyResults[date].pap)) {
          // dailyResult.pap = papExpansion["HSIL+"].toString();
          dailyResults[date].pap = papExpansion["HSIL+"].toString();

          nodeName = `${i}|${dailyResults[date].pap}|${dailyResults[date].hpv}`;
          if (!scenarioTree.hasNode(nodeName)) {
            dailyResults[date].pap = papExpansion["High Grade"].toString();
          }
        }

        nodeName = `${i}|${dailyResults[date].pap}|${dailyResults[date].hpv}`;
        console.log(`Looking for ${nodeName}`);
        if (scenarioTree.hasNode(nodeName)) {
          node = scenarioTree.node(nodeName);
          if (ageInRange(age, node)) {
            console.log(`Level 1 match in scenario ${i}, node ${nodeName}. ${scenarioTree.children(nodeName).length} children:`);
            console.log(scenarioTree.children(nodeName));
            date = getPriorDate(ccsResults, date);

            (scenarioTree.children(nodeName)).forEach(childNodeName => {
              childNode = scenarioTree.node(childNodeName);
              console.log(`Trying to match ${childNodeName} with Pap ${dailyResults[date].pap} and HPV ${dailyResults[date].hpv}`)
              if (childNode.procedure === dailyResults[date].pap && childNode.hpv === dailyResults[date].hpv) {
                console.log(">> Level 2 match, scenario 1 childNode:");
                console.log(childNode);
                match[i] = scenarioTree.node(childNodeName);
                if (isNaN(match[i].cin3risk5y)) {
                  match[i].cin3risk5y = -1;
                }
              }
            })
          }
        }
        break;

        // Scenario 2, Pap after prior abnormal
        // We're looking at the current Pap smear and HPV results, the prior one, and the one before that
        // We can base results on 1 prior if 2 Paps ago isn't included
      case SCENARIO.papPriorAbnormal:
        console.log(`makeRecommendations: Handling scenario ${i}, current Pap result: ${ccsResults[0].result}`);
        // dailyResult = getDailyResults(ccsResults, ccsResults[0].date);

        if (papExpansion[dailyResults[date].pap]) {
          dailyResults[date].pap = papExpansion[dailyResults[date].pap].toString();
        }

        // If our result is in the HSIL+ then we'll search for the whole list, since that's how we stored the name of the node
        // If that doesn't work we will also need to search in the High Grade category, which is more expansive than HSIL+
        if (papExpansion["HSIL+"].includes(dailyResults[date].pap)) {
          dailyResults[date].pap = papExpansion["HSIL+"].toString();
          nodeName = `${i}|${dailyResults[date].pap}|${dailyResults[date].hpv}`;
          if (!scenarioTree.hasNode(nodeName)) {
            dailyResults[date].pap = papExpansion["High Grade"].toString();
          }
        }

        // First, find the top of the scenario 2 tree matching today's Pap + HPV
        //
        nodeName = `${i}|${dailyResults[date].pap}|${dailyResults[date].hpv}`;
        console.log(`Looking for ${nodeName}`);

        if (scenarioTree.hasNode(nodeName)) {
          node = scenarioTree.node(nodeName)
          if (ageInRange(age, node)) {

            do  {
              console.log(`Level ${level} match in scenario ${i}, node ${nodeName}. ${scenarioTree.children(nodeName).length} children:`);
              console.log(scenarioTree.children(nodeName));
              // priorResult = getPriorResult(ccsResults, ccsResults[0].date);
              date = getPriorDate(ccsResults, date);
              childNode = {};

              priorLevel = level;

              (scenarioTree.children(nodeName)).forEach(childNodeName => {
                childNode = scenarioTree.node(childNodeName);

                if ((childNode.procedure.toString() === dailyResults[date].pap) && (childNode.hpv === dailyResults[date].hpv)) {
                  level++;
                  if (childNode.leaf) {
                    console.log(`>> Level ${level} match scenario 2 childNode:`);
                    console.log(childNode);
                    match[i] = scenarioTree.node(childNodeName);
                    if (isNaN(match[i].cin3risk5y)) {
                      match[i].cin3risk5y = -1;
                    }
                  } else {
                    childNode.name = childNodeName;
                  }

                }
              })

            } while (node && !node.leaf && !match[i] && level != priorLevel)
            node = childNode;
            if (node) {
              nodeName = childNode.name;

            }

          }
        }
        break;
      case SCENARIO.postColposcopy:
        console.log(`makeRecommendations: Handling scenario ${i}, current result: ${ccsResults[0].result}`);
        // dailyResult = getDailyResults(ccsResults, ccsResults[0].date);
        nodeName = `${i}|${dailyResults[date].colposcopy}`
        if (scenarioTree.hasNode(nodeName)) {
          node = scenarioTree.node(nodeName)
          if (ageInRange(age, node)) {
            console.log(`Level ${level} match in scenario ${i}, node ${nodeName} - ${scenarioTree.children(nodeName).length} children:`);
            // priorResult = getPriorResult(ccsResults, ccsResults[0].date);
            date = getPriorDate(ccsResults, date)
            if (node.leaf) {    // Higher grade biopsies show up in leaf nodes (with '-' as the Referral screen result;
                                // It doesn't matter what came before; they are getting treated
              console.log(`Level ${level} match.`);
              match[i] = scenarioTree.node(nodeName);
              console.log("Here's our match:" + JSON.stringify(match[i]))

              if (isNaN(match[i].cin3risk5y)) {
                match[i].cin3risk5y = -1;
              }
              break;
            }

            priorLevel = level;

            (scenarioTree.children(nodeName)).forEach(childNodeName => {
              childNode = scenarioTree.node(childNodeName);


              // We care about referral screen HPV results for NILM, ASC-US and LSIL; we don't seem to care about them
              // for ASC-H, AGC, or HSIL+ - this is the same as what's in papExpansion['High Grade']
              // TODO: and for any of those high-grade results, the app returns an algorithm figure, not just what's in the table
              if (papExpansion['High Grade'].includes(dailyResults[date].pap)) {
                dailyResults[date].hpv = ''
                // Stick a reference to the figure in the results
                // ASC-H: Figure 10
                // AGC: Figure 3 + 4
                // HSIL: Figure 9


              }
              // And for CIN 2 or 3, refer to figure 7
              // And for CIN 2, add a reference to Figure 8 with the link "Concerns about future pregnancy?"
              // For AIS, figure 11
              // For pregnancy, yield the message: "ECC, EMB, and treatment without biopsy are not acceptable during pregnancy.
              // Excision or repeat biopsy is recommended only if cancer is suspect based on cytology, visualization during colposcopy or the colposcopic biopsy result.

              if (papExpansion["HSIL+"].includes(dailyResults[date].pap)) {
                dailyResults[date].pap = papExpansion["HSIL+"].toString();

              }

              // console.log(`Trying to match ${childNodeName} with referral screen Pap ${priorResult.pap} and HPV ${priorResult.hpv}`)
              // console.log(`Child node: ${childNode.procedure.length}|${childNode.hpv}; prior Pap: ${priorResult.pap.length}|${priorResult.hpv}`)
              // console.log(`Pap comparison: ${childNodeName.procedure === priorResult.pap}, HPV comparison: ${childNode.hpv === priorResult.hpv}`);

              if (childNode.procedure.toString() === dailyResults[date].pap && childNode.hpv === dailyResults[date].hpv) {
                level++;
                console.log(`>> Level ${level} match, scenario 1 childNode:`);
                console.log(childNode);
                match[i] = scenarioTree.node(childNodeName);
                if (isNaN(match[i].cin3risk5y)) {
                  match[i].cin3risk5y = -1;
                }
              }
            })
            if (level === priorLevel){  // We went through all the child nodes and none matches
              break;
            }
          }
        }
        break;

        case SCENARIO.papAfterColposcopy: // Scenario 4
          console.log(`makeRecommendations: Handling scenario ${i}, current result: ${ccsResults[0].result}`);
          // dailyResult = getDailyResults(ccsResults, ccsResults[0].date);
          if (papExpansion[dailyResults[date].pap]) {
            dailyResults[date].pap = papExpansion[dailyResults[date].pap].toString();
          }

          // All high grade results are lumped into one scenario
          if (papExpansion["High Grade"].includes(dailyResults[date].pap)) {
            dailyResults[date].pap = papExpansion["High Grade"].toString();
          }

          // The ASCCP uses ALL (which we translate to NONE) to mean HPV only, so the Pap part will be blank
          if (dailyResults[date].pap === 'NONE') {
            dailyResults[date].pap = '';
          }
          nodeName = `${i}|${dailyResults[date].pap}|${dailyResults[date].hpv}`;
          console.log(`Looking for ${nodeName}`);

          if (scenarioTree.hasNode(nodeName)) {
            node = scenarioTree.node(nodeName);
            if (ageInRange(age, node)) {
              do {
                console.log(`Level ${level} match in scenario ${i}, node ${nodeName}. ${scenarioTree.children(nodeName).length} children:`);
                console.log(scenarioTree.children(nodeName));
                // priorResult = getPriorResult(ccsResults, ccsResults[0].date);
                date = getPriorDate(ccsResults, date);
                // [ priorResult.pap, priorResult.hpv ] = splitCombinedResult(priorResult.pap);
                childNode = {};

                priorLevel = level;

                (scenarioTree.children(nodeName)).forEach(childNodeName => {
                  childNode = scenarioTree.node(childNodeName);
                  console.log(`Trying to match prior ${dailyResults[date].pap} / ${dailyResults[date].hpv} to child node ${childNodeName}`);
                  if ((childNode.procedure.toString() === dailyResults[date].pap) && (childNode.hpv === dailyResults[date].hpv)) {
                    level++;

                    if (childNode.leaf) {
                      console.log(`>> Level ${level} match scenario 2 childNode:`);
                      console.log(childNode);
                      match[i] = scenarioTree.node(childNodeName);
                      if (isNaN(match[i].cin3risk5y)) {
                        match[i].cin3risk5y = -1;
                      }
                    } else {
                      childNode.name = childNodeName;
                    }

                  }
                })
                console.log(`Came in at level ${priorLevel}, now at level ${level}`)
                // if (level === priorLevel) {    // No matching nodes among the children
                //   break;
                // }

              } while (node && !node.leaf && !match[i] && (level != priorLevel))
            }
          }

          node = childNode;
          if (node) {
            nodeName = childNode.name;
          }

          break;

        case SCENARIO.papAfterTreatment:  // Scenario 5
          console.log(`makeRecommendations: Handling scenario ${i}, current result: ${ccsResults[0].result}`);

          break;

    }
  }
  return match;

}

function getPatientResults() {
  let ccsResults;
  let hpvResults = [];
  let i, date, result, hpv16, hpv18, hpv, newResult;

  ccsResults = [
    // { date: '9/20/2020', procedure: 'Pap Smear', result: 'HSIL', tz: 'Present' },
    // { date: '9/20/2020', procedure: 'HPV, HIGH RISK', result: 'Detected' },
    // { date: '9/20/2020', procedure: 'HPV GENOTYPE 16', result: 'Detected'},
    // { date: '9/20/2020', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
    // { date: '9/12/2020', procedure: 'Excision', result: 'CIN 2'},
    { date: '9/6/2020', procedure: 'Colposcopy', result: 'CIN 1'},
    { date: '9/2/2020', procedure: 'Pap Smear', result: 'HSIL', tz: 'Present' },
    { date: '9/2/2020', procedure: 'HPV, HIGH RISK', result: 'Detected' },
    { date: '9/2/2020', procedure: 'HPV GENOTYPE 16', result: 'Detected'},
    { date: '9/2/2020', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
    { date: '6/3/2019', procedure: 'Pap Smear', result: 'NILM', tz: 'Present'},
    { date: '6/3/2019', procedure: 'HPV, HIGH RISK', result: 'Detected' },
    { date: '6/3/2019', procedure: 'HPV GENOTYPE 16', result: 'Not Detected'},
    { date: '6/3/2019', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
    { date: '6/23/2014', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
    { date: '6/23/2014', procedure: 'HPV, HIGH RISK', result: 'Not Detected' },
    { date: '6/23/2014', procedure: 'HPV GENOTYPE 16', result: 'Not Detected'},
    { date: '6/23/2014', procedure: 'HPV GENOTYPE 18', result: 'Not Detected'},
    { date: '10/12/2009', procedure: 'Pap Smear', result: 'NILM', tz: 'Present'},
  ];

  // Process the input to get the nomenclature to match the ASCCP spreadsheets
  // Combine all the HPV results from one date into one result
  // HPV-negative, HPV-positive, HPV16+, HPV16-,18+

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
      console.log(`Handling ${result} ${hpvResults[date][result].procedure}`);

      if (hpvResults[date][result].procedure.isInList(PROCEDURE.hpv, PROCEDURE.hpvHighRisk)) {
        hpv = hpvResults[date][result].result.isInList(HPVRESULT.positive, HPVRESULT.detected, HPVRESULT.hpvPositive);
      } else if (hpvResults[date][result].procedure.isInList(PROCEDURE.hpv16)) {
        hpv16 = hpvResults[date][result].result.isInList(HPVRESULT.positive, HPVRESULT.detected, HPVRESULT.hpvPositive, HPVRESULT.hpv16Positive);
      } else if (hpvResults[date][result].procedure.isInList(PROCEDURE.hpv18)) {
        hpv18 = hpvResults[date][result].result.isInList(HPVRESULT.positive, HPVRESULT.detected, HPVRESULT.hpvPositive, HPVRESULT.hpv18Positive);
      }
    }
    console.log(`hpv ${hpv}, hpv16 ${hpv16}, hpv18 ${hpv18}`)
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
    console.log(`New result ${newResult.procedure} ${newResult.result}`)
    for (i = 0; i < ccsResults.length; i++) {
      if (ccsResults[i].date === date && ccsResults[i].procedure.startsWith('HPV')) {
        console.log(`Replacing ccsResults at ${date}`)
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
  // console.log("Returning CCS results: ");
  // console.log(ccsResults);
  return ccsResults;
}

function getPatient() {
  var patient = {
    birthdate: '4/22/75',
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
  const importJSON = requireContext => requireContext.keys().forEach(key => scenarioTable[parseInt(key.match(/\d+/),10) - 1] = requireContext(key));
  // importJSON(require.context('!!raw-loader!@/assets', true, /^.*\.json$/));

  // Call the function to load the files
  importJSON(require.context('@/assets/json', true, /^.*\.json$/));

  return scenarioTable;
}

// eslint-disable-next-line no-unused-vars
function addNode(tree, level, parent, child) {

}

// For spreadsheet entries that represent Paps + HPV's in one cell, like Cotest negative, HPV-negative
// Return things like [ NILM, HPV-Negative ] and [ NONE, HPV-Negative ]
// Some of the spreadsheet values (in 2020) had leading spaces - trim those
function splitCombinedResult (combinedResult) {
  if (!combinedResult) {
    return ['', '']
  }
  combinedResult = combinedResult.trim();
  switch (combinedResult) {
    case 'NO HISTORY':
      return [ '', ''];
    case 'HPV-negative':
      return [ PAPRESULT.none, HPVRESULT.hpvNegative];
    case 'Cotest-negative':
      return [ PAPRESULT.nilm, HPVRESULT.hpvNegative ];
    case 'HPV-negative/ASC-US':
      return [ PAPRESULT.ascus, HPVRESULT.hpvNegative ];
    case 'HPV-negative/LSIL':
      return [ PAPRESULT.lsil, HPVRESULT.hpvNegative];
    case 'HPV-positive/NILM':
      return [ PAPRESULT.nilm, HPVRESULT.hpvPositive ];
    case 'HPV-positive NILM':
      return [ PAPRESULT.nilm, HPVRESULT.hpvPositive ];
    case 'HPV-positive ASC-US':
      return [ PAPRESULT.ascus, HPVRESULT.hpvPositive ];
    case 'HPV-positive LSIL':
      return [ PAPRESULT.lsil, HPVRESULT.hpvPositive ];
    case 'HPV-negative/ASCUS/LSIL':
      return [ [ PAPRESULT.ascus, PAPRESULT.lsil ], HPVRESULT.hpvNegative];

    default:
      return ['', ''];

  }
}

// Convert the JSON scenario table into a tree
// Uses https://www.npmjs.com/package/graphlib
// eslint-disable-next-line no-unused-vars
function makeScenarioTree(scenarioTable) {
  console.log("In makeScenarioTree")
  console.log(scenarioTable);

  const tree = new Graph( { multigraph: false, compound: true, directed: true});
  let i, j, nodeName, previousNodeName, edgeName, papResult, hpvResult, bxResult;

  for (i = 0; i < scenarioList.length; i++) {
    for (j = 2; j < scenarioTable[i][0].length; j++) {
      let node = {};
      let nextNode = {};
      let k = 1;

      papResult = hpvResult = null;

      // console.log(`Tree processing scenario ${i}, item ${j}`);

      switch (i) {
        case SCENARIO.papManagement:      // Scenarios 1, 2 and 4
        case SCENARIO.papPriorAbnormal:
        case SCENARIO.papAfterColposcopy:

          if (!scenarioTable[i][0][j]['Current PAP Result']) {
            // console.log(`Dumping out at top node, item ${j}`);
            continue;
          } else {
            papResult = scenarioTable[i][0][j]['Current PAP Result'];
            hpvResult = scenarioTable[i][0][j]['Current HPV Result'];
          }

          if (papExpansion[papResult]) {
            papResult = papExpansion[papResult];
          }
          node = {
            procedure: papResult,
            hpv: hpvResult,
            ageRange: scenarioTable[i][0][j]['Age'],
            scenario: i,

            leaf: false
          };
          nodeName = `${node.scenario}|${node.procedure}|${node.hpv}`;
          if (!tree.hasNode(nodeName)) {
            tree.setNode(nodeName, node)
          }
          previousNodeName = nodeName;

          // Handle the first sub-node if needed
          if (i === SCENARIO.papManagement || i === SCENARIO.papPriorAbnormal) { // Scenarios 1 and 2
            [ papResult, hpvResult ] = splitCombinedResult(scenarioTable[i][0][j]['PAST HISTORY (most recent)']);
            // console.log(`Scenario ${i}, first sub-node, line ${j}: Pap ${papResult}, HPV ${hpvResult}`)
            // if (papExpansion[papResult]) {
            //   papResult = papExpansion[papResult];
            // }
            node = {
              procedure: papResult,
              hpv: hpvResult,
              leaf: (i === SCENARIO.papManagement),
              scenario: i
            }
          } else if (i === SCENARIO.papAfterColposcopy) { // Scenario 4
            papResult = scenarioTable[i][0][j]['Post-Colpo Test Result - PAST HISTORY'];

            if (papResult && papResult.includes('x2')) {
              // Handle an extra node for things like Cotest-negative x2
              [ papResult, hpvResult ] = splitCombinedResult(papResult.substring(0, papResult.search('x2')-1));
              node = {
                procedure: papResult,
                hpv: hpvResult,
                leaf: false,
                scenario: i
              }
              nodeName = `${i}-${j}-${k++}|${node.procedure}|${node.hpv}`;
              if (!tree.hasNode(nodeName)) {
                tree.setNode(nodeName, node);
              }
              edgeName = `${papResult}|${hpvResult}`;
              tree.setEdge(previousNodeName, nodeName, edgeName);
              tree.setParent(nodeName, previousNodeName);

              previousNodeName = nodeName;

              node = {
                procedure: papResult,
                hpv: hpvResult,
                leaf: false,
                scenario: i
              }
            } else {
              [papResult, hpvResult] = splitCombinedResult(papResult);
              node = {
                procedure: papResult,
                hpv: hpvResult,
                leaf: false,
                scenario: i
              }
            }

          }

          nodeName = `${i}-${j}-${k++}|${node.procedure}|${node.hpv}`;
          if (!tree.hasNode(nodeName)) {
            tree.setNode(nodeName, node);
          }
          edgeName = `${papResult}|${hpvResult}`;
          tree.setEdge(previousNodeName, nodeName, edgeName);
          tree.setParent(nodeName, previousNodeName);
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

              node.management = scenarioTable[i][0][j]['Management'];
              node.cin3risk = scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'];
              node.cin3risk5y = scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'];
              node.confidence =  scenarioTable[i][0][j]['Management Confidence Probability'];

              nodeName = `${i}-${j}-${k++}|${node.procedure}|${node.hpv}`;
              if (!tree.hasNode(nodeName)) {
                tree.setNode(nodeName, node);
              }
              edgeName = '';
              tree.setEdge(previousNodeName, nodeName, edgeName);
              tree.setParent(nodeName, previousNodeName);

              // console.log(`Leaf at subnode 1, item ${j}`);

              continue;
            }
            [ papResult, hpvResult ] = splitCombinedResult(scenarioTable[i][0][j]['PAST HISTORY (previous 2)']);


            node = {
              procedure: papResult,
              hpv: hpvResult,
              scenario: i,
              management: scenarioTable[i][0][j]['Management'],
              cin3risk: scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'],
              cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
              confidence: scenarioTable[i][0][j]['Management Confidence Probability'],
              leaf: true
            }
            nodeName = `${i}-${j}-${k++}|${node.procedure}`;
            if (!tree.hasNode(nodeName)) {
              tree.setNode(nodeName, node);
            }
            edgeName = `${papResult}|${hpvResult}`;
            tree.setEdge(previousNodeName, nodeName, edgeName);
            tree.setParent(nodeName, previousNodeName);

          } else if (i === SCENARIO.papAfterColposcopy) {
            // Handle the second sub-node for Scenario 4
            papResult = papExpansion[scenarioTable[i][0][j]['Pre-Colpo Test Result']];
            hpvResult = '';
            // We'll need  special case when interpreting low grade, since it has this definition (2 cases where it doesn't matter what the HPV result is, 1 where it's positive)
            // [ PAPRESULT.ascus, PAPRESULT.lsil, PAPRESULT.nilm + '|' + HPVRESULT.hpvPositive]
            node = {
              procedure: papResult,
              hpv: hpvResult,
              scenario: i,
              management: scenarioTable[i][0][j]['Management'],
              cin3risk: scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'],
              cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
              confidence: scenarioTable[i][0][j]['Management Confidence Probability'],
              leaf: true
            }
            nodeName = `${i}-${j}-${k++}|${node.procedure}`;
            if (!tree.hasNode(nodeName)) {
              tree.setNode(nodeName, node);
            }
            edgeName = `${papResult}|${hpvResult}`;
            tree.setEdge(previousNodeName, nodeName, edgeName);
            tree.setParent(nodeName, previousNodeName);

          }


          break;

        case SCENARIO.postColposcopy: // Scenario 3
          var histologyResult = scenarioTable[i][0][j]['Biopsy Result'];  // Epic reports results like CIN 1, CIN 2;
                                                                          // The ASCCP tab les have things like CIN1, <CIN1
          if (papExpansion[scenarioTable[i][0][j]['Biopsy Result']]) {    // We'll handle that in papExpansion (convert them to Epic-like results)
            histologyResult = papExpansion[scenarioTable[i][0][j]['Biopsy Result']];
          }
          node = {
            histologyResult: histologyResult,
            ageRange: scenarioTable[i][0][j]['Age'],
            scenario: i,
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

          if (!node.leaf) {
            previousNodeName = nodeName;
            // Most cases have a single subnode for Referral Screen Result
            [papResult, hpvResult] = splitCombinedResult(scenarioTable[i][0][j]['Referral Screen Result']);
            if (papResult === '' && hpvResult === '') {   // Turns out this wasn't a combined result after all
              papResult = scenarioTable[i][0][j]['Referral Screen Result'];     // If this isn't combined (like HPV-positive NILM) then it's a Pap (including things like HSIL+)
              if (papExpansion[papResult]) {
                papResult = papExpansion[papResult];
              }
              hpvResult = '';
            }
            node = {
              procedure: papResult,
              hpv: hpvResult,
              scenario: i,
              management: scenarioTable[i][0][j]['Management'],
              // cin3risk: scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'],  // Doesn't exist as of 2020
              cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
              // confidence: scenarioTable[i][0][j]['Management Confidence Probability'], // Doesn't exist as of 2020
              leaf: true
            }
            nodeName = `${i}-${j}-${k++}|${node.procedure}|${node.hpv}`;
            if (!tree.hasNode(nodeName)) {
              tree.setNode(nodeName, node);
            }
            edgeName = `${papResult}|${hpvResult}`;
            tree.setEdge(previousNodeName, nodeName, edgeName);
            tree.setParent(nodeName, previousNodeName);
          }
          break;

        case SCENARIO.papAfterTreatment:    // Scenario 5
          // In Table 5, the authors have 4 cases were current Pap result is blank but current HPV result says something
          // like HPV-negative x2, Co-test negative x2, HPV-negative x3, Cotest-negative x3

          hpvResult = scenarioTable[i][0][j]['Current HPV Result'];
          // console.log(`Tree generation, scenario ${i}, item ${j}, HPV ${hpvResult}`)
          if (scenarioTable[i][0][j]['Current PAP Result']) {
            papResult = scenarioTable[i][0][j]['Current PAP Result'];
            if (papExpansion[papResult]) {
              papResult = papExpansion[papResult];
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
                papResult = 'NONE';
                remaining = 'hpv';
              } else if (hpvResult === 'Cotest-negative x2') {
                hpvResult = HPVRESULT.hpvNegative;
                papResult = PAPRESULT.nilm;
                remaining = 'cotest'
              } else if (hpvResult === 'HPV-negative x3') {
                hpvResult = HPVRESULT.hpvNegative;
                papResult = 'NONE';
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
                  procedure: 'NONE',
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
                  procedure: 'NONE',
                  hpv: HPVRESULT.hpvNegative,
                  leaf: false
                }
                nextNode = {
                  procedure: 'NONE',
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
                edgeName = `${node.procedure}|${node.hpv}`;
                tree.setEdge(previousNodeName, nodeName, edgeName);
                tree.setParent(nodeName, previousNodeName);

                previousNodeName = nodeName;

                if (nextNode) {
                  nodeName = `${node.scenario}-${j}-${k++}|${nextNode.procedure}|${nextNode.hpv}`
                  if (!tree.hasNode(nodeName)) {
                    tree.setNode(nodeName, nextNode)
                  }
                  edgeName = `${nextNode.procedure}|${nextNode.hpv}`;
                  tree.setEdge(previousNodeName, nodeName, edgeName);
                  tree.setParent(nodeName, previousNodeName);

                  previousNodeName = nodeName;
                }
              }

              // Finish scenario 5
              bxResult = scenarioTable[i][0][j]['Biopsy Result Before Treatment'];
              // Turns out though even the Excel file says CIN 3, the published table (table 5A) lists CIN 2 or 3 for all
              // https://journals.lww.com/jlgtd/Fulltext/2020/04000/Risk_Estimates_Supporting_the_2019_ASCCP.4.aspx
              if (bxResult === 'CIN3') {   // ASCCP uses CIN3, Epic CIN 3
                bxResult = [ COLPORESULT.cin2, COLPORESULT.cin3 ];
              }
              node = {
                scenario: i,
                procedure: bxResult,
                management: scenarioTable[i][0][j]['Management'],
                cin3risk: scenarioTable[i][0][j]['CIN3+ Immediate risk (%)'],
                cin3risk5y: scenarioTable[i][0][j]['CIN3+ 5 year risk  (%)'],
                confidence: scenarioTable[i][0][j]['Management Confidence Probability'],
                leaf: true
              }
              nodeName = `${node.scenario}-${j}-${k++}|${node.procedure}`
              if (!tree.hasNode(nodeName)) {
                tree.setNode(nodeName, node)
              }
              edgeName = node.procedure
              tree.setEdge(previousNodeName, nodeName, edgeName);
              tree.setParent(nodeName, previousNodeName);

              continue;
            }
          }
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
    get: () => function(...args) {
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
let dailyResults = combineDailyResults(ccsResults);

// We munge a copy of dailyResults while making recommendations for search tree purposes (e.g., HSIL+ searches)
// So we'll leave the original alone for display purposes
const dailyResultsCopy = JSON.parse(JSON.stringify(dailyResults));

let scenario = determineScenario(ccsResults);
let scenarioSelection = scenarioList[scenario];
let scenarioTable = getScenarioTable()
let scenarioTree = makeScenarioTree(scenarioTable)


const birthdateTime = Date.parse(patient.birthdate);
// const today = new Date();
let pregnancySelection = pregnancyStateList[patient.pregnant];
let immunocompromiseSelection = immunocompromiseStateList[patient.immunocompromised];
let recommendations = {};
let date = ccsResults[0].date // Start by interpreting the most recent result
patient.age = Math.floor((new Date() - birthdateTime)/(1000*60*60*24*365.25));

// console.log(`Scenario table:`)
// console.log(scenarioTable);
// console.log(req.keys());
// console.log(`Patient age: ${patient.age}`);



recommendations[date] = {}
recommendations[date] = makeRecommendations(patient, dailyResultsCopy, ccsResults, scenarioTree, date);
// console.log("CCS results: ")
// console.log(ccsResults);
// console.log(`${JSON.stringify(recommendations)}`);
// console.log(`Scenario ${scenario}`)
console.log("Done with main.");



export default {
  name: "Recommendations",
  methods: {
    submitPregnancySelection () {
      console.log(`Pregnancy state selected: ${this.pregnancySelection}`);
    },
    submitImmunocompromiseSelelection () {
      console.log(`Immunocompromise selected: ${this.immunocompromiseSelection}`);
    },
    submitScenarioSelection () {
      console.log(`Scenario selected: ${this.scenarioSelection} (${scenario} -> ${scenarioList.indexOf(this.scenarioSelection)})`);
      this.scenario = scenarioList.indexOf(this.scenarioSelection);
      // scenarioSelection = this.scenarioSelection;
    }
  },
  components: {
    RiskGauge,
    ConfidenceGauge
  },
  data () {
    return {
      patient: patient,
      pregnancySelection,
      pregnancyStateList,
      dailyResults,
      date: ccsResults[0].date,
      immunocompromiseSelection,
      immunocompromiseStateList,
      scenarioSelection, // The selected description of the scenario
      scenarioList,      // The list of descriptions
      scenario,          // The selected scenario
      recommendations,
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
