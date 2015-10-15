// Grunt will parse the lookup table and replace the file names with easier to cache versions.
// Thanks to @knalli: https://github.com/angular-translate/bower-angular-translate-loader-static-files/pull/15#issuecomment-94441414

angular
  .module('bcTranslateStaticFilesLoader', [])
  .factory('BCTranslateStaticFilesLoader', BCTranslateStaticFilesLoader);

BCTranslateStaticFilesLoader.$inject = ['$http', '$q', '$translateStaticFilesLoader'];

function BCTranslateStaticFilesLoader($http, $q, $translateStaticFilesLoader) {
  const map = {
    de: 'build/locales/de.json',
    hi: 'build/locales/hi.json',
    no: 'build/locales/no.json',
    ru: 'build/locales/ru.json',
    pt: 'build/locales/pt.json',
    bg: 'build/locales/bg.json',
    fr: 'build/locales/fr.json',
    'zh-cn': 'build/locales/zh-cn.json',
    hu: 'build/locales/hu.json',
    sl: 'build/locales/sl.json',
    id: 'build/locales/id.json',
    sv: 'build/locales/sv.json',
    ko: 'build/locales/ko.json',
    el: 'build/locales/el.json',
    en: 'build/locales/en.json',
    it: 'build/locales/it.json',
    es: 'build/locales/es.json',
    vi: 'build/locales/vi.json',
    th: 'build/locales/th.json',
    ja: 'build/locales/ja.json',
    pl: 'build/locales/pl.json',
    da: 'build/locales/da.json',
    ro: 'build/locales/ro.json',
    nl: 'build/locales/nl.json',
    tr: 'build/locales/tr.json'
  };

  return function(options) {
    if (map[options.key]) {
      let mapped = map[options.key];
      let deferred = $q.defer();
      $http(angular.extend({
        url: mapped,
        method: 'GET',
        params: ''
      }, options.$http)).success(function(data) {
        deferred.resolve(data);
      }).error(function(data) {
        deferred.reject(options.key);
      });
      return deferred.promise;
    } else {
      return console.log('Don\'t know which language file to fetch');
    }
  };
}
