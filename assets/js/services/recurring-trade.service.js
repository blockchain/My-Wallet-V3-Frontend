angular
  .module('walletApp')
  .factory('recurringTrade', RecurringTradeService);

function RecurringTradeService () {
  const service = {};
  
  let human = { 1: 'st', 2: 'nd', 3: 'rd', 21: 'st', 22: 'nd', 23: 'rd', 31: 'st' };
  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  service.getTimespan = (date, frequency) => {
    if (frequency === 'Daily') return '24 hours';
    if (frequency === 'Weekly') return `${days[date.getDay()]}`;
    if (frequency === 'Monthly') return `${date.getDate() + (human[date.getDate()] || 'th')} of the month`;
  };

  return service;
}
