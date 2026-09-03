const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'zh-TW',
    locales: ['en', 'de-DE', 'es', 'zh-CN', 'hi', 'id', 'tr-TR', 'zh-TW'],
  },
  localePath: path.resolve('public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  keySeparator: false,
  namespaceSeparator: false,
  pluralSeparator: '——',
  contextSeparator: '——'
}
