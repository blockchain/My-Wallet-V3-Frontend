angular
  .module('walletApp')
  .controller('TransactionCtrl', TransactionCtrl);

function TransactionCtrl ($scope, $state, $stateParams, $filter, Wallet, MyWallet) {
  let txList;
  MyWallet.then((myWallet) => {
    txList = myWallet.wallet.txList;
    $scope.transaction = txList.transaction($stateParams.hash);
    let formatted = Wallet.formatTransactionCoins($scope.transaction);
    $scope.input = formatted.input;
    $scope.destinations = formatted.outputs;
    $scope.transaction.toggled = false;
  });

  let index = $stateParams.accountIndex;

  $scope.backToTransactions = () => {
    $state.go('wallet.common.transactions', { accountIndex: index });
  };
}
