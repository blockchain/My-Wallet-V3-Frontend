angular
  .module('walletApp')
  .component('kycStatus', {
    bindings: {
      state: '<',
      limits: '<',
      onTrigger: '&'
    },
    templateUrl: 'templates/kyc-status.pug',
    controller: function (buySell) {
      this.stateMap = {
        'expired': { ns: 'KYC_EXPIRED', i: 'ti-na' },

        'pending': { ns: 'KYC_PENDING', i: 'ti-alert' },

        'manualHold': { ns: 'KYC_IN_HOLD', i: 'ti-alert' },

        'reviewing': { ns: 'KYC_IN_REVIEW', i: 'ti-alert' },
        'manual_review': { ns: 'KYC_IN_REVIEW', i: 'ti-alert' },
        'manualReviewing': { ns: 'KYC_IN_REVIEW', i: 'ti-alert' },

        'failed': { ns: 'KYC_DENIED', i: 'ti-na' },
        'declined': { ns: 'KYC_DENIED', i: 'ti-na' },
        'rejected': { ns: 'KYC_DENIED', i: 'ti-na' },
        'manualRejected': { ns: 'KYC_DENIED', i: 'ti-na' }
      };
      this.getState = () => this.stateMap[this.state];

      this.profile = buySell.getExchange().profile;
      this.level = this.profile ? +this.profile.level.name : null;

      this.getCardMax = () => {
        let symbol = this.limits.currency && this.limits.currency.symbol;
        let amt = this.limits.card && this.limits.card.max;
        return (symbol || '€') + (amt || '300.00');
      };
    }
  });
