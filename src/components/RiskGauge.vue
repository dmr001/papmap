<template>

  <div>
  <!--
  <div>
    Immediate risk: {{ riskImmediate }} <br/>
    5y risk: {{ risk5y }}
  </div>
  -->

  <div v-if="!isNaN(riskImmediate) && riskImmediate >= 4">
    <v-badge left bordered overlap :content="Math.round(10 * riskImmediate)/10 + '%'"
             offset-y="23" :offset-x="xRiskImmediate + 32">
    <svg height="80" width="500">
      <defs>
        <linearGradient id="gradImmediate" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
        </linearGradient>
        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 l2,-2
           M0,4 l4,-4
           M3,5 l2,-2"
                style="stroke:black; stroke-width:1" />
        </pattern>
      </defs>

      <rect  x="0" y="30" width="384" height="16" fill="url(#gradImmediate)" />
      <rect  x="0" y="30" width="84" height="16"
             style="fill:gray;stroke:white;stroke-width:1.2;fill-opacity:0.0;stroke-opacity:0.9" />
      <rect  x="84" y="30" width="140" height="16"
             style="fill:gray;stroke:white;stroke-width:1.2;fill-opacity:0.0;stroke-opacity:0.9"/>
      <rect  x="224" y="30" width="160" height="16"
             style="fill:gray;stroke:white;stroke-width:1.2;fill-opacity:0.0;stroke-opacity:0.9"/>



      <text x="13" y="42" style="fill:black;" font-family="Arial" font-size = "11" font-weight="550">Colposcopy
        <tspan x="89" y="42" font-weight="550">Treatment vs colposcopy</tspan>
        <tspan x="250" y="42" font-weight="550">Treatment (preferred)</tspan>
      </text>
      <rect  v-if="isNaN(riskImmediate)" x="0" y="30" width="384" height="16" style="fill:url(#diagonalHatch);fill-opacity:40%" />

      <text x="0" y="57" style="fill:black;" font-family="Arial" font-size = "11">4%
        <tspan x="77" y="57">25%</tspan>
        <tspan x="218" y="57">60%</tspan>
        <tspan x="370" y="57">100%</tspan>
      </text>



      <polygon v-if="!isNaN(riskImmediate)" :points="xRiskImmediateTriangle" style="fill:black;stroke:blue;stroke-width:1" />
<!--
      <rect v-if="!isNaN(riskImmediate)" :x="xRiskImmediate" y="4" width="30" height="18" style="fill:aliceblue;stroke:gray;stroke-width:1;fill-opacity:1.0" />
      <text v-if="!isNaN(riskImmediate)" :x="xRiskImmediate + 2" y="17" style="fill:black;" font-family="Arial" font-weight="bolder" font-size = "12">{{ Math.round(riskImmediate*10)/10 }}% </text>
 -->
      <text :x="xRiskImmediateLegend" y="17" style="fill:gray;" font-family="Arial" font-weight="bold" font-size = "11">Immediate risk of CIN3+
      </text>

      Sorry, your browser does not support inline SVG.
    </svg>
    </v-badge>
  </div>

  <div v-if="!isNaN(risk5y) && risk5y <= 9 && risk5y >= 0">
    <v-badge left bordered overlap :content="Math.round(100 * risk5y)/100 + '%'"
             offset-y="23" :offset-x="xRisk5y + 33">
    <svg height="80" width="500">
      <defs>
        <linearGradient id="grad5y" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:rgb(0,255,0);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(255,128,0);stop-opacity:1" />
        </linearGradient>
        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 l2,-2
           M0,4 l4,-4
           M3,5 l2,-2"
                style="stroke:black; stroke-width:1" />
        </pattern>
      </defs>

      <rect  x="0" y="30" width="384" height="16" fill="url(#grad5y)" />
      <rect  x="0" y="30" width="60" height="16"
             style="fill:gray;stroke:white;stroke-width:1.2;fill-opacity:0.0;stroke-opacity:0.9" />
      <rect  x="60" y="30" width="160" height="16"
             style="fill:gray;stroke:white;stroke-width:1.2;fill-opacity:0.0;stroke-opacity:0.9"/>
      <rect  x="220" y="30" width="164" height="16"
             style="fill:gray;stroke:white;stroke-width:1.2;fill-opacity:0.0;stroke-opacity:0.9"/>



      <text x="15" y="42" style="fill:black;" font-family="Arial" font-size = "11" font-weight="550">5y f/u
        <tspan x="95" y="42" font-weight="550">3-year followup</tspan>
        <tspan x="250" y="42" font-weight="550">1-year followup</tspan>
      </text>
      <rect  v-if="isNaN(risk5y)" x="0" y="30" width="384" height="16" style="fill:url(#diagonalHatch);fill-opacity:70%" />


      <text x="0" y="57" style="fill:black;" font-family="Arial" font-size = "11">0%
        <tspan x="52" y="57">0.15%</tspan>
        <tspan x="212" y="57">0.55%</tspan>
        <tspan x="370" y="57">9%</tspan>
      </text>



      <polygon v-if="!isNaN(risk5y)" :points="xRisk5yTriangle" style="fill:blue;stroke:blue;stroke-width:1" />
<!--
      <rect v-if="!isNaN(risk5y)" :x="xRisk5y" y="4" width="30" height="18" style="fill:aliceblue;stroke:gray;stroke-width:1;fill-opacity:1.0" />
      <text v-if="!isNaN(risk5y)" :x="xRisk5y + 2" y="17" style="fill:black;" font-family="Arial" font-weight="bolder" font-size = "12">{{ Math.round(risk5y*10)/10 }}%</text>
-->

      <text :x="xRisk5yLegend" y="17" style="fill:gray;" font-family="Arial" font-weight="bold" font-size = "11">5 year risk of CIN3+
      </text>

      Sorry, your browser does not support inline SVG.
    </svg>
    </v-badge>
  </div>

  </div>

</template>

<script>

export default {
  name: "RiskGauge",
  props: {
    risk5y: Number,
    riskImmediate: Number
  },
  computed: {
    xRiskImmediate: function () {
      return this.riskImmediate * 4;
    },
    xRiskImmediateLegend: function () {
      return this.xRiskImmediate > 200 ? this.xRiskImmediate - 80 : this.xRiskImmediate + 35;
    },
    xRiskImmediatePlus: function (x) {
      return this.xRiskImmediate + x;
    },
    xRiskImmediateTriangle: function () {
      return this.xRiskImmediate + 8 + ',22 ' + this.xRiskImmediate + 16 + ',22 ' + this.xRiskImmediate + 12 + ',28'
    },
    xRisk5y: function () {
      return this.risk5y <= 0.55 ? this.risk5y * 400 : 220 + (this.risk5y - 0.55) * 19.4;
    },
    xRisk5yLegend: function () {
      return this.xRisk5y > 200 ? this.xRisk5y - 110 : this.xRisk5y + 35;
    },
    xRisk5yPlus: function (x) {
      return this.xRisk5y + x;
    },
    xRisk5yTriangle: function () {
      return this.xRisk5y + 8 + ',22 ' + this.xRisk5y + 16 + ',22 ' + this.xRisk5y + 12 + ',28'
    }
  }
}
</script>

<style scoped>

</style>
