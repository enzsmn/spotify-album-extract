module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: process.env.NODE_ENV === 'production' ? ['transform-remove-console'] : []
}
