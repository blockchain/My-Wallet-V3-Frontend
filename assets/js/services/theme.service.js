
angular
  .module('walletApp')
  .factory('theme', theme);

function theme () {
  const themes = [
    {
      'name': 'default',
      'class': '',
      'display-name': 'Default'
    },
    {
      'name': 'dev',
      'class': 'dev-theme',
      'display-name': 'Dev Theme'
    },
    {
      'name': 'inverted',
      'class': 'inverted-theme',
      'display-name': 'Invert Colors'
    }
  ];

  var service = {
    themes: themes
  };

  return service;
}
