// Grunt will parse the lookup table and replace the file names with easier to cache versions.
// Thanks to @knalli: https://github.com/angular-translate/bower-angular-translate-loader-static-files/pull/15#issuecomment-94441414

angular
  .module('bcTranslateStaticFilesLoader', [])
  .factory('BCTranslateStaticFilesLoader', BCTranslateStaticFilesLoader);

BCTranslateStaticFilesLoader.$inject = ['$http', '$q', '$translateStaticFilesLoader'];

function BCTranslateStaticFilesLoader ($http, $q, $translateStaticFilesLoader) {
  const map = {
    de: 'assets/build/locales/de.json',
    hi: 'assets/build/locales/hi.json',
    no: 'assets/build/locales/no.json',
    ru: 'assets/build/locales/ru.json',
    pt: 'assets/build/locales/pt.json',
    bg: 'assets/build/locales/bg.json',
    fr: 'assets/build/locales/fr.json',
    zh_CN: 'assets/build/locales/zh-cn.json',
    'zh-cn': 'assets/build/locales/zh-cn.json',
    hu: 'assets/build/locales/hu.json',
    sl: 'assets/build/locales/sl.json',
    id: 'assets/build/locales/id.json',
    sv: 'assets/build/locales/sv.json',
    ko: 'assets/build/locales/ko.json',
    el: 'assets/build/locales/el.json',
    en: 'assets/build/locales/en.json',
    it: 'assets/build/locales/it.json',
    es: 'assets/build/locales/es.json',
    vi: 'assets/build/locales/vi.json',
    th: 'assets/build/locales/th.json',
    ja: 'assets/build/locales/ja.json',
    pl: 'assets/build/locales/pl.json',
    da: 'assets/build/locales/da.json',
    ro: 'assets/build/locales/ro.json',
    nl: 'assets/build/locales/nl.json',
    tr: 'assets/build/locales/tr.json'
  };

  return function (options) {
    let mapped = map[options.key] || map['en'];
    let deferred = $q.defer();

    let httpOptions = angular.extend({
      url: mapped,
      method: 'GET',
      params: ''
    }, options.$http);

    $http(httpOptions)
      .success(deferred.resolve)
      .error(function (data) {
        deferred.reject(options.key);
      });

    return deferred.promise;
  };
}
