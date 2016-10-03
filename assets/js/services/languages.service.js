
angular
  .module('walletApp')
  .factory('languages', languages);

languages.$inject = ['$translate'];

function languages ($translate) {
  const languageCodes = {
    'de': 'German',
    // 'cs': 'Czech', // Pending backend support
    'hi': 'Hindi',
    'no': 'Norwegian',
    'ru': 'Russian',
    // 'uk': 'Ukrainian', // Pending backend support
    'pt': 'Portuguese',
    'bg': 'Bulgarian',
    'fr': 'French',
    'zh-cn': 'Chinese Simplified',
    'hu': 'Hungarian',
    'sl': 'Slovenian',
    'id': 'Indonesian',
    'sv': 'Swedish',
    'ko': 'Korean',
    'el': 'Greek',
    'en': 'English',
    'it': 'Italiano',
    'es': 'Spanish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'ja': 'Japanese',
    'pl': 'Polish',
    'da': 'Danish',
    'ro': 'Romanian',
    'nl': 'Dutch',
    'tr': 'Turkish'
  };

  const service = {
    languages: formatLanguages(languageCodes),
    codes: Object.keys(languageCodes),
    get: () => $translate.use(),
    set: (code) => $translate.use(code),
    parseFromUrl
  };

  return service;

  function formatLanguages (langs) {
    let langFormat = code => ({
      code: code,
      name: langs[code]
    });
    let langSort = (l0, l1) => {
      var name0 = l0.name.toLowerCase();
      var name1 = l1.name.toLowerCase();
      return name0 < name1 ? -1 : 1;
    };
    return Object.keys(langs).map(langFormat).sort(langSort);
  }

  function parseFromUrl (url) {
    let codes = service.codes.join('|');
    let regex = new RegExp(`\\/(${codes})\\/wallet`);
    let matches = url.match(regex);
    return matches && matches.length ? matches[1] : null;
  }
}
