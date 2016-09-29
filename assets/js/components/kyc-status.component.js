angular
  .module('walletApp')
  .component('kycStatus', {
    bindings: {
      state: '<',
      limits: '<',
      onTrigger: '&'
    },
    templateUrl: 'templates/kyc-status.jade',
    controller: function (buySell) {
      this.stateMap = {
        'pending': { ns: 'KYC_PENDING', i: 'ti-alert' },
        'manual_review': { ns: 'KYC_IN_REVIEW', i: 'ti-alert' },
        'reviewing': { ns: 'KYC_IN_REVIEW', i: 'ti-alert' },
        'declined': { ns: 'KYC_DENIED', i: 'ti-na' },
        'rejected': { ns: 'KYC_DENIED', i: 'ti-na' }
      };
      this.getState = () => this.stateMap[this.state];

      this.getCardMax = () => {
        let symbol = this.limits.currency && this.limits.currency.symbol;
        let amt = this.limits.card && this.limits.card.max;
        return (symbol || '€') + (amt || '300.00');
      };
    }
  });
