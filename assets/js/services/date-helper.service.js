angular
    .module('walletApp')
    .factory('DateHelper', DateHelper);

// TODO: Integrate moment.js later

function DateHelper ($filter) {
  // Properties
  let bitcoinStartDate = new Date(1231024500000); // Jan 3, 2009
  let bitcoinCashStartDate = new Date(1501628400000); // Aug 1, 2017
  let format = {
    shortDate: 'dd/MM/yyyy'
  };

  // Methods
  let now = () => { return new Date(); };
  let toShortDate = (d) => $filter('date')(d, format.shortDate);
  let toCustomShortDate = (sep, d) => $filter('date')(d, `dd${sep}MM${sep}yyyy`);

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

  return {
    format: format,
    bitcoinStartDate: bitcoinStartDate,
    bitcoinCashStartDate: bitcoinCashStartDate,
    now: now,
    round: round,
    subtractDays: subtractDays,
    toShortDate: toShortDate,
    toCustomShortDate: toCustomShortDate
  };
}
