angular
  .module('walletApp')
  .component('coinifySignup', {
    bindings: {
      email: '<',
      validEmail: '<',
      onClose: '&',
      onError: '&',
      onComplete: '&',
      onEmailChange: '&',
      fiatCurrency: '&'
    },
    templateUrl: 'partials/coinify/signup.pug',
    controller: CoinifySignupController
  });

function CoinifySignupController ($q, $stateParams, Wallet, buySell, AngularHelper) {
  let exchange = buySell.getExchange();

  let tryParse = (json) => {
    try { return JSON.parse(json); } catch (e) { return json; }
  };

  this.signup = () => {
    this.lock();
    return $q.resolve(exchange.signup($stateParams.countryCode, this.fiatCurrency()))
             .then(this.onComplete)
             .catch((err) => {
               err = tryParse(err);
               if (err.error && err.error.toUpperCase() === 'EMAIL_ADDRESS_IN_USE') {
                 this.onEmailChange();
               }
             });
  };

  AngularHelper.installLock.call(this);
}
