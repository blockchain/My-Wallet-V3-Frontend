angular
  .module('shared')
  .factory('Env', Env);

Env.$inject = ['$rootScope', '$location', '$q'];

function Env ($rootScope, $location, $q) {
  let env = {
  };

  let defer = $q.defer();

  $rootScope.$watch('rootURL', () => {
    // If a custom rootURL is set by index.pug:
    //                    Grunt can replace this:
    const customRootURL = $rootScope.rootURL;
    env.rootURL = customRootURL;

    const absUrl = $location.absUrl();
    const path = $location.path();
    if (absUrl && path && path.length) {
      // e.g. https://blockchain.info/wallet/#
      env.rootPath = $location.absUrl().slice(0, -$location.path().length);
    }

    // These are set by grunt dist:
    env.versionFrontend = null;
    env.versionMyWallet = null;

    // Not set by grunt dist:
    env.isProduction = env.rootURL === 'https://blockchain.info/' || env.rootURL === '/';
    env.buySellDebug = false;

    console.info(
      'Using My-Wallet-V3 Frontend %s and My-Wallet-V3 v%s, connecting to %s',
      env.versionFrontend, env.versionMyWallet, env.rootURL
    );

    env.sfoxUseStaging = $rootScope.sfoxUseStaging;

    if (env.sfoxUseStaging === undefined) {
      env.sfoxUseStaging = null;
    }

    if ($rootScope.sfoxUseStaging) {
      env.sfoxUseStaging = true;
      env.sfoxApiKey = $rootScope.sfoxApiKey;
      env.sfoxPlaidEnv = $rootScope.sfoxPlaidEnv;
      env.sfoxSiftScienceKey = $rootScope.sfoxSiftScienceKey;

      console.info(
        'Using SFOX staging environment with API key %s, Plaid environment %s and Sift Science key %s.',
        env.sfoxApiKey,
        env.sfoxPlaidEnv,
        env.sfoxSiftScienceKey
      );
    }

    //                       Grunt can replace this:
    env.customWebSocketURL = $rootScope.webSocketURL;

    //            Grunt can replace this:
    env.network = $rootScope.network || 'bitcoin';

    //              Grunt can replace this:
    env.apiDomain = $rootScope.apiDomain || 'https://api.blockchain.info/';

    env.buySellDebug = $rootScope.buySellDebug;

    env.walletHelperUrl = $rootScope.walletHelperUrl || 'http://localhost:8081';

    env.googleAnalyticsKey = 'UA-75417471-1';

    defer.resolve(env);
  });

  return defer.promise;
}
