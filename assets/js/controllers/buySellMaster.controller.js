angular
  .module('walletApp')
  .controller('BuySellMasterController', BuySellMasterController);

function BuySellMasterController ($scope, $timeout, $state, MyWallet) {
  this.base = 'wallet.common.buy-sell';
  this.external = MyWallet.wallet.external;

  this.resolveState = () => {
    if (this.external.coinify.user) {
      return '.coinify';
    } if (this.external.sfox.user) {
      return '.sfox';
    } else {
      return '.select';
    }
  };

  this.toNextState = () => {
    let nextState = this.resolveState();
    $state.go(nextState);
  };

  $scope.$on('$stateChangeStart', (event, toState) => {
    if (toState.name === this.base) {
      $timeout(this.toNextState);
    }
  });

  this.toNextState();
}
