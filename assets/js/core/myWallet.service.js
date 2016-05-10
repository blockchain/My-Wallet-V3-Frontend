angular
  .module('walletApp.core')
  .factory('MyWallet', MyWallet);

function MyWallet ($q, $interval) {
  let defer = $q.defer();

  let stop;

  stop = $interval(
    () => {
      if (typeof Blockchain !== 'undefined') {
        defer.resolve(Blockchain.MyWallet);
        $interval.cancel(stop);
      }
    },
    100
  );

  return defer.promise;
}
