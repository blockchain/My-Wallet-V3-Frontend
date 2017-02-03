angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Alerts, currency, modals, sfox, accounts, $rootScope) {
  let exchange = $scope.vm.external.sfox;

  $scope.openSfoxSignup = () => {
    $scope.modalOpen = true;
    modals.openSfoxSignup(exchange).finally(() => { $scope.modalOpen = false; });
  };

  $scope.state = {
    account: accounts[0],
    trades: exchange.trades,
    buyLimit: exchange.profile && exchange.profile.limits.buy,
    buyLevel: exchange.profile && exchange.profile.verificationStatus.level
  };

  $scope.setState = () => {
    $scope.state.trades = exchange.trades;
    $scope.state.buyLimit = exchange.profile && exchange.profile.limits.buy;
    $scope.state.buyLevel = exchange.profile && exchange.profile.verificationStatus.level;
  };

  $scope.stepDescription = () => {
    let stepDescriptions = {
      'verify': { text: 'Verify Identity', i: 'ti-id-badge' },
      'link': { text: 'Link Payment', i: 'ti-credit-card bank bank-lrg' }
    };
    let step = sfox.determineStep(exchange, accounts);
    return stepDescriptions[step];
  };

  $scope.userId = exchange.user;

  $scope.inspectTrade = modals.openTradeSummary;
  $scope.signupCompleted = accounts[0] && accounts[0].status === 'active';

  $scope.tabs = ['BUY_BITCOIN', /* 'SELL_BITCOIN', */ 'ORDER_HISTORY'];
  $scope.selectedTab = $stateParams.selectedTab || 'BUY_BITCOIN';

  $scope.selectTab = (tab) => {
    $scope.selectedTab = $scope.selectedTab ? tab : null;
  };

  $scope.moveTab = (offset) => (event) => {
    let nextTab = $scope.tabs[$scope.tabs.indexOf($scope.selectedTab) + offset];
    if (nextTab) $scope.selectTab(nextTab);
  };

  $scope.account = accounts[0];
  $scope.trades = exchange.trades;
  $scope.quoteHandler = sfox.fetchQuote.bind(null, exchange);

  $scope.buySuccess = (trade) => {
    $scope.selectTab('ORDER_HISTORY');
    modals.openTradeSummary(trade, 'initiated');
    exchange.fetchProfile().then($scope.setState);
  };

  $scope.buyFailure = () => {
    Alerts.displayError('Error connecting to our exchange partner');
  };
}
