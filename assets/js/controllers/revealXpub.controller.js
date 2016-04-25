angular
  .module('walletApp')
  .controller('RevealXpubCtrl', RevealXpubCtrl);

function RevealXpubCtrl ($scope, Wallet, $uibModalInstance, account) {
  $scope.accounts = Wallet.accounts;
  $scope.xpub = account.extendedPublicKey;
  $scope.showXpub = false;

  $scope.continue = () => {
    $scope.showXpub = true;
  };

  $scope.close = () => {
    $uibModalInstance.dismiss('');
  };
}
