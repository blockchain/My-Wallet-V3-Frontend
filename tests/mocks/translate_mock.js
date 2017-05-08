angular.module('pascalprecht.translate', ['ng']).run([
  '$translate',
  function ($translate) {
  }
]);

angular.module('pascalprecht.translate').provider('$translate', () =>

  ({
    $get () {
      let $translate = function (template, params) {
        let promise = {};

        if (template instanceof Array) {
          template = template.reduce(function (acc, next) {
            acc[next] = next;
            return acc;
          }
          , {});
        }

        promise.then = function (callback) {
          let res = template;
          for (let key in params) {
            let value = params[key];
            res += `|${value}`;
          }
          return callback(res);
        };

        return promise;
      };

      $translate.use = function (language) {
      };

      $translate.proposedLanguage = () => 'en';

      $translate.instant = (template, params) => template;

      return $translate;
    }
  })
);

let translateFilterFactory = () => input => input;

angular.module('pascalprecht.translate').filter('translate', translateFilterFactory);
