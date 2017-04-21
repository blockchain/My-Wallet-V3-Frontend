angular
  .module('walletFilters')
  .filter('format', formatFilter);

formatFilter.$inject = ['Wallet', 'currency'];
function formatFilter (Wallet, currency) {
  return function (amount) {
    let fiatSettings = Wallet.settings.currency;

    return currency.formatCurrencyForView(amount, fiatSettings, false);
  };
}
