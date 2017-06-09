angular
  .module('walletApp')
  .controller('BuySellSelectPartnerController', BuySellSelectPartnerController);

function BuySellSelectPartnerController ($scope, $state, $timeout, Wallet, MyWallet, buySell, country, state, buyStatus, modals, Env) {
  buyStatus.canBuy().then((canBuy) => {
    if (!canBuy) {
      $state.go('wallet.common.home');
      if ($scope.inMobileBuy) {
        $timeout(() => modals.openFullScreen('partials/buy-subscribe-modal.pug', 'SubscribeCtrl'));
      }
    }
  });

  let contains = (val, list) => list.indexOf(val) > -1;
  let codeGuess = MyWallet.wallet.accountInfo && MyWallet.wallet.accountInfo.countryCodeGuess;

  $scope.states = state.stateCodes;
  $scope.state = $scope.states[0];

  $scope.countries = country.countryCodes;
  $scope.country = $scope.countries.filter(c => c.Code === codeGuess)[0];

  Env.then(env => {
    $scope.coinifyWhitelist = env.partners.coinify.countries;
    $scope.sfoxWhitelist = env.partners.sfox.countries;
    $scope.sfoxStateWhitelist = env.partners.sfox.states;
  });

  $scope.email = Wallet.user.email;

  $scope.partners = {
    'coinify': {
      name: 'Coinify',
      logo: 'img/coinify-logo.svg',
      href: 'https://www.coinify.com/',
      subtext: 'COINIFY_EXPLAIN',
      route: '.coinify'
    },
    'sfox': {
      name: 'SFOX',
      logo: 'img/sfox-logo.png',
      href: 'https://www.sfox.com/',
      subtext: 'SFOX_EXPLAIN',
      route: '.sfox'
    }
  };

  $scope.signupForAccess = () => {
    let email = encodeURIComponent($scope.email);
    let country = $scope.country.Name;
    let state = $scope.country.Code === 'US' ? $scope.state.Name : undefined;

    buySell.signupForAccess(email, country, state);
  };

  $scope.selectPartner = (partner, countryCode) => {
    $state.go($scope.vm.base + partner.route, { countryCode });
  };

  $scope.onWhitelist = (countryCode) => (
    (contains(countryCode, $scope.coinifyWhitelist) && 'coinify') ||
    (contains(countryCode, $scope.sfoxWhitelist) && codeGuess === 'US' && 'sfox') || false
  );

  $scope.onStateWhitelist = (stateCode) => (
    contains(stateCode, $scope.sfoxStateWhitelist) && 'sfox' || false
  );

  $scope.tabs = {
    options: $scope.$root.inMobileBuy || !$scope.canSeeSellTab
      ? ['BUY_BITCOIN', 'ORDER_HISTORY']
      : ['BUY_BITCOIN', 'SELL_BITCOIN', 'ORDER_HISTORY']
  };

  $scope.$watchGroup(['country', 'state'], (newValues) => {
    let country = newValues[0];
    let state = newValues[1];

    if (!country) { // This should normally not happen
      $scope.blacklisted = true;
      return;
    }

    let whitelisted;

    if (country.Code === 'US') {
      whitelisted = $scope.onWhitelist(country.Code) && state && $scope.onStateWhitelist(state.Code);
    } else {
      whitelisted = $scope.onWhitelist(country.Code);
    }
    $scope.blacklisted = !whitelisted;
    $scope.partner = whitelisted ? $scope.partners[whitelisted] : null;
  });
}
