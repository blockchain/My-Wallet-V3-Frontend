
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
      'name': 'berlin',
      'class': 'berlin-theme',
      'display-name': 'Berlin (Red & White)'
    }
  ];

  var service = {
    themes: themes
  };

  return service;
}
