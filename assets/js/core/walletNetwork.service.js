angular
  .module('walletApp.core')
  .factory('WalletNetwork', WalletNetwork);

function WalletNetwork ($q, $interval) {
  let defer = $q.defer();

  let stop = $interval(
    () => {
      if (typeof Blockchain !== 'undefined') {
        defer.resolve(Blockchain.WalletNetwork);
        $interval.cancel(stop);
      }
    },
    100
  );

  return defer.promise;
}
