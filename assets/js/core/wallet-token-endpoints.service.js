angular
  .module('walletApp.core')
  .factory('WalletTokenEndpoints', WalletTokenEndpoints);

function WalletTokenEndpoints (Env) {
  Blockchain.API.ROOT_URL = Env.rootURL;

  return {
    verifyEmail: (token) => Blockchain.WalletTokenEndpoints.verifyEmail(token),
    authorizeApprove: (token, differentBrowser, confirm) => Blockchain.WalletTokenEndpoints.authorizeApprove(token, differentBrowser, confirm),
    resetTwoFactor: (token) => Blockchain.WalletTokenEndpoints.resetTwoFactor(token),
    unsubscribe: (token) => Blockchain.WalletTokenEndpoints.unsubscribe(token)
  };
}
