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
  console.log('Hello World');

  var linkHandler; // TODO fix async loading bugs

  $timeout(() => {
    // TODO: move this to a controller, broadcast events out of frame
    var linkHandler = Plaid.create({
      product: 'auth',
      env: 'production',
      clientName: 'SFOX',
      key: '0b041cd9e9fbf1e7d93a0d5a39f5b9',
      onLoad: function () {
        console.log('Loaded')
      },
      onSuccess: function (public_token, metadata) {
        $scope.token = public_token;
        $scope.getBankAccounts($scope.token);
      },
      onExit: function () {}
    });

    let bindPlaidLink = () => {
      $timeout(() => {
        console.log('Bind link to', document.getElementById('linkButton'));
        document.getElementById('linkButton').onclick = function () {
          linkHandler.open();
        };
      }, 10);
    };

    bindPlaidLink();
  }, 1000);
});
