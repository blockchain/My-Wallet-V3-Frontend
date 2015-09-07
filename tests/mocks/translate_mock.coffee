angular.module("pascalprecht.translate", ["ng"]).run [
  "$translate"
  ($translate) ->
    return
]

angular.module("pascalprecht.translate").provider "$translate", ->

  $get: () ->
    $translate = (template, params) ->
      promise = {}
      promise.then = (callback) ->
        callback(template)

      return promise

    $translate.use = (language) ->
      return

    $translate.proposedLanguage = () ->
      return "en"

    $translate.instant = (template, params) ->
      template

    return $translate
