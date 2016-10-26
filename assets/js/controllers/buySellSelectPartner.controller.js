angular
  .module('walletApp')
  .controller('BuySellSelectPartnerController', BuySellSelectPartnerController);

function BuySellSelectPartnerController ($scope, $state, country) {
  let base = 'wallet.common.buy-sell';

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
