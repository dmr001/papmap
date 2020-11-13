<template>

  <v-layout>

    <v-card>
      <v-card-title class="text-subtitle-1" :style=" { backgroundColor: colors.purple.lighten4 }">
        <img src="speculum.svg" width="80" height="80" class="pa-2">
        <v-row>
          <v-col>
            <span class="px-3">
              Pap<b>Map</b>
            </span>
            <v-divider vertical></v-divider>
            <span class="px-3 text-body-2">
              0.1
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


      <v-card-subtitle :style=" { backgroundColor: colors.blueGrey.lighten4 }" class="pa-4">
        Applies ASCCP 2020 cervical cancer screening guidelines to reconciled cytology, HPV, colposcopy and
        treatment results.
      </v-card-subtitle>

      <v-divider></v-divider>
      <v-card-text class="text-caption" :style=" { backgroundColor: colors.blueGrey.darken3 }">
         This software is designed to aid in the application of algorithms but
          is not guaranteed, and cannot substitute for your medical judgment.
          <br/><br/>
          The ASCCP algorithms are &copy;2020 Perkins, RB, Guido RS et al, as published in the
          <a href="https://www.asccp.org/Assets/b2263c88-ec67-4ab0-9f07-6f112e76f8d7/637269576182030000/2019-asccp-risk-based-management-consensus-3-5-pdf">
            2019 ASCCP Risk-based management consensus guidelines</a>.
          These were published under the Creative Commons <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CCBY-NC-ND 4.0</a>
          license, which permits sharing the work with proper citation.
          <br/><br/>
        Version <b>0.1</b> &mdash; Initial alpha test
          <br/><br/>
          This software &copy;2020 Providence, and is published under the <a href="https://opensource.org/licenses/MIT">MIT License</a>.
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
