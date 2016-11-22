angular
  .module('walletApp')
  .controller('BuySellSelectPartnerController', BuySellSelectPartnerController);

function BuySellSelectPartnerController ($scope, $state, MyWallet, country) {
  $scope.country = null;
  $scope.countries = country.countryCodes;
  $scope.sfoxCountries = ['US'];

  $scope.getPartner = (country) => (
    $scope.sfoxCountries.indexOf(country.Code) > -1
      ? { name: 'SFOX', logo: 'img/sfox-logo.png', href: 'https://www.sfox.com/', route: '.sfox' }
      : { name: 'Coinify', logo: 'img/coinify-logo.svg', href: 'https://www.coinify.com/', route: '.coinify' }
  );

  $scope.selectPartner = (partner) => {
    $state.go($scope.vm.base + partner.route);
  };

  $scope.$watch('country', (c) => { $scope.partner = $scope.getPartner(c); });
}
