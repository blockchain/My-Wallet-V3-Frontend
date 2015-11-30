'use strict';

angular
  .module('walletFilters', [])
  .filter('toBitCurrency', toBitCurrencyFilter)
  .filter('btc', btcFilter)
  .filter('convert', convertFilter)
  .filter('getByProperty', getByPropertyFilter)
  .filter('getByPropertyNested', getByPropertyNestedFilter)
  .filter('addressOrNameMatch', addressOrNameMatchFilter);

function toBitCurrencyFilter() {
  return function (input, btcCurrency, hideCurrency) {
    if (input != null && !isNaN(input) && btcCurrency != null && btcCurrency.code != null && btcCurrency.conversion != null) {
      let format = '0.[' + btcCurrency.conversion.toString().substr(1) + ']';
      return numeral(input).divide(btcCurrency.conversion).format(format) + (hideCurrency ? '' : ' ' + btcCurrency.code);
    } else {
      return '';
    }
  };
}

function btcFilter() {
  return function (input, hideCurrency) {
    if (input != null && !isNaN(input)) {
      return numeral(input).divide(100000000).format('0.[00000000]') + (hideCurrency ? '' : ' BTC');
    } else {
      return '';
    }
  };
}

convertFilter.$inject = ['Wallet'];
function convertFilter(Wallet) {
  return function (amount) {
    let currency = Wallet.settings.displayCurrency;
    let conversion = Wallet.convertFromSatoshi(amount, currency);
    return Wallet.formatCurrencyForView(conversion, currency);
  };
}

function getByPropertyFilter() {
  return function (propertyName, propertyValue, collection) {
    let i = 0;
    let len = collection.length;
    while (i < len) {
      if (collection[i][propertyName] === propertyValue) {
        return collection[i];
      }
      i++;
    }
    return null;
  };
}

function getByPropertyNestedFilter() {
  return function(propertyName, propertyValue, collection) {
    let i = 0;
    let len = collection.length;
    while (i < len) {
      let subCollection = collection[i][propertyName];
      let j = 0;
      let len2 = subCollection.length;
      while (j < len2) {
        if (collection[i][propertyName][j] === propertyValue) {
          return collection[i];
        }
        j++;
      }
      i++;
    }
    return null;
  };
}

function addressOrNameMatchFilter() {
  return function (addresses, q) {
    if (q == null || q === '') return addresses;
    q = q.toLowerCase();
    return addresses.filter(function (addr) {
      let keep;
      keep = addr.account != null && addr.account.label.toLowerCase().indexOf(q) > -1;
      keep = keep || (addr.label != null) && addr.label.toLowerCase().indexOf(q) > -1;
      keep = keep || addr.address.toLowerCase().indexOf(q) > -1;
      return keep;
    });
  };
}
