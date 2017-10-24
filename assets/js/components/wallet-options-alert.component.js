/* eslint-disable semi */
angular
  .module('walletApp')
  .component('walletOptionsAlert', {
    template: [
      '<div class="mb-15" ng-show="$ctrl.alert">',
      '  <block-alert config="$ctrl.alert" />',
      '</div>'
    ].join(''),
    controller: WalletOptionsAlertController
  })

function WalletOptionsAlertController (Env) {
  Env.then(options => { this.alert = options.alert })
}
