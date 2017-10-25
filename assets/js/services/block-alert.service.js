/* eslint-disable semi */
angular
  .module('walletApp')
  .factory('blockAlert', blockAlert)

function blockAlert () {
  const allTrue = (xs) => xs.every(x => x === true)

  const alertTypes = ['info', 'warning', 'danger']

  const isLocalizedMessage = (message) =>
    angular.isObject(message) && message['en'] != null

  const isValidConfig = (config) => allTrue([
    angular.isObject(config),
    alertTypes.indexOf(config.type) > -1,
    config.dismissId == null || angular.isString(config.dismissId),
    config.header == null || isLocalizedMessage(config.header),
    config.sections && config.sections.length > 0 && config.sections.every(s =>
      isLocalizedMessage(s.title) && isLocalizedMessage(s.body)
    ),
    config.action == null || (
      isLocalizedMessage(config.action.title) &&
      angular.isString(config.action.link)
    )
  ])

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

  return {
    isValidConfig,
    localizeConfig
  }
}
