angular
  .module('walletApp')
  .controller('CoinifyMediumController', CoinifyMediumController);

function CoinifyMediumController ($scope, Alerts, buySell) {
  $scope.$parent.medium = $scope.trade ? $scope.trade.medium : undefined;
  $scope.$parent.mediums = {};
  $scope.$parent.getMedium = () => $scope.mediums[$scope.medium] || {};
  $scope.$parent.isMedium = (medium) => $scope.getMedium().inMedium === medium;

  $scope.showNote = (medium) => {
    let isMedium = $scope.$parent.medium === medium;

    let trades = $scope.$parent.exchange.trades || [];
    let tradesOfTypeMedium = trades.filter((t) => t.medium === medium).length > 0;

    return isMedium && !tradesOfTypeMedium;
  };

  $scope.$parent.confirmOrContinue = () => {
    let skipConfirm = $scope.needsKyc();
    skipConfirm ? $scope.buy() : $scope.goTo('summary');
  };
}
