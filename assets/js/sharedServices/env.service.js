angular
  .module('shared')
  .factory('Env', Env);

Env.$inject = ['$rootScope', '$location', '$q', '$http'];

function Env ($rootScope, $location, $q, $http) {
  let env = {
  };

  // These are set by grunt dist:
  env.versionFrontend = null;
  env.versionMyWallet = null;

  const absUrl = $location.absUrl();
  const path = $location.path();
  if (absUrl && path && path.length) {
    // e.g. https://blockchain.info/wallet
    env.rootPath = $location.absUrl().slice(0, -$location.path().length);
  }

  let defer = $q.defer();

  let url = `/Resources/wallet-options.json`;

  $http.get(url)
    .success((res) => {
      env.buySellDebug = $rootScope.buySellDebug;

      env.partners = res.partners;
      env.showBuySellTab = res.showBuySellTab;
      env.service_charge = res.service_charge;

      env.rootURL = res.domains.root + '/';

      env.isProduction = env.rootURL === 'https://blockchain.info/' || env.rootURL === '/';
      env.buySellDebug = false;

      console.info(
        'Using My-Wallet-V3 Frontend %s and My-Wallet-V3 v%s, connecting to %s',
        env.versionFrontend, env.versionMyWallet, env.rootURL
      );

      env.customWebSocketURL = res.domains.webSocket;

      env.network = res.network;

      env.apiDomain = res.domains.api + '/';

      env.walletHelperDomain = res.domains.walletHelper;

      defer.resolve(env);
    }
  );

  return defer.promise;
}
