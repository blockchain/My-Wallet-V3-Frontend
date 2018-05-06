angular
  .module('walletFilters')
  .filter('toBitCurrency', toBitCurrencyFilter);

toBitCurrencyFilter.$inject = ['currency'];
function toBitCurrencyFilter (currency) {
  return function (input, btcCurrency, hideCurrency) {
    if (input != null && !isNaN(input) && btcCurrency != null) {
      let amount = currency.convertFromSatoshi(input, btcCurrency);
      return currency.formatCurrencyForView(amount, btcCurrency, !hideCurrency);
    } else {
      return '';
    }
  };
}
