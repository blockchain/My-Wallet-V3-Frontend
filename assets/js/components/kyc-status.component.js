angular
  .module('walletApp')
  .component('kycStatus', {
    bindings: {
      state: '=',
      onTrigger: '&'
    },
    templateUrl: 'templates/kyc-status.jade',
    controller: function (buySell) {
      this.stateMap = {
        'pending': { ns: 'KYC_IN_REVIEW', i: 'ti-alert' },
        'rejected': { ns: 'KYC_REJECTED', i: 'ti-close' },
        'expired': { ns: 'KYC_EXPIRED', i: 'ti-timer' }
      };
      this.getState = () => this.stateMap[buySell.resolveState(this.state)];
    }
  });
