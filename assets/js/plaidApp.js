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
        window.parent.postMessage({id: 'plaid', function: 'disablePlaid'}, window.location.origin);
      },
      onSuccess: function (public_token, metadata) {
        window.parent.postMessage({id: 'plaid', function: 'setToken', msg: public_token}, window.location.origin);
      }
    });
    $timeout(() => {
      document.getElementById('linkButton').onclick = function () {
        window.parent.postMessage({id: 'plaid', function: 'enablePlaid'}, window.location.origin);
        linkHandler.open();
      };
    }, 1);
  }, 1);
});
