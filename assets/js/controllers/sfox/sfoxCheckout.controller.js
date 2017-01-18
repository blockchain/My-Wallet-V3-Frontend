angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Alerts, currency, modals, sfox, accounts) {
  let exchange = $scope.vm.external.sfox;

  $scope.openSfoxSignup = () => {
    $scope.modalOpen = true;
    modals.openSfoxSignup(exchange).finally(() => { $scope.modalOpen = false; });
  };

  $scope.stepDescription = () => {
    let stepDescriptions = {
      'verify': { text: 'Verify Identity', i: 'ti-id-badge' },
      'link': { text: 'Link Payment', i: 'ti-credit-card bank bank-lrg' }
    };
    let step = sfox.determineStep(exchange, accounts);
    return stepDescriptions[step];
  };

  $scope.siftScienceEnabled = false;
  $scope.userId = exchange.user;

  $scope.inspectTrade = modals.openTradeSummary;
  $scope.signupCompleted = accounts[0] && accounts[0].status === 'active';

  $scope.tabs = ['BUY_BITCOIN', /* 'SELL_BITCOIN', */ 'ORDER_HISTORY'];
  $scope.selectedTab = $scope.signupCompleted ? $stateParams.selectedTab || 'BUY_BITCOIN' : null;

  $scope.selectTab = (tab) => {
    $scope.selectedTab = $scope.selectedTab ? tab : null;
  };

  $scope.moveTab = (offset) => (event) => {
    let nextTab = $scope.tabs[$scope.tabs.indexOf($scope.selectedTab) + offset];
    if (nextTab) $scope.selectTab(nextTab);
  };

  $scope.account = accounts[0];
  $scope.trades = exchange.trades;
  $scope.buyLimit = exchange.profile && exchange.profile.limits.buy;
  $scope.quoteHandler = sfox.fetchQuote.bind(null, exchange);

  $scope.buyHandler = (...args) => {
    return sfox.buy($scope.account, ...args)
      .then(trade => {
        // Send SFOX user identifier and trade id to Sift Science, inside an iframe:
        $scope.siftScienceEnabled = true;
        $scope.tradeId = trade.id;
        $scope.selectTab('ORDER_HISTORY');
        let modalInstance = modals.openTradeSummary(trade, 'initiated');
        sfox.watchTrade(trade, () => modalInstance.dismiss());
      })
      .catch(() => {
        Alerts.displayError('Error connecting to our exchange partner');
      });
  };
}
