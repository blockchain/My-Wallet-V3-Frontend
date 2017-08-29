angular
  .module('walletApp')
  .controller('BitcoinCashSendController', BitcoinCashSendController);

function BitcoinCashSendController ($scope) {
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  $scope.state = {
    destination: null
  };

  $scope.steps = enumify('send-cash', 'send-address', 'send-confirm');
  $scope.onStep = (s) => $scope.steps[s] === $scope.step;
  $scope.goTo = (s) => $scope.step = $scope.steps[s];

  $scope.goTo('send-cash');
  $scope.onAddressChange = (addr) => $scope.state.destination = addr;
}
