<template>
  <div>
    <div v-if="!isNaN(confidence)">
    <v-badge left bordered overlap :content="Math.round(100 * confidence)/100"
             offset-x="22" offset-y="recommendations[scenario].confidence * 10">
      <svg height="50" width="55">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(50,50,200);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(50,50,250);stop-opacity:1" />
          </linearGradient>
          <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2
                     M0,4 l4,-4
                     M3,5 l2,-2"
                  style="stroke:black; stroke-width:1" />
          </pattern>
        </defs>

        <rect x="30" :y="yConfidence" width="8" :height="45 - yConfidence" fill="url(#grad1)" />
        <rect x="30" y="5" width="8" height="40"
              style="fill:gray;stroke:gray;stroke-width:0;fill-opacity:0.2;stroke-opacity:0.9" />
<!--
        <rect v-else x="30" y="5" width="8" height="40" fill="url(#diagonalHatch)" />
-->



        <text x="45" y="50" style="fill:black;" font-family="Arial" font-size = "11">0
          <tspan x="45" y="13">1</tspan>
        </text>


        <polygon :points="confidenceTriangle" style="fill:blue;stroke:blue;stroke-width:1" />
        <!-- rect x="5" v-if="yConfidence" :y="yConfidence - 6" width="22" height="15"
          style="fill:lightyellow;stroke:gray;stroke-width:0.5;fill-opacity:1.0" /-->

        <!--  Handle number box by badge instead
              <circle v-if="!isNaN(confidence)" cx="14" r="13"  :cy="yConfidence" style="fill:lightyellow;stroke:gray;stroke-width:0.5;fill-opacity:1.0" />
              <text x="6" v-if="!isNaN(confidence)" :y="yConfidence + 4" style="fill:black;" font-family="Arial" font-weight="bold" font-size = "9">{{ Math.round(confidence * 100)/100 }} </text>
        -->
        Sorry, your browser does not support inline SVG.
      </svg>


      <div v-if="myMessage">
        {{ myMessage }}
      </div>
      <div class="text-caption" >
        Confidence
      </div>

    </v-badge>
  </div>
    <div v-else class="text-caption">
      (Confidence not available.)
    </div>
  </div>
</template>

<script>

// Main entry




export default {
  name: "ConfidenceGauge",
  props: {
    confidence: undefined,   // Usually a number, but can be "special situation"
  },
  data () {
    return {
      myConfidence: this.getConfidence(),
      myMessage: ''
    }
  },
  methods: {
    getConfidence() {
      // console.log(`Confidence gauge got ${this.confidence}, a ${typeof (this.confidence)}`)
      this.myConfidence = this.confidence;
      this.myMessage = '';
      if (typeof(this.confidence) != 'number') {
        this.myMessage = "Special situation"
        this.myConfidence = 0;
      }
      // console.log(`myConfidence set to ${this.myConfidence}, myMessage ${this.myMessage}`);
      return this.myConfidence;
    }
  },
  computed: {
    yConfidence: function () {
      let y = this.myConfidence;
      // let y = this.confidence;

      // console.log(`getConfidence is ${y}`);
      // console.log(`Setting yConfidence to ${40 - (y * 40)}`)
      return (45 - (y * 40));
    },
    confidenceTriangle: function () {
      // "43,8 43,12 40,10"
      // let points = '43 ,'.toString() + this.yConfidence - 2 + ' 43,' + this.yConfidence + 2 + ' 40,' + this.yConfidence
      // let points = `43,${this.yConfidence - 2} 43,${this.yConfidence + 2} 40,${this.yConfidence}`
      let points = `24,${this.yConfidence} 28,${this.yConfidence} 24,${this.yConfidence + 3}`

      console.log(`Triangle points: ${points}`);
      return points;
    }
  }
}

</script>

<style scoped>

</style>
