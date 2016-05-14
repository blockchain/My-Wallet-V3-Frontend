angular
  .module('walletApp.core')
  .factory('MyWalletPayment', MyWalletPayment);

function MyWalletPayment ($q, $interval) {
  let defer = $q.defer();

  let stop = $interval(
    () => {
      if (typeof Blockchain !== 'undefined') {
        defer.resolve(Blockchain.Payment);
        $interval.cancel(stop);
      }
    },
    100
  );

  return defer.promise;
}
