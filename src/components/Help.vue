<template>

  <div >
    <v-card>
      <v-card-title class="text-subtitle-1" :style=" { backgroundColor: colors.purple.lighten5 }">
      <span class="px-3">
        Pap<b>Map</b>
      </span>

      <v-divider vertical ></v-divider>
      <span class="px-3">
        Help
      </span>
      </v-card-title>
      <v-card-text transition="slide-y-transition" v-show="displayHelp">
        <v-row>
          <v-col>
          <ul>
            <li> Select a result on the left (latest defaulted) to get corresponding recommendations on the right. </li>
            <li> It's worth reviewing prior recommendations to get details about expected follow-up.</li>

          </ul>
          </v-col>
          <v-col>
            <ul>
              <li> Missing results may invalidate recommendations, as may skipping the recommendations (e.g., no colposcopy done after one was recommended). </li>
              <li> ASCCP guidelines are less detailed for patients under 25; for younger patients you may see recommendations from 2012 guidelines. </li>
            </ul>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click.native="closeHelp">Close</v-btn>
      </v-card-actions>
    </v-card>
  </div>

</template>

<script>
import colors from 'vuetify/lib/util/colors';

export default {
  name: "Help",
  data() {
    return {
      colors
    }
  },
  props: {
    displayHelp: Boolean
  },
  methods: {
    closeHelp () {
      console.log("Closing.")
      this.$emit('close', 'help');
    }
  }
}
</script>

<style scoped>

</style>
