/* eslint-disable semi */
angular
  .module('walletApp')
  .component('blockAlert', {
    bindings: {
      config: '<'
    },
    templateUrl: 'templates/block-alert.pug',
    controller: BlockAlertController
  })

const isLocalizedMessage = (message) =>
  angular.isObject(message) && message['en'] != null

const isValidConfig = (config) => (
  angular.isObject(config) &&
  ['info', 'warning', 'danger'].indexOf(config.type) > -1 &&
  (config.header == null || isLocalizedMessage(config.header)) &&
  (config.sections && config.sections.length > 0 && config.sections.every(s =>
    isLocalizedMessage(s.title) && isLocalizedMessage(s.body)
  )) &&
  (!config.action || (isLocalizedMessage(config.action.title) && config.action.link))
)

const localize = (lang, localizedMessage) =>
  localizedMessage[lang] || localizedMessage['en']

const localizeConfig = (lang, config) => ({
  type: config.type,
  header: localize(lang, config.header),
  sections: config.sections.map(s => ({
    title: localize(lang, s.title),
    body: localize(lang, s.body)
  })),
  action: config.action && {
    title: localize(lang, config.action.title),
    link: config.action.link
  }
})

function BlockAlertController (languages) {
  if (isValidConfig(this.config)) {
    this.alert = localizeConfig(languages.get(), this.config)
  } else {
    console.warn('block-alert received invalid config:', this.config)
  }
}
