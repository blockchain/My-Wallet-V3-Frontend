
import ngtranslate from 'angular-translate';
import ngtranslateloader from 'angular-translate-loader-static-files';
import BCTranslateStaticFilesLoader from './services/bcTranslationLoader.service';

export default angular
  .module('translations', [ngtranslate, ngtranslateloader])
  .factory('BCTranslateStaticFilesLoader', BCTranslateStaticFilesLoader)
  .config(TranslationsConfig)
  .name;

TranslationsConfig.$inject = ['$translateProvider'];

function TranslationsConfig ($translateProvider) {
  // We need to support the same languages as iOs and Android or provide
  // fallbacks, or $translate.use will throw an exception.

  $translateProvider.registerAvailableLanguageKeys([
    'de', 'hi', 'no', 'ru', 'pt', 'bg', 'fr', 'zh-cn',
    'hu', 'sl', 'id', 'sv', 'ko', 'el', 'en', 'it',
    'es', 'vi', 'th', 'ja', 'pl', 'da', 'ro', 'nl', 'tr'
  ]);

  $translateProvider.useLoader('BCTranslateStaticFilesLoader');
  $translateProvider.determinePreferredLanguage();
  $translateProvider.fallbackLanguage('en');
  $translateProvider.useSanitizeValueStrategy('escaped');
}
