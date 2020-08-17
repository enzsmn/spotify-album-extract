module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: process.env.VUE_APP_ENV === 'production' ? ['transform-remove-console'] : []
}
