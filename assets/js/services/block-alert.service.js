/* eslint-disable semi */
angular
  .module('walletApp')
  .factory('blockAlert', blockAlert)

function blockAlert ($translate, languages) {
  const allTrue = (xs) => xs.every(x => x === true)

  const alertTypes = ['info', 'warning', 'danger']
  const hideTypes = ['collapse', 'dismiss']

  const isValidConfig = (config) => angular.isObject(config) && allTrue([
    alertTypes.indexOf(config.type) > -1,
    config.hideType == null || hideTypes.indexOf(config.hideType) > -1,
    config.header == null || languages.isLocalizedMessage(config.header),
    config.sections && config.sections.length > 0 && config.sections.every(s =>
      (s.title == null || languages.isLocalizedMessage(s.title)) &&
      (languages.isLocalizedMessage(s.body))
    ),
    config.action == null || (
      languages.isLocalizedMessage(config.action.title) &&
      (config.action.link == null || angular.isString(config.action.link))
    )
  ])

  const localizeConfig = (config) => ({
    type: config.type,
    hideType: config.hideType,
    header: languages.localizeMessage(config.header),
    sections: config.sections.map(s => ({
      title: s.title && languages.localizeMessage(s.title),
      body: languages.localizeMessage(s.body)
    })),
    action: config.action && {
      title: languages.localizeMessage(config.action.title),
      link: config.action.link
    }
  })

  const create = (type) => (header, sections, action, { hideType } = {}) =>
    ({ type, hideType, header, sections, action })

  const header = (title) =>
    $translate.instant(title)

  const section = (title, body) =>
    ({ title: $translate.instant(title), body: $translate.instant(body) })

  const action = (title, link) =>
    ({ title: $translate.instant(title), link })

  return {
    isValidConfig,
    localizeConfig,
    header,
    section,
    action,
    createInfo: create('info'),
    createWarning: create('warning'),
    createDanger: create('danger')
  }
}
