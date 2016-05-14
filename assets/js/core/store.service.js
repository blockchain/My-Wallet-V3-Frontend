angular
  .module('walletApp.core')
  .factory('MyWalletStore', MyWalletStore);

function MyWalletStore ($q, $interval) {
  let defer = $q.defer();

  let stop = $interval(
    () => {
      if (typeof Blockchain !== 'undefined') {
        defer.resolve(Blockchain.WalletStore);
        $interval.cancel(stop);
      }
    },
    100
  );

  return defer.promise;
}
