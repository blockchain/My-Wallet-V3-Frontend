angular.module("pascalprecht.translate", ["ng"]).run [
  "$translate"
  ($translate) ->
    return
]

angular.module("pascalprecht.translate").provider "$translate", ->

  $get: () ->
    $translate = (template, params) ->
      promise = {}

      if template instanceof Array
        template = template.reduce (acc, next) ->
          acc[next] = next
          return acc
        , {}

      promise.then = (callback) ->
        res = template
        for key, value of params
          res += "|" + value
        callback(res)

      return promise

    $translate.use = (language) ->
      return

    $translate.proposedLanguage = () ->
      return "en"

    $translate.instant = (template, params) ->
      template

    return $translate

translateFilterFactory = () ->
  (input) -> input

angular.module("pascalprecht.translate").filter('translate', translateFilterFactory)
