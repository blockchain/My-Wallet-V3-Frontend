angular
  .module('walletApp')
  .component('kycReview', {
    bindings: {
      onTrigger: '&'
    },
    templateUrl: 'templates/kyc-review.jade'
  });
