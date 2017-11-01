angular
  .module('walletApp')
  .component('shiftConfirm', {
    bindings: {
      fee: '<',
      quote: '<',
      wallet: '<',
      payment: '<',
      destination: '<',
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

function ShiftConfirmController (AngularHelper, $scope, Exchange, Wallet, $q, $filter, currency, Env) {
  let now = new Date();
  $scope.human = {'btc': 'Bitcoin', 'eth': 'Ether', 'bch': 'Bitcoin Cash'};

  $scope.quote = this.quote;
  $scope.cryptoCurrencyMap = currency.cryptoCurrencyMap;
  $scope.getTimeToExpiration = () => $scope.quote.expires - now;
  let from = $scope.cryptoCurrencyMap[$scope.quote.fromCurrency];

  $scope.fee = from.from(this.fee, from.currency);
  $scope.total = parseFloat($scope.quote.depositAmount) + $scope.fee;

  $scope.shift = () => {
    $scope.lock();
    let payment = this.payment;
    this.handleShift({payment})
        .then(trade => this.onComplete({trade}))
        .then(() => $scope.$root.scheduleRefresh())
        .catch((err) => Exchange.displayError(err)).then($scope.free);
  };

  AngularHelper.installLock.call($scope);
  Env.then(env => $scope.qaDebugger = env.qaDebugger);
}
