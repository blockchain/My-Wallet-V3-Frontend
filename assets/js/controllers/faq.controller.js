angular
  .module('walletApp')
  .controller('faqCtrl', faqCtrl);

function faqCtrl ($scope, Wallet, MyWallet, $timeout, $stateParams, $state, $rootScope, $uibModal, FaqQuestions) {
  $scope.items = FaqQuestions.getAll();
  $scope.toggleCurr = function (id) {
    $scope.items[id].displayed = !$scope.items[id].displayed;
  };
}
