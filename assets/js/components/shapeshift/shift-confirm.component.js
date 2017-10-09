angular
  .module('walletApp')
  .component('shiftConfirm', {
    bindings: {
      fee: '<',
      quote: '<',
      payment: '<',
      wallet: '<',
      onCancel: '&',
      onComplete: '&',
      handleShift: '&',
      onExpiring: '&',
      onExpiration: '&'
    },
    templateUrl: 'templates/shapeshift/confirm.pug',
    controller: ShiftConfirmController,
    controllerAs: '$ctrl'
  });

function ShiftConfirmController (AngularHelper, $scope, Exchange, Wallet, Ethereum, $q, $filter, currency, Env) {
  let now = new Date();

  $scope.assign = (c) => {
    switch (c) {
      case 'btc':
        return Wallet.getDefaultAccount();
      case 'eth':
        return Ethereum.defaultAccount;
      case 'bch':
        return this.wallet;
    }
  };

  $scope.fee = this.fee;
  $scope.quote = this.quote;
  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.ether = currency.ethCurrencies.filter(c => c.code === 'ETH')[0];
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.bitcoinCash = currency.bchCurrencies.filter(c => c.code === 'BCH')[0];
  $scope.from = $scope.assign($scope.quote.fromCurrency);
  $scope.to = $scope.assign($scope.quote.toCurrency);
  $scope.fromCurrency = $scope.quote.fromCurrency === 'btc' ? $scope.bitcoin : $scope.quote.fromCurrency === 'eth' ? $scope.ether : $scope.bitcoinCash;

  $scope.total = parseFloat($scope.quote.depositAmount) + parseFloat($filter('convert')(this.fee, $scope.fromCurrency, false));
  $scope.getTimeToExpiration = () => $scope.quote.expires - now;

  $scope.human = {'btc': 'Bitcoin', 'eth': 'Ether', 'bch': 'Bitcoin Cash'};

  $scope.shift = () => {
    $scope.lock();
    let payment = this.payment;
    this.handleShift({payment})
        .then(trade => this.onComplete({trade}))
        .then(() => $scope.$root.scheduleRefresh())
        .catch(() => {}).finally($scope.free);
  };

  AngularHelper.installLock.call($scope);
  Env.then(env => $scope.qaDebugger = env.qaDebugger);
}
