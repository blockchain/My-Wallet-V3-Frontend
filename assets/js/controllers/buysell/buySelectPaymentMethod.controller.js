angular
  .module('walletApp')
  .controller('BuySelectPaymentMethodCtrl', BuySelectPaymentMethodCtrl);

function BuySelectPaymentMethodCtrl ($scope, Alerts, buySell) {
  $scope.$parent.method = $scope.trade ? $scope.trade.medium : 'card';
  $scope.$parent.methods = {};

  $scope.$parent.getMethod = () => $scope.methods[$scope.method] || {};
  $scope.$parent.isMedium = (medium) => $scope.getMethod().inMedium === medium;

  $scope.$parent.confirmOrContinue = () => {
    let bankBuyMax = $scope.exchange.profile.currentLimits.bank.inRemaining;
    let belowBuyLimit = $scope.transaction.fiat <= bankBuyMax;
    let skipConfirm = $scope.needsKyc() || (belowBuyLimit && $scope.isMedium('bank'));
    skipConfirm ? $scope.buy() : $scope.goTo('summary');
  };
}
