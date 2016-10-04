angular
  .module('walletApp')
  .controller('faqCtrl', faqCtrl);

function faqCtrl ($scope, Wallet, MyWallet, $timeout, $stateParams, $state, $rootScope, $uibModal, FaqQuestions) {
  $scope.items = FaqQuestions.questions;
  $scope.toggle = (item) => { item.displayed = !item.displayed; };
}
