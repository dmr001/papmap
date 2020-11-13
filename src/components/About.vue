<template>

  <v-layout >

    <v-card>
      <v-card-title class="text-subtitle-1" :style=" { backgroundColor: colors.blueGrey.lighten5 }">
        <img src="speculum.svg" width="100" height="100" class="pa-4">
        Pap<b>Map</b>
      </v-card-title>

      <v-card-text >
        <v-row :style=" { backgroundColor: colors.cyan.lighten4 }">
          <v-col>
            PapMap 0.1
          </v-col>
          <v-col>
            <div class="text-body-2">
              Daniel Rosenberg MD<br/>
              Providence Medical Group, Portland, OR
              <br/>
            </div>
          </v-col>
        </v-row>
        <br/>
        <br/>
      </v-card-text>

      <v-card-subtitle>
        Applies ASCCP 2020 cervical cancer screening guidelines to reconciled cytology, HPV, colposcopy and
        treatment results.

      </v-card-subtitle>
      <v-divider></v-divider>
      <v-card-text class="text-caption">
         This software is designed to aid in the application of algorithms but
          is not guaranteed, and cannot substitute for your medical judgment.
          <br/><br/>
          The ASCCP algorithms are &copy;2020 Perkins, RB, Guido RS et al, as published in the
          <a href="https://www.asccp.org/Assets/b2263c88-ec67-4ab0-9f07-6f112e76f8d7/637269576182030000/2019-asccp-risk-based-management-consensus-3-5-pdf">
            2019 ASCCP Risk-based management consensus guidelines</a>.
          These were published under the Creative Commons <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CCBY-NC-ND 4.0</a>
          license, which permits sharing the work with proper citation.
          <br/><br/>
          This software &copy;2020 Providence, and is published under the <a href="https://opensource.org/licenses/MIT">MIT License</a>.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click.native="closeClick">Close</v-btn>
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
  methods: {
    closeClick () {
      this.$emit('submit', 'test');
    }
  }
}
</script>

<style scoped>

</style>
