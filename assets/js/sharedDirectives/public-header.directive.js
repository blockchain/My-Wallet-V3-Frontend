angular
  .module('sharedDirectives')
  .directive('publicHeader', publicHeader);

publicHeader.$inject = ['$rootScope'];

function publicHeader ($rootScope) {
  const directive = {
    restrict: 'E',
    replace: true,
    template: `
    <div role="navigation" class="navbar bg-blue navbar-default navbar-inverse bc-header">
      <div class="container-fluid container-max-width">
        <div class="navbar-header flex-between"><a href="{{rootURL}}" class="navbar-brand"><img id="logo" src="img/blockchain-logo.svg" alt="Blockchain"/></a>
          <button type="button" ng-init="navCollapsed = true" ng-click="navCollapsed = !navCollapsed" class="navbar-toggle"><span class="sr-only">Toggle navigation</span><span ng-show="navCollapsed" class="ti-angle-down white h4"></span><span ng-show="!navCollapsed" class="ti-angle-up white h4"></span></button>
        </div>
        <div ng-class="{'in bg-blue' : !navCollapsed}" ng-click="navCollapsed=true" class="navbar-collapse collapse">
          <ul class="nav navbar-nav navbar-left" ng-show="i18nLoaded">
            <li class="item"><a href="{{rootURL}}" class="pam"><span class="white" translate="HOME"></span></a></li>
            <li class="item"><a href="{{rootURL}}charts" class="pam"><span class ="white" translate="CHARTS"></span></a></li>
            <li class="item"><a href="{{rootURL}}stats" class="pam"><span class ="white" translate="STATS"></span></a></li>
            <li class="item"><a href="https://markets.blockchain.info" class="pam"><span class ="white" translate="MARKETS"></span></a></li>
            <li class="item"><a href="{{rootURL}}api" class="pam"><span class ="white" translate="API"></span></a></li>
            <li class="item active"><a href="#" class="pam"><span class ="white" translate="WALLET"></span></a></li>
          </ul>
        </div>
      </div>
    </div>
    `,
    scope: {
      i18nLoaded: '='
    },
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.rootURL = $rootScope.rootURL;
  }
}
