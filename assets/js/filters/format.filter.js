angular
  .module('walletFilters')
  .filter('format', formatFilter);

formatFilter.$inject = ['Wallet', 'currency'];
function formatFilter (Wallet, currency) {
  return function (amount, curr, showCode = false) {
    let currSetting = typeof curr === 'string'
      ? currency.getCurrencyByCode(curr)
      : (curr || Wallet.settings.currency);
    return currency.formatCurrencyForView(amount, currSetting, showCode);
  };
}
