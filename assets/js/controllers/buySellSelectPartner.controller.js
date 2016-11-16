angular
  .module('walletApp')
  .controller('BuySellSelectPartnerController', BuySellSelectPartnerController);

function BuySellSelectPartnerController ($scope, $state, MyWallet, country) {
  $scope.country = null;
  $scope.countries = country.countryCodes;
  $scope.sfoxCountries = ['US'];

  $scope.getPartner = (country) => (
    $scope.sfoxCountries.indexOf(country.Code) > -1
      ? { name: 'SFOX', icon: '🐕 SFOX', route: '.sfox' }
      : { name: 'Coinify', icon: 'Coinify', route: '.coinify' }
  );

  $scope.selectPartner = (country) => {
    let partner = $scope.getPartner($scope.country);
    $state.go($scope.vm.base + partner.route);
  };
}
