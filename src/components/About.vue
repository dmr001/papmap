<template>

  <v-layout>

    <v-card>
      <v-card-title class="text-subtitle-1" :style=" { backgroundColor: colors.purple.lighten2 }">
        <img src="speculum.svg" width="80" height="80" class="pa-2">
        <v-row>
          <v-col>
            <v-divider vertical></v-divider>

            <span class="pa-3">
              Pap<b>Map</b>
            </span>

          </v-col>
          <v-col>
            <div class="text-caption">
              Daniel Rosenberg MD<br/>
              Providence Medical Group, Portland, OR
              <br/>
            </div>
          </v-col>
        </v-row>
      </v-card-title>


      <v-card-subtitle :style=" { backgroundColor: colors.blueGrey.lighten1 }" class="pa-4">
        Applies ASCCP 2020 cervical cancer screening guidelines to reconciled cytology, HPV, colposcopy and
        treatment results.
      </v-card-subtitle>

      <v-divider></v-divider>
      <v-card-text class="text-caption" :style=" { backgroundColor: colors.blueGrey.darken3 }">
         This software is designed to aid in the application of algorithms but
          is not guaranteed, and cannot substitute for your medical judgment.
          <br/><br/>
          The ASCCP algorithms are &copy;2020 Perkins, RB, Guido RS et al, as published in the
          <a target=_blank  href="https://www.asccp.org/Assets/b2263c88-ec67-4ab0-9f07-6f112e76f8d7/637269576182030000/2019-asccp-risk-based-management-consensus-3-5-pdf">
            2019 ASCCP Risk-based management consensus guidelines</a>.
          These were published under the Creative Commons <a target=_blank href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CCBY-NC-ND 4.0</a>
          license, which permits sharing the work with proper citation.

        <v-expansion-panels>
          <v-row>
            <v-col>
              <v-expansion-panel>
                <v-expansion-panel-header class="text-caption" :style=" { backgroundColor: colors.blueGrey.darken3 }">
                  Version 0.1
                </v-expansion-panel-header>
                <v-expansion-panel-content :style=" { backgroundColor: colors.blueGrey.darken2 }">
                  Version <b>0.1</b> &mdash; Initial alpha test
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-col>

            <v-col>
          <v-expansion-panel>

            <v-expansion-panel-header class="text-caption" :style=" { backgroundColor: colors.blueGrey.darken3 }">
              Copyright notice
            </v-expansion-panel-header>
            <v-expansion-panel-content class="text-caption" :style=" { backgroundColor: colors.blueGrey.darken2 }">
              Copyright &copy;2020 Daniel Rosenberg MD, Providence Medical Group
              <br/><br/>
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the "Software"), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
              <br/><br/>
              The above copyright notice and this permission notice shall be included in all
              copies or substantial portions of the Software.
              <br/><br/>
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
              AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
              LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
              SOFTWARE.
            </v-expansion-panel-content>
          </v-expansion-panel>

            </v-col>

          </v-row>
        </v-expansion-panels>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click.native="closeAbout">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-layout>

</template>

<script>
import colors from 'vuetify/lib/util/colors'

export default {
  name: "About",
  data() {
    return {
      colors
    }
  },
  props: {
    displayAbout: Boolean
  },
  methods: {
    closeAbout () {
      console.log("Closing.")
      this.$emit('close', 'about');
    }
  }
}
</script>

<style scoped>

</style>
