angular
  .module('walletApp')
  .factory('recurringTrade', RecurringTradeService);

function RecurringTradeService () {
  const service = {};

  let human = { 1: 'st', 2: 'nd', 3: 'rd', 21: 'st', 22: 'nd', 23: 'rd', 31: 'st' };
  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  service.getTimespan = (date, frequency) => {
    let freq = frequency.toLowerCase();
    if (freq === 'hourly') return 'hour';
    if (freq === 'daily') return '24 hours';
    if (freq === 'weekly') return `${days[date.getDay()]}`;
    if (freq === 'monthly') return `${date.getDate() + (human[date.getDate()] || 'th')} of the month`;
  };

  service.setDate = (frequency) => {
    let d = new Date();
    switch (frequency) {
      case 'Daily':
        return new Date(d.setDate(d.getDate() + 1));
      case 'Weekly':
        return new Date(d.setDate(d.getDate() + 7));
      case 'Monthly':
        return new Date(d.setMonth(d.getMonth() + 1));
      default:
        return d;
    }
  };

  return service;
}
