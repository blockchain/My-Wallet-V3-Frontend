
angular
  .module('walletApp')
  .factory('theme', theme);

function theme () {
  const themes = [
    {
      'name': 'Default',
      'class': ''
    },
    {
      'name': 'Dev',
      'class': 'dev-theme'
    }
  ];

  var service = {
    themes: themes
  };

  return service;
}
