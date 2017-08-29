angular
  .module('walletApp')
  .controller('BitcoinCashSendController', BitcoinCashSendController);

function BitcoinCashSendController ($scope) {
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  $scope.transaction = {
    destination: null,
    amount: null,
    fee: null
  };

  $scope.steps = enumify('send-cash', 'send-address', 'send-confirm');
  $scope.onStep = (s) => $scope.steps[s] === $scope.step;
  $scope.goTo = (s) => $scope.step = $scope.steps[s];

  $scope.goTo('send-cash');
  $scope.onAddressChange = (addr) => $scope.transaction.destination = addr;
  $scope.getTransactionTotal = (includeFee) => {
    let tx = $scope.transaction;
    let fee = includeFee ? tx.fee : 0;
    return parseInt(tx.amount, 10) + parseInt(fee, 10);
  };
  $scope.send = () => {
    console.log('send', $scope.transaction);
  };
}
