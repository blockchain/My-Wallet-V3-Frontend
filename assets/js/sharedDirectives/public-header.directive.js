angular
  .module('sharedDirectives')
  .directive('publicHeader', publicHeader);

publicHeader.$inject = ['$rootScope', '$location'];

function publicHeader ($rootScope, $location) {
  const directive = {
    restrict: 'E',
    replace: true,
    template: `
    <div role="navigation" class="navbar navbar-default navbar-inverse bc-header bc-public-header" data-preflight-tag="PublicHeader">
      <div class="container-fluid container-max-width">
        <div class="navbar-header flex-between"><a href="{{rootURL}}" class="navbar-brand"><img id="logo" src="img/blockchain-info-vector.svg" alt="Blockchain"/></a>
          <button type="button" ng-init="navCollapsed = true" ng-click="navCollapsed = !navCollapsed" class="navbar-toggle"><span class="sr-only">Toggle navigation</span><span ng-show="navCollapsed" class="ti-angle-down white h4"></span><span ng-show="!navCollapsed" class="ti-angle-up white h4"></span></button>
        </div>
        <div ng-class="{'in bg-blue' : !navCollapsed}" ng-click="navCollapsed=true" class="navbar-collapse collapse">
          <ul class="nav navbar-nav navbar-left" ng-show="i18nLoaded">
            <li class="item"><a href="{{rootURL}}" translate="HOME" class="pam"></a></li>
            <li class="item" ng-hide="isTestnet"><a href="{{rootURL}}charts" translate="CHARTS" class="pam"></a></li>
            <li class="item" ng-hide="isTestnet"><a href="{{rootURL}}stats" translate="STATS" class="pam"></a></li>
            <li class="item" ng-hide="isTestnet"><a href="https://markets.blockchain.info" translate="MARKETS" class="pam"></a></li>
            <li class="item" ng-hide="isTestnet"><a href="{{rootURL}}api" translate="API" class="pam"></a></li>
            <li class="item active"><a href="#" translate="WALLET" class="pam"></a></li>
          </ul>
          <ul class="nav navbar-nav navbar-right hidden-sm">
            <li class="hidden-md">
              <form action="{{searchUrl}}" method="GET">
                <input type="text" name="search" class="form-control input-sm search-query" placeholder="{{'SEARCH'|translate}}">
              </form>
            </li>
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
    scope.path = () => $location.path();
    scope.isTestnet = $rootScope.network === 'testnet';
  }
}
