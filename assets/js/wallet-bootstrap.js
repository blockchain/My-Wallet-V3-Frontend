var e = document.getElementById('wallet-app');
angular.bootstrap(e, ['walletApp']);

angular
  .module('walletApp')
  .config(TranslationsConfig);

TranslationsConfig.$inject = ['$translateProvider'];

function TranslationsConfig ($translateProvider) {
  window.sharedModules.translations($translateProvider);
}
