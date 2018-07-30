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
  return function (amount, target = 'primary', showCode, coin) {
    if (coin) coin = coin.toLowerCase();
    let fiatTarget = target === 'fiat';
    let fiat = Wallet.settings.currency;
    let eth = currency.ethCurrencies[0];
    let bch = currency.bchCurrencies[0];
    let btc = Wallet.settings.btcCurrency;
    let display = Wallet.settings.displayCurrency;
    let curr, conversion;

    if (typeof target === 'string') {
      curr = caseof(target.toLowerCase(), {
        'primary': display,
        'secondary': currency.isBitCurrency(display) ? fiat : btc,
        'btc': btc,
        'eth': eth,
        'bch': bch,
        'fiat': fiat
      });
    } else if (target.code) {
      curr = target;
    } else {
      curr = display;
    }
    if (currency.isEthCurrency(curr) || (fiatTarget && coin === 'eth')) conversion = currency.convertFromEther(amount, curr);
    else if (currency.isBchCurrency(curr) || (fiatTarget && coin === 'bch')) conversion = currency.convertFromBitcoinCash(amount, curr);
    else conversion = currency.convertFromSatoshi(amount, curr);
    return currency.formatCurrencyForView(conversion, curr, showCode);
  };
}
