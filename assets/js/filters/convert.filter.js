angular
  .module('walletFilters')
  .filter('convert', convertFilter);

convertFilter.$inject = ['Wallet', 'currency'];
function convertFilter (Wallet, currency) {
  let caseof = (condition, casemap) => {
    let result = casemap[condition] || casemap[undefined];
    if (result instanceof Error) throw result;
    else return result;
  };

  // target => { 'primary' | 'secondary' | 'btc' | 'fiat' | currency }
  return function (amount, target = 'primary', showCode, test) {
    let fiat = Wallet.settings.currency;
    let eth = currency.ethCurrencies[0];
    let btc = Wallet.settings.btcCurrency;
    let display = Wallet.settings.displayCurrency;
    let curr, conversion;

    if (typeof target === 'string') {
      curr = caseof(target, {
        'primary': display,
        'secondary': currency.isBitCurrency(display) ? fiat : btc,
        'btc': btc,
        'eth': eth,
        'fiat': fiat
      });
    } else if (target.code) {
      curr = target;
    } else {
      curr = display;
    }

    if (currency.isEthCurrency(curr)) conversion = currency.convertFromEther(amount, curr);
    else conversion = currency.convertFromSatoshi(amount, curr);
    return currency.formatCurrencyForView(conversion, curr, showCode);
  };
}
