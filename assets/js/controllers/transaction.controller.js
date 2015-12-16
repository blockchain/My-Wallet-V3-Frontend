angular
  .module('walletApp')
  .controller('TransactionCtrl', TransactionCtrl);

function TransactionCtrl($scope, $state, $stateParams, $filter, Wallet, MyWallet) {
  let txList  = MyWallet.wallet.txList;
  let index   = $stateParams.accountIndex;
  let txs     = txList.transactions(index);

  $scope.transaction = $filter('getByProperty')('hash', $stateParams.hash, txs);

  let inputs  = $scope.transaction.processedInputs;
  let input   = inputs.filter(i => !i.change)[0] || inputs[0];
  $scope.from = input.label || input.address;

  $scope.destinations = $scope.transaction.processedOutputs.filter(o => !o.change);

  $scope.getLabel = (a) => {
    let label = Wallet.getAddressBookLabel(a.address);
    return label || a.label || a.address;
  };

  $scope.back = () => {
    $state.go('wallet.common.transactions', { accountIndex: index });
  };
}
