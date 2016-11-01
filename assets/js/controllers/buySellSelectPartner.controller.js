angular
  .module('walletApp')
  .controller('BuySellSelectPartnerController', BuySellSelectPartnerController);

function BuySellSelectPartnerController ($scope, $state, MyWallet) {
  $scope.country = null;
  $scope.countries = ['USA', 'Other'];

  $scope.getPartner = (country) => (
    country === 'USA'
      ? { name: 'SFOX', icon: '🐕 SFOX', route: '.sfox' }
      : { name: 'Coinify', icon: 'Coinify', route: '.coinify' }
  );

  $scope.selectPartner = (country) => {
    let partner = $scope.getPartner($scope.country);
    $state.go($scope.vm.base + partner.route);
  };
}
