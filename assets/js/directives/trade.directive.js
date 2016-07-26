angular
  .module('walletApp')
  .directive('trade', trade);

trade.$inject = ['$rootScope', 'Alerts', 'MyBlockchainApi', 'MyWallet'];

function trade ($rootScope, Alerts, MyBlockchainApi, MyWallet) {
  const directive = {
    restrict: 'A',
    replace: true,
    scope: {
      bitcoinReceived: '=',
      pending: '@',
      cancel: '&',
      trade: '=',
      buy: '&'
    },
    templateUrl: 'templates/trade.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.pending = attrs.pending;
    scope.status = {};
    scope.status.waiting = true;
    scope.toggle = () => scope.active = !scope.active;

    MyBlockchainApi.getBalances([scope.trade.receiveAddress]).then(function (res) {
      scope.status = {};
      let totalReceived = 0;
      if (res[scope.trade.receiveAddress]) {
        totalReceived = res[scope.trade.receiveAddress].total_received;
      }
      if (totalReceived > 0) {
        scope.totalReceived = totalReceived;
      }
    });

    scope.alertStatus = () => {
      let tx = {
        'Purchased': scope.trade.inAmount + ' ' + scope.trade.inCurrency,
        'BTC Amount': scope.trade.outAmountExpected,
        'BTC Address': scope.trade.receiveAddress,
        'Date': scope.trade.createdAt
      };

      if (scope.trade.state === 'expired' ||
          scope.trade.state === 'rejected' ||
          scope.trade.state === 'cancelled') {
        Alerts.confirm('TRANSACTION_ERROR', {action: 'TRY_AGAIN'}).then(() => {
          $rootScope.$broadcast('initBuy');
        });
      } else {
        let label = MyWallet.wallet.hdwallet.defaultAccount.label;
        Alerts.confirm('TX_SUCCESSFUL', {success: true, action: 'CLOSE', props: tx, iconClass: 'ti-check', values: {label: label}});
      }
    };
  }
}
