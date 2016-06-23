// https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
angular
  .module('walletApp')
  .factory('country', country);

country.$inject = [];

function country () {
  const countryCodes = {
    'GB': 'United Kingdom',
    'US': 'United States',
    'CH': 'Switzerland',
    'DE': 'Germany'
  };

  function formatCountries (countries) {
    let countryFormat = code => ({
      code: code,
      name: countries[code]
    });
    return Object.keys(countries).map(countryFormat);
  }

  const service = {
    countryCodes: formatCountries(countryCodes)
  };

  return service;
}
