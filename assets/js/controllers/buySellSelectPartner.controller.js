angular
  .module('walletApp')
  .controller('BuySellSelectPartnerController', BuySellSelectPartnerController);

function BuySellSelectPartnerController ($scope, $state, MyWallet, buySell, country, options) {
  let contains = (val, list) => list.indexOf(val) > -1;
  let codeGuess = MyWallet.wallet.accountInfo && MyWallet.wallet.accountInfo.countryCodeGuess;

  $scope.countries = country.countryCodes;
  $scope.country = $scope.countries.filter(c => c.Code === codeGuess)[0];

  $scope.coinifyWhitelist = options.partners.coinify.countries;
  $scope.sfoxWhitelist = ['US'];

  $scope.partners = {
    'coinify': {
      name: 'Coinify',
      logo: 'img/coinify-logo.svg',
      href: 'https://www.coinify.com/',
      route: '.coinify'
    },
    'sfox': {
      name: 'SFOX',
      logo: 'img/sfox-logo.png',
      href: 'https://www.sfox.com/',
      route: '.sfox'
    }
  };

  $scope.selectPartner = (partner, countryCode) => {
    $state.go($scope.vm.base + partner.route, { countryCode });
  };

  $scope.onWhitelist = (countryCode) => (
    (contains(countryCode, $scope.coinifyWhitelist) && 'coinify') ||
    (contains(countryCode, $scope.sfoxWhitelist) && 'sfox') || false
  );

  $scope.$watch('country', (c) => {
    let whitelisted = $scope.onWhitelist(c.Code);
    $scope.partner = whitelisted ? $scope.partners[whitelisted] : null;
  });
}
