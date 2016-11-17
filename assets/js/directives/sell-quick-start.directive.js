angular
  .module('walletDirectives')
  .directive('sellQuickStart', sellQuickStart);

function sellQuickStart () {
  const directive = {
    replace: true,
    scope: {},
    templateUrl: 'templates/sell-quick-start.jade',
    link: link
  };
  return directive;
  function link () {

  }
}
