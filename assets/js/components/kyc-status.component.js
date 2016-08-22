angular
  .module('walletApp')
  .component('kycStatus', {
    bindings: {
      onTrigger: '&'
    },
    templateUrl: 'templates/kyc-status.jade'
  });
