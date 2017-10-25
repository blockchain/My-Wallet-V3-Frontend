/* eslint-disable semi */
angular
  .module('walletApp')
  .component('serviceAlert', {
    template: '<block-alert config="$ctrl.alert" />',
    controller: ServiceAlertController
  })

function ServiceAlertController (Env) {
  Env.then(options => { this.alert = options.platforms.web.serviceAlert })
}
