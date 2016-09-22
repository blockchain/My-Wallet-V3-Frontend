
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
      'display-name': 'The Matrix'
    }
  ];

  var service = {
    themes: themes
  };

  return service;
}
