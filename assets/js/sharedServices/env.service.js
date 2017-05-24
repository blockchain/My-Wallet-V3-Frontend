angular
  .module('shared')
  .provider('Env', EnvProvider);

function EnvProvider () {
  let optionsUrl = null;
  let versionFrontend = null;
  let versionMyWallet = null;
  let buySellDebug = false;

  this.setOptionsUrl = (url) => {
    optionsUrl = url;
  };

  this.setVersion = (vFrontend, vMyWallet) => {
    versionFrontend = vFrontend;
    versionMyWallet = vMyWallet;
  };

  this.setBuySellDebugEnabled = (enabled) => {
    buySellDebug = !!enabled;
  };

  this.$get = ['$http', '$location', function envFactory ($http, $location) {
    let absUrl = $location.absUrl();
    let path = $location.path();

    // e.g. https://blockchain.info/wallet/#
    let rootPath = absUrl && path && path.length ? absUrl.slice(0, -path.length) : null;

    return $http.get(optionsUrl).then((response) => {
      let options = response.data;
      return new Env(rootPath, versionFrontend, versionMyWallet, buySellDebug, options);
    });
  }];
}

function Env (rootPath, versionFrontend, versionMyWallet, buySellDebug, options) {
  // Versioning
  this.versionFrontend = versionFrontend;
  this.versionMyWallet = versionMyWallet;

  // Buy/Sell
  this.buySellDebug = buySellDebug || false;
  this.partners = options.partners;
  this.showBuySellTab = options.showBuySellTab;
  this.service_charge = options.service_charge;

  // Route config
  this.rootURL = options.domains.root + '/';
  this.customWebSocketURL = options.domains.webSocket;
  this.apiDomain = options.domains.api + '/';
  this.walletHelperDomain = options.domains.walletHelper;

  this.network = options.network;
  this.isProduction = this.rootURL === 'https://blockchain.info/' || this.rootURL === '/';

  console.info(
    'Using My-Wallet-V3 Frontend %s and My-Wallet-V3 v%s, connecting to %s',
    this.versionFrontend, this.versionMyWallet, this.rootURL
  );
}
