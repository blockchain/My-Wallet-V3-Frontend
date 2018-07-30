angular
  .module('walletApp.core')
  .factory('WalletTokenEndpoints', WalletTokenEndpoints);

function WalletTokenEndpoints (Env) {
  const processEnv = () => Env.then(env => {
    Blockchain.API.ROOT_URL = env.rootURL;
  });

  return {
    verifyEmail: (token) => processEnv().then(() => Blockchain.WalletTokenEndpoints.verifyEmail(token)),
    authorizeApprove: (token, differentBrowser, confirm) => processEnv().then(() => Blockchain.WalletTokenEndpoints.authorizeApprove(token, differentBrowser, confirm)),
    resetTwoFactor: (token) => processEnv().then(() => Blockchain.WalletTokenEndpoints.resetTwoFactor(token)),
    unsubscribe: (token) => processEnv().then(() => Blockchain.WalletTokenEndpoints.unsubscribe(token))
  };
}
