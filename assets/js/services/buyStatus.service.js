angular
  .module('buyStatus', [])
  .factory('buyStatus', buyStatus);

buyStatus.$inject = ['MyWallet', 'Options'];

function buyStatus (MyWallet, Options) {
  const service = {};

  let isCountryWhitelisted = null;

  let setIsCountryWhitelisted = (options) => {
    let accountInfo = MyWallet.wallet && MyWallet.wallet.accountInfo;

    let whitelist = options.showBuySellTab || [];
    isCountryWhitelisted = accountInfo && whitelist.indexOf(accountInfo.countryCodeGuess) > -1;
  };

  service.canBuy = () => {
    let accountInfo = MyWallet.wallet && MyWallet.wallet.accountInfo;
    let isUserInvited = accountInfo && accountInfo.invited;

    if (Options.didFetch) {
      setIsCountryWhitelisted(Options.options);
      return isUserInvited && isCountryWhitelisted;
    } else {
      Options.get().then(setIsCountryWhitelisted)
                   .then(() => isUserInvited && isCountryWhitelisted);
    }
  };

  service.userHasAccount = () => MyWallet.wallet.external && MyWallet.wallet.external.coinify && MyWallet.wallet.external.coinify.hasAccount;

  return service;
}
