// https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
angular
  .module('walletApp')
  .factory('country', country);

country.$inject = [];

function country () {
  const countryCodes = {
    'GB': 'United Kingdom',
    'AT': 'Austria',
    'BE': 'Belgium',
    'BG': 'Bulgaria',
    'HR': 'Croatia',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'EE': 'Estonia',
    'FI': 'Finland',
    'FR': 'France',
    'DE': 'Germany',
    'GR': 'Greece',
    'HU': 'Hungary',
    'IS': 'Iceland',
    'IE': 'Ireland',
    'IT': 'Italy',
    'LV': 'Latvia',
    'LI': 'Liechtenstein',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'MT': 'Malta',
    'MC': 'Monaco',
    'NL': 'Netherlands',
    'NO': 'Norway',
    'PL': 'Poland',
    'PT': 'Portugal',
    'RO': 'Romania',
    'SM': 'San Marino',
    'SK': 'Slovakia',
    'ES': 'Spain',
    'SE': 'Sweden',
    'CH': 'Switzerland'
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
