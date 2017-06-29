angular
  .module('walletApp')
  .controller('BuySellMasterController', BuySellMasterController);

function BuySellMasterController ($scope, $timeout, $state, MyWallet, cta) {
  cta.setBuyCtaDismissed();

  this.base = 'wallet.common.buy-sell';
  this.external = MyWallet.wallet.external;

  this.resolveState = () => {
    if (this.external.coinify.user) {
      return '.coinify';
    } if (this.external.sfox.user) {
      return '.sfox';
    } if (this.external.unocoin.user) {
      return '.unocoin';
    } else {
      return '.select';
    }
  };

  this.toNextState = () => {
    let nextState = this.resolveState();
    $state.go(nextState);
  };

  let state = $scope.state = {
    loading: false,
    error: false,
    get transitioning () { return this.loading || this.error; }
  };

  $scope.$on('$stateChangeStart', (event, toState, toParams, fromState) => {
    if (fromState.name === this.base) {
      state.error = false;
      state.loading = true;
    }
    if (toState.name === this.base) {
      $timeout(this.toNextState);
    }
  });

  $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState) => {
    if (fromState.name === this.base) {
      state.loading = false;
    }
  });

  $scope.$on('$stateChangeError', (event, toState, toParams, fromState) => {
    if (fromState.name === this.base) {
      state.error = true;
      state.loading = false;
    }
  });

  this.toNextState();
}
