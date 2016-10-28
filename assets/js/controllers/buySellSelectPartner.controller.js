angular
  .module('walletApp')
  .controller('BuySellSelectPartnerController', BuySellSelectPartnerController);

function BuySellSelectPartnerController ($scope, $state, country, MyWallet) {
  let base = 'wallet.common.buy-sell';

  if (MyWallet.wallet.external.coinify.user) $state.go(base + '.coinify');
  if (MyWallet.wallet.external.sfox.user) $state.go(base + '.sfox');

  $scope.country = null;
  $scope.countries = ['USA', 'Other'];

  $scope.getPartner = (country) => (
    country === 'USA'
      ? { name: 'SFOX', icon: '🐕 SFOX', route: '.sfox' }
      : { name: 'Coinify', icon: 'Coinify', route: '.coinify' }
  );

  $scope.selectPartner = (country) => {
    let partner = $scope.getPartner($scope.country);
    $state.go(base + partner.route);
  };

  if (country != null) {
    $scope.selectPartner(country);
  }
}
