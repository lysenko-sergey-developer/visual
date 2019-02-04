const config = require('./config')

class SetupEnvironment {
  constructor(argv) {
    this.RESPONSIVE = this.setResponsive(argv)
    this.PAGES = config.routes
  }

  setResponsive(argv) {
    const responsivePattern = argv.find(arg => /--res=/.test(arg) || /-r=/.test(arg))
    if (!responsivePattern) return config.responsive
    const responsive = responsivePattern.match(/([^\-(\-res|r)].+)/)[0].match(/\w+/g)
    return responsive || config.responsive
  }
}

module.exports = SetupEnvironment
