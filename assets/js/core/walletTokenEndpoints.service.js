angular
  .module('walletApp.core')
  .factory('WalletTokenEndpoints', WalletTokenEndpoints);

function WalletTokenEndpoints ($q, $interval) {
  let defer = $q.defer();

  let stop = $interval(
    () => {
      if (typeof Blockchain !== 'undefined') {
        defer.resolve(Blockchain.WalletTokenEndpoints);
        $interval.cancel(stop);
      }
    },
    100
  );

  return defer.promise;
}
