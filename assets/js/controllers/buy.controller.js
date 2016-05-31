angular
  .module('walletApp')
  .controller('BuyCtrl', BuyCtrl);

function BuyCtrl ($scope, MyWallet, Wallet) {
  $scope.settings = Wallet.settings;

  $scope.quote = null;

  MyWallet.wallet.external.coinify.getQuote(25).then((quote) => {
    $scope.quote = quote;
  });

  $scope.buy = () => {
    MyWallet.wallet.external.coinify.buy(25).then((trade) => {
      $scope.trade = trade;
    });
  };
}
