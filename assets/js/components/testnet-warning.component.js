angular
  .module('walletApp')
  .component('testnetWarning', {
    template: (
      '<div class="pal f-16 bg-red" ng-if="$ctrl.showTestnetWarning">' +
        '<span class="white" translate="TESTNET_WARNING"></span>' +
      '</div>'
    ),
    controller (Env) {
      Env.then(env => {
        this.showTestnetWarning = env.network === 'testnet';
      });
    }
  });
