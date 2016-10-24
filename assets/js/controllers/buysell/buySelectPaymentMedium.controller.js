angular
  .module('walletApp')
  .controller('BuySelectPaymentMediumCtrl', BuySelectPaymentMediumCtrl);

function BuySelectPaymentMediumCtrl ($scope, Alerts, buySell) {
  $scope.$parent.medium = $scope.trade ? $scope.trade.medium : undefined;
  $scope.$parent.mediums = {};

  $scope.$parent.getMedium = () => $scope.mediums[$scope.medium] || {};
  $scope.$parent.isMedium = (medium) => $scope.getMedium().inMedium === medium;

  $scope.$parent.confirmOrContinue = () => {
    let bankBuyMax = $scope.exchange.profile.currentLimits.bank.inRemaining;
    let belowBuyLimit = $scope.transaction.fiat <= bankBuyMax;
    let skipConfirm = $scope.needsKyc() || (belowBuyLimit && $scope.isMedium('bank'));
    skipConfirm ? $scope.buy() : $scope.goTo('summary');
  };
}
