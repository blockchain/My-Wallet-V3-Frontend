
require('../css/blockchain.css.scss');

const whatsNew = [
  { title: 'EXPORT_HISTORY', desc: 'EXPORT_HISTORY_EXPLAIN', date: 1466521300000 },
  { title: 'WHATS_NEW', desc: 'WHATS_NEW_EXPLAIN', date: 1463716800000 },
  { title: 'SIGN_VERIFY', desc: 'SIGN_VERIFY_EXPLAIN', date: 1462161600000 },
  { title: 'TRANSFER_ALL', desc: 'TRANSFER_ALL_EXPLAIN', date: 1461556800000 },
  { title: 'DEV_THEMES', desc: 'DEV_THEMES_EXPLAIN', date: 1474862400000 }
];

import routes from './routes';
import core from './core';
import landing from './landing';
import filters from './filters';

export default angular
  .module('walletApp.main', [core, filters, landing])
  .config(routes)
  .config(AppConfig)
  .run(AppInit)
  .constant('whatsNew', whatsNew)
  .name;

function AppConfig ($compileProvider, uiSelectConfig, $ocLazyLoadProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
  uiSelectConfig.theme = 'bootstrap';

  $ocLazyLoadProvider.config({
    debug: false,
    events: false,
    modules: [{
      name: 'walletApp.core',
      files: ['buildpack/wallet.bundle.js']
    }]
  });
}

function AppInit ($rootScope, $uibModal, $state, $q, $timeout, $location, $ocLazyLoad, languages) {
  $rootScope.$safeApply = (scope = $rootScope, before) => {
    before = before;
    if (!scope.$$phase && !$rootScope.$$phase) scope.$apply(before);
  };

  $rootScope.browserCanExecCommand = (
    (browserDetection().browser === 'chrome' && browserDetection().version > 42) ||
    (browserDetection().browser === 'firefox' && browserDetection().version > 40) ||
    (browserDetection().browser === 'ie' && browserDetection().version > 10)
  );

  $rootScope.$on('showNotification', (_, notification) => {
    $uibModal.open({
      templateUrl: 'partials/modal-notification.jade',
      controller: 'ModalNotificationCtrl',
      windowClass: 'notification-modal',
      resolve: { notification: () => notification }
    });
  });

  let code = languages.parseFromUrl($location.absUrl());
  if (code) languages.set(code);
}
