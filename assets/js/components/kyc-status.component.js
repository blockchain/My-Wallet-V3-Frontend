angular
  .module('walletApp')
  .component('kycStatus', {
    bindings: {
      kyc: '<',
      currency: '<',
      onTrigger: '&'
    },
    templateUrl: 'templates/kyc-status.pug',
    controller: function (coinify) {
      this.stateMap = {
        'pending': { ns: 'KYC_PENDING', i: 'ti-alert' },
        'updateRequested': { ns: 'KYC_UPDATES_REQUESTED', i: 'ti-alert' },
        'reviewing': { ns: 'KYC_IN_REVIEW', i: 'ti-alert' },
        'rejected': { ns: 'KYC_REJECTED', i: 'ti-na' }
      };

      this.getState = () => this.stateMap[this.kyc.state];

      this.profile = coinify.exchange.profile;
      this.level = this.profile ? +this.profile.level.name : null;

      this.getCardMax = () => {
        if (coinify.limits.card.inRemaining) return this.currency && coinify.limits.card.inRemaining[this.currency] + ' ' + this.currency;
      };
    }
  });
