angular
  .module('walletApp.core')
  .factory('MyWalletHelpers', MyWalletHelpers);

function MyWalletHelpers ($q, $interval) {
  let defer = $q.defer();

  let stop;

  stop = $interval(
    () => {
      if (typeof Blockchain !== 'undefined') {
        defer.resolve(Blockchain.Helpers);
        $interval.cancel(stop);
      }
    },
    100
  );

  return defer.promise;
}
