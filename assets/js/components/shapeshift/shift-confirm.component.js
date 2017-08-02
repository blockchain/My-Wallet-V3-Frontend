angular
  .module('walletApp')
  .component('shiftConfirm', {
    bindings: {
      fiat: '<',
      quote: '<',
      handleQuote: '&',
      handleShift: '&',
      shiftSuccess: '&',
      shiftError: '&'
    },
    templateUrl: 'templates/shapeshift/exchange.pug',
    controller: ShiftExchangeController,
    controllerAs: '$ctrl'
  });

function ShiftExchangeController (Env, AngularHelper, $scope, $timeout, $q, currency, Wallet, MyWalletHelpers, $uibModal, Exchange, Ethereum, smartAccount) {
  $scope.shift = () => {
    $scope.lock();
    let quote = $scope.quote;
    this.handleShift({quote: quote})
      .then(trade => {
        this.shiftSuccess({trade});
      })
      .catch((err) => {
        $scope.state.loadFailed = true;
        $scope.state.error = Exchange.interpretError(err);
      }).finally($scope.resetFields).finally($scope.free);
  };
}
