angular
  .module('walletApp')
  .component('shiftConfirm', {
    bindings: {
      fiat: '<',
      quote: '<',
      handleShift: '&',
      shiftSuccess: '&'
    },
    templateUrl: 'templates/shapeshift/confirm.pug',
    controller: ShiftConfirmController,
    controllerAs: '$ctrl'
  });

function ShiftConfirmController (AngularHelper, $scope, Exchange, Wallet, Ethereum) {
  $scope.quote = this.quote;
  $scope.human = {'BTC': 'Bitcoin', 'ETH': 'Ether'};
  console.log(this.quote);

  $scope.input = this.quote.pair.split('_')[0].toUpperCase();
  $scope.output = this.quote.pair.split('_')[1].toUpperCase();
  $scope.from = $scope.input === 'BTC' ? Wallet.getDefaultAccount() : Ethereum.defaultAccount;
  $scope.to = $scope.output === 'BTC' ? Wallet.getDefaultAccount() : Ethereum.defaultAccount;

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

  AngularHelper.installLock.call($scope);
}
