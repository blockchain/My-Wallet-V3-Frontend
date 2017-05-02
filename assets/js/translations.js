'use strict';
angular
  .module('translations', [])
  .config(TranslationsConfig);

TranslationsConfig.$inject = ['$translateProvider'];

function TranslationsConfig ($translateProvider) {
  // We need to support the same languages as iOs and Android or provide
  // fallbacks, or $translate.use will throw an exception.

  $translateProvider.registerAvailableLanguageKeys([
    'de', 'hi', 'no', 'ru', 'pt', 'bg', 'fr', 'zh-cn',
    'hu', 'sl', 'id', 'sv', 'ko', 'el', 'en', 'it',
    'es', 'vi', 'th', 'ja', 'pl', 'da', 'ro', 'nl', 'tr', 'cs', 'uk'
  ]);

  $translateProvider.useLoader('BCTranslateStaticFilesLoader');
  $translateProvider.determinePreferredLanguage();
  $translateProvider.fallbackLanguage('en');
  $translateProvider.useSanitizeValueStrategy('escaped');

  // Use our custom directive in some cases:
  $translateProvider.directivePriority(0);
}
