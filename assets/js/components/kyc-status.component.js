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
        'pending': { ns: 'KYC_PENDING', i: 'ti-alert' },
        'manual_review': { ns: 'KYC_IN_REVIEW', i: 'ti-alert' },
        'declined': { ns: 'KYC_DENIED', i: 'ti-na' },
        'rejected': { ns: 'KYC_DENIED', i: 'ti-na' }
      };
      this.getState = () => this.stateMap[this.state];
    }
  });
