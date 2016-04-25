
angular
  .module('walletApp')
  .factory('languages', languages);

languages.$inject = [];

function languages () {
  const languageCodes = {
    'de': 'German',
    'hi': 'Hindi',
    'no': 'Norwegian',
    'ru': 'Russian',
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

  const service = formatLanguages(languageCodes);
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
}
