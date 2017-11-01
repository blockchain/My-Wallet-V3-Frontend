/* eslint-disable semi */
angular
  .module('walletApp')
  .component('serviceAlert', {
    template: '<block-alert config="$ctrl.alert" show-icon="true" />',
    controller: ServiceAlertController
  })

function ServiceAlertController (Env) {
  Env.then(options => { this.alert = options.web.serviceAlert.global })
}
