angular
  .module('walletApp')
  .controller('BuySellSelectPartnerController', BuySellSelectPartnerController);

function BuySellSelectPartnerController ($scope, $state, country, MyWallet) {
  let base = 'wallet.common.buy-sell';

  if (MyWallet.wallet.external.coinify.user) $state.go(base + '.coinify');
  if (MyWallet.wallet.external.sfox.user) $state.go(base + '.sfox');

  $scope.countries = ['USA', 'Other'];

  $scope.selectPartner = (country) => {
    let isUSA = country === 'USA';
    let partner = base + (isUSA ? '.sfox' : '.coinify');
    $state.go(partner);
  };

  if (country != null) {
    $scope.selectPartner(country);
  }
}
