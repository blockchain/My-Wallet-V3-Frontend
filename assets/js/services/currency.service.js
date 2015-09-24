'use strict';

angular
  .module('walletServices')
  .factory('Currency', Currency);

function Currency() {

  const SATOSHI = 100000000;
  const CONVERSIONS = {};

  var service = {
    updateConversion: updateConversion,
    isBitCurrency: isBitCurrency,
    decimalPlacesForCurrency: decimalPlacesForCurrency,
    convertToSatoshi: convertToSatoshi,
    convertFromSatoshi: convertFromSatoshi,
    formatCurrencyForView: formatCurrencyForView
  };

  return service;

  //////////////////////////////////////////////////////////////////////////////

  function updateConversion(code, data) {
    CONVERSIONS[code] = data;
  }

  function isBitCurrency(currency) {
    if (currency == null) return null;
    return ['BTC', 'mBTC', 'bits'].indexOf(currency.code) > -1;
  }

  function decimalPlacesForCurrency(currency) {
    if (currency == null) return null;
    let decimalPlaces = ({ 'BTC': 8, 'mBTC': 6, 'bits': 4 })[currency.code];
    return decimalPlaces || 2;
  }

  function convertToSatoshi(amount, currency) {
    if (amount == null || currency == null) return null;
    if (isBitCurrency(currency)) {
      return Math.round(amount * currency.conversion);
    } else if (CONVERSIONS[currency.code] != null) {
      return Math.ceil(amount * CONVERSIONS[currency.code].conversion);
    } else {
      return null;
    }
  }

  function convertFromSatoshi(amount, currency) {
    if (amount == null || currency == null) return null;
    if (isBitCurrency(currency)) {
      return amount / currency.conversion;
    } else if (CONVERSIONS[currency.code] != null) {
      return amount / CONVERSIONS[currency.code].conversion;
    } else {
      return null;
    }
  }

  function formatCurrencyForView(amount, currency, showCode=true) {
    if (amount == null || currency == null) return null;
    let decimalPlaces = decimalPlacesForCurrency(currency);
    let code = showCode ? (' ' + currency.code) : '';
    return amount.toFixed(decimalPlaces) + code;
  }

}
