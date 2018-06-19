angular
  .module('walletApp')
  .component('maintenanceWarning', {
    template: (
      '<div class="ph-40 flex-center pv-10 f-16 bg-warning" ng-if="$ctrl.showBanner">' +
        '<i class="icon-alert f-24"></i><span class="ml-10" translate="DOWN_FOR_MAINTENANCE"></span>' +
      '</div>'
    ),
    controller (Env) {
      Env.then(env => {
        this.showBanner = env.maintenance;
      });
    }
  });
