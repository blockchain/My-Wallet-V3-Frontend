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
  return function (amount, target = 'primary', showCode) {
    let fiat = Wallet.settings.currency;
    let btc = Wallet.settings.btcCurrency;
    let display = Wallet.settings.displayCurrency;
    let curr;

    if (typeof target === 'string') {
      curr = caseof(target, {
        'primary': display,
        'secondary': currency.isBitCurrency(display) ? fiat : btc,
        'btc': btc,
        'fiat': fiat
      });
    } else if (target.code) {
      curr = target;
    } else {
      curr = display;
    }

    let conversion = currency.convertFromSatoshi(amount, curr);
    return currency.formatCurrencyForView(conversion, curr, showCode);
  };
}
