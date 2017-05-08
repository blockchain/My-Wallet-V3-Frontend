angular
  .module('walletFilters')
  .filter('fees', feesFilter);

function feesFilter () {
  let obj = {};
  return function (fees) {
    obj.legacyCapped = fees.legacyCapped;
    obj.priority = fees.priority;
    return obj;
  };
}
