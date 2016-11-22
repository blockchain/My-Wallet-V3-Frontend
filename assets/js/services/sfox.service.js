angular
  .module('walletApp')
  .factory('sfox', sfox);

function sfox ($q) {
  const service = {
    determineStep,
    fetchExchangeData
  };

  return service;

  function determineStep (exchange, accounts) {
    let profile = exchange.profile;
    if (!profile) {
      return 'create';
    } else {
      let status = profile.verificationStatus;
      let hasAccount = accounts.length && accounts[0].status === 'active';
      if (status.level !== 'verified') {
        return 'verify';
      } else if (!hasAccount) {
        return 'link';
      } else {
        return 'buy';
      }
    }
  }

  function fetchExchangeData (exchange) {
    return $q.resolve(exchange.fetchProfile())
      .then(() => exchange.getTrades())
      .then(() => exchange.monitorPayments());
  }
}
