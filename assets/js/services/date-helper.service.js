angular
    .module('walletApp')
    .factory('DateHelper', DateHelper);

// TODO: Integrate moment.js later

function DateHelper ($filter) {
  let epochBitcoinStartDate = 1231024500000;

  // Properties
  let format = {
    shortDate: 'dd/MM/yyyy'
  };

  let bitcoinStartDate = new Date(epochBitcoinStartDate);

  let now = () => { return new Date(); };

  // Methods
  let round = (d) => {
    d = new Date(d);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  };

  let subtractDays = (d, days) => {
    d = new Date(d);
    d.setDate(d.getDate() - days);
    return d;
  };

  let toShortDate = (d) => $filter('date')(d, format.shortDate);

  let toCustomShortDate = (sep, d) => $filter('date')(d, `dd${sep}MM${sep}yyyy`);

  return {
    format: format,
    bitcoinStartDate: bitcoinStartDate,
    now: now,
    round: round,
    subtractDays: subtractDays,
    toShortDate: toShortDate,
    toCustomShortDate: toCustomShortDate
  };
}
