module.exports = {
  "pluginOptions": {
    "quasar": {
      "importStrategy": "kebab",
      "rtlSupport": false
    }
  },
  "configureWebpack": {
    module: {
      rules: [
        {
          test: /\.(pdf)(\?.*)?$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                name: 'files/[name].[hash:8].[ext]'
              }
            }
          ]
        }
      ]
    },

  },
  "devServer": {
    "host": "localhost"
  },
  "transpileDependencies": [
    "vuetify"
  ]
}
