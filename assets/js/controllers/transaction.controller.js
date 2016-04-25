angular
  .module('walletApp')
  .controller('TransactionCtrl', TransactionCtrl);

function TransactionCtrl ($scope, $state, $stateParams, $filter, Wallet, MyWallet) {
  let txList = MyWallet.wallet.txList;
  let index = $stateParams.accountIndex;

  $scope.transaction = txList.transaction($stateParams.hash);
  $scope.transaction.toggled = false;

  let formatted = Wallet.formatTransactionCoins($scope.transaction);
  $scope.input = formatted.input;
  $scope.destinations = formatted.outputs;

  $scope.backToTransactions = () => {
    $state.go('wallet.common.transactions', { accountIndex: index });
  };
}
