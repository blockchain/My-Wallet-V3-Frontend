angular
  .module('walletFilters')
  .filter('fees', feesFilter);

function feesFilter () {
  let obj = {};
  return function (fees) {
    obj.regular = fees.regular;
    obj.priority = fees.priority;
    return obj;
  };
}
