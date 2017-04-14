angular
  .module('walletApp')
  .component('coinifyEmail', {
    bindings: {
      email: '<',
      verified: '<',
      rejectedEmail: '<',
      onClose: '&',
      onComplete: '&'
    },
    templateUrl: 'partials/coinify/email.pug',
    controller: CoinifyEmailController
  });

function CoinifyEmailController ($q, Wallet) {
  this.state = { editing: false };
  this.toggleEditing = () => { this.state.editing = !this.state.editing; };

  this.changeEmail = (email, successCallback, errorCallback) => {
    $q(Wallet.changeEmail.bind(null, email))
      .then(successCallback, errorCallback)
      .then(() => { this.state.editing = false; });
  };

  this.$onInit = () => {
    if (!Wallet.goal.firstLogin && !this.rejectedEmail) Wallet.resendEmailConfirmation();
    this.state.editing = Boolean(this.rejectedEmail);
  };

  this.$onChanges = (changes) => {
    let { verified } = changes;
    if (verified && verified.currentValue && !this.rejectedEmail) this.onComplete();
  };
}
