angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, $q, Wallet, MyWalletHelpers, Alerts, currency, modals, sfox, accounts) {
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

  $scope.inspectTrade = modals.openTradeSummary;
  $scope.signupCompleted = accounts[0] && accounts[0].status === 'active';

  $scope.account = accounts[0];
  $scope.trades = exchange.trades;
  $scope.buyLimit = exchange.profile && exchange.profile.limits.buy;
  $scope.quoteHandler = sfox.fetchQuote.bind(null, exchange);

  $scope.buyHandler = (...args) => {
    return sfox.buy($scope.account, ...args)
      .then(trade => {
        let modalInstance = modals.openTradeSummary(trade, 'initiated');
        sfox.watchTrade(trade, () => modalInstance.dismiss());
      })
      .catch(() => {
        Alerts.displayError('Error connecting to our exchange partner');
      });
  };
}
