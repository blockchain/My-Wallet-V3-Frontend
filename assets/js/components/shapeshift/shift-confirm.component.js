angular
  .module('walletApp')
  .component('shiftConfirm', {
    bindings: {
      fee: '<',
      quote: '<',
      onCancel: '&',
      onComplete: '&',
      handleShift: '&'
    },
    templateUrl: 'templates/shapeshift/confirm.pug',
    controller: ShiftConfirmController,
    controllerAs: '$ctrl'
  });

function ShiftConfirmController (AngularHelper, $scope, Exchange, Wallet, Ethereum) {
  $scope.fee = this.fee;
  $scope.quote = this.quote;
  $scope.human = {'btc': 'Bitcoin', 'eth': 'Ether'};

  $scope.input = this.quote.pair.split('_')[0];
  $scope.output = this.quote.pair.split('_')[1];
  $scope.from = $scope.input === 'btc' ? Wallet.getDefaultAccount() : Ethereum.defaultAccount;
  $scope.to = $scope.output === 'btc' ? Wallet.getDefaultAccount() : Ethereum.defaultAccount;

  $scope.shift = () => {
    $scope.lock();
    let quote = $scope.quote;
    this.handleShift({quote: quote})
      .then(trade => {
        this.onComplete({trade});
      })
      .catch((err) => {
        $scope.state.loadFailed = true;
        $scope.state.error = Exchange.interpretError(err);
      }).finally($scope.resetFields).finally($scope.free);
  };

  AngularHelper.installLock.call($scope);
}
