'use strict';
const modules = [
  'ngSanitize',
  'ui.bootstrap',
  'ui.router'
];

angular.module('plaidApp', modules)
.config(($compileProvider) => {
})
.run(($rootScope, $state, $q, $timeout, $location) => {
  $timeout(() => {
    var linkHandler = window.Plaid.create({
      product: 'auth',
      env: 'production',
      clientName: 'SFOX',
      key: '0b041cd9e9fbf1e7d93a0d5a39f5b9',
      onLoad: function () {},
      onExit: function () {
        window.parent.postMessage({from: 'plaid', to: 'exchange', command: 'disablePlaid'}, 'http://localhost:8080');
      },
      onSuccess: function (public_token, metadata) {
        window.parent.postMessage({from: 'plaid', to: 'exchange', command: 'getBankAccounts', msg: public_token}, 'http://localhost:8080');
      }
    });
    $timeout(() => {
      document.getElementById('linkButton').onclick = function () {
        window.parent.postMessage({from: 'plaid', to: 'exchange', command: 'enablePlaid'}, 'http://localhost:8080');
        linkHandler.open();
      };
    }, 1);
  }, 1);
});
