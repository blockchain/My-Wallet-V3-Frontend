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
  (config.dismissId == null || angular.isString(config.dismissId)) &&
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
  dismissId: config.dismissId,
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

function BlockAlertController (languages, localStorageService) {
  this.iconTypes = {
    'info': 'icon-success',
    'warning': 'icon-alert',
    'danger': ''
  }
  if (isValidConfig(this.config)) {
    this.alert = localizeConfig(languages.get(), this.config)
    this.dismissable = this.alert.dismissId != null

    if (this.dismissable) {
      this.storageId = `dismissed-block-alert-id:${this.alert.dismissId}`
      this.dismissed = localStorageService.get(this.storageId)
      this.dismiss = () => {
        this.dismissed = true
        localStorageService.set(this.storageId, true)
      }
    }
  } else {
    console.warn('block-alert received invalid config:', this.config)
  }
}
