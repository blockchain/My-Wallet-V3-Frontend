
// import angular from 'angular';
import app from './app.module';
import translations from './translations.module';

const modules = [
  require('angular-animate'),
  require('angular-sanitize'),
  require('angular-cookies'),
  require('angular-ui-router'),
  require('angular-audio'),
  require('ui-select'),
  require('angular-translate'),
  require('oclazyload'),
  'templates-main',
  translations
];

angular
  .module(
    'walletApp',
    modules.concat(app)
  )
  .constant('env', {
    ROOT_URL: 'https://explorer.staging.blockchain.co.uk/',
    VERSION_FRONTEND: 'vFE',
    VERSION_MY_WALLET: 'vMy'
  })
  .run(($rootScope, env) => {
    $rootScope.rootURL = env.ROOT_URL;
    $rootScope.versionFrontend = env.VERSION_FRONTEND;
    $rootScope.versionMyWallet = env.VERSION_MY_WALLET;
    $rootScope.buySellDebug = true;

    console.info(
      'Using My-Wallet-V3 Frontend %s and My-Wallet-V3 v%s, connecting to %s',
      $rootScope.versionFrontend, $rootScope.versionMyWallet, $rootScope.rootURL
    );
  });

require('./patterns/services.pattern');
require('./patterns/controllers.pattern');
require('./patterns/directives.pattern');
require('./patterns/components.pattern');
