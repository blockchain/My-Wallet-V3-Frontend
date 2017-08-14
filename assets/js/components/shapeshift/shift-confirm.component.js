angular
  .module('walletApp')
  .component('shiftConfirm', {
    bindings: {
      fee: '<',
      quote: '<',
      payment: '<',
      onCancel: '&',
      onComplete: '&',
      handleShift: '&'
    },
    templateUrl: 'templates/shapeshift/confirm.pug',
    controller: ShiftConfirmController,
    controllerAs: '$ctrl'
  });

function ShiftConfirmController (AngularHelper, $scope, Exchange, Wallet, Ethereum, $q, $filter, currency) {
  let now = new Date();

  $scope.fee = this.fee;
  $scope.quote = this.quote;
  $scope.total = parseFloat($scope.quote.depositAmount) + parseFloat($filter('convert')(this.fee, $scope.quote.fromCurrency, false));

  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.bitcoin = $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.from = $scope.quote.fromCurrency === 'btc' ? Wallet.getDefaultAccount() : Ethereum.defaultAccount;
  $scope.to = $scope.quote.toCurrency === 'btc' ? Wallet.getDefaultAccount() : Ethereum.defaultAccount;

  $scope.onExpiration = () => $scope.lock();
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
}
