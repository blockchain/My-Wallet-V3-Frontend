angular
  .module('walletApp')
  .component('shiftConfirm', {
    bindings: {
      fee: '<',
      quote: '<',
      payment: '<',
      onCancel: '&',
      onExpire: '&',
      onComplete: '&',
      handleShift: '&'
    },
    templateUrl: 'templates/shapeshift/confirm.pug',
    controller: ShiftConfirmController,
    controllerAs: '$ctrl'
  });

function ShiftConfirmController (AngularHelper, $scope, Exchange, Wallet, Ethereum, $q, $filter, currency, Env) {
  let now = new Date();

  $scope.fee = this.fee;
  $scope.quote = this.quote;
  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.ether = currency.ethCurrencies.filter(c => c.code === 'ETH')[0];
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.from = $scope.quote.fromCurrency === 'btc' ? Wallet.getDefaultAccount() : Ethereum.defaultAccount;
  $scope.to = $scope.quote.toCurrency === 'btc' ? Wallet.getDefaultAccount() : Ethereum.defaultAccount;
  $scope.fromCurrency = $scope.quote.fromCurrency === 'btc' ? $scope.bitcoin : $scope.ether;
  $scope.total = parseFloat($scope.quote.depositAmount) + parseFloat($filter('convert')(this.fee, $scope.fromCurrency, false));
  $scope.onExpiration = () => { this.onExpire(); $scope.lock(); };
  $scope.getTimeToExpiration = () => $scope.quote.expires - now;

  $scope.human = {'btc': 'Bitcoin', 'eth': 'Ether'};

  $scope.shift = () => {
    $scope.lock();
    let payment = this.payment;
    this.handleShift({payment})
        .then(trade => this.onComplete({trade}))
        .catch(() => {}).finally($scope.free);
  };

  AngularHelper.installLock.call($scope);
  Env.then(env => $scope.buySellDebug = env.buySellDebug);
}
