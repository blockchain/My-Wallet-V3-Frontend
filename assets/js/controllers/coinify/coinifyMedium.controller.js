angular
  .module('walletApp')
  .controller('CoinifyMediumController', CoinifyMediumController);

function CoinifyMediumController ($scope, Alerts, buySell) {
  $scope.$parent.medium = $scope.trade ? $scope.trade.medium : undefined;
  $scope.$parent.mediums = {};
  $scope.$parent.getMedium = () => $scope.mediums[$scope.medium] || {};
  $scope.$parent.isMedium = (medium) => $scope.getMedium().inMedium === medium;

  $scope.$parent.confirmOrContinue = () => {
    let skipConfirm = $scope.needsKyc();
    skipConfirm ? $scope.buy() : $scope.goTo('summary');
  };
}
