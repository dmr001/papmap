<template>
  <v-app id="inspire">
    <div >
      <v-app-bar dark height="32">

        <v-app-bar-nav-icon>
          <v-menu>
            <template v-slot:activator="{ on }">
              <v-btn dark icon v-on="on">
                <v-icon class="mdi-18px">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-list dark>
                <v-list-item @click="displayAbout = true">
                  <v-list-item-title>
                    About
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="displayHelp = true">
                  <v-list-item-title >
                    Help
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </v-app-bar-nav-icon>

        <v-toolbar-title>
          <div class="text-body-2">
          Pap<b>Map</b>
          </div>
        </v-toolbar-title>

      </v-app-bar>
    </div>

    <v-main>
      <recommendations :displayHelp="displayHelp" :displayAbout="displayAbout" @close="closeDisplay"></recommendations>
    </v-main>
  </v-app>
</template>

<script>

import Recommendations from "@/components/Recommendations";

export default {
  name: 'App',

  components: {
    Recommendations,

  },
  methods: {

    closeDisplay: function (what) {
      console.log("Closing display.", what)
      if (what === 'help') {
        this.displayHelp = false;
      } else if (what === 'about') {
        this.displayAbout = false;
      }
    }
    // showHelp: function () {
    //   this.displayHelp = true;
    // }
  },

  data() {
   return {
     aboutDialog: true,
     displayHelp: false,
     displayAbout: false
   }
  }
};
</script>
