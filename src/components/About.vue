<template>

  <v-layout row justify-center>

      <v-card  color="#385F73"
               dark >
        <v-card-title class="text-subtitle-1">
          <img src="speculum.svg" width="100" height="100" class="pa-4">
           Pap<b>Map</b>
        </v-card-title>
        <v-card-text>
          <v-divider></v-divider>
          <v-row>
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
          <v-divider></v-divider>
          <br/>
          Applies ASCCP 2020 cervical cancer screening guidelines to reconciled cytology, HPV, colposcopy and
          treatment results.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click.native="closeClick">Close</v-btn>
        </v-card-actions>
      </v-card>
  </v-layout>

</template>

<script>
export default {
  name: "About",

  methods: {
    closeClick () {
      this.$emit('submit', 'test');
    }
  }
}
</script>

<style scoped>

</style>
