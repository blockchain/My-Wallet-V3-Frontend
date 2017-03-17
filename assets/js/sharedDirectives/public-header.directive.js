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
      <div class="container-fluid container">
        <div class="navbar-header flex-between"><a href="{{rootURL}}" class="navbar-brand"><img id="logo" src="img/blockchain-vector.svg" alt="Blockchain"/></a>
          <button type="button" class="navbar-toggle collapsed" ng-init="navCollapsed = true" ng-click="navCollapsed = !navCollapsed">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
        </div>
        <div ng-class="{'in bg-blue' : !navCollapsed}" ng-click="navCollapsed=true" class="navbar-collapse collapse">
          <ul class="nav navbar-nav navbar-left" ng-show="i18nLoaded">
            <li class="item active"><a href="#" translate="WALLET" class="upper"></a></li>
            <li class="item" ng-hide="isTestnet"><a href="{{rootURL}}charts" translate="CHARTS" class="upper"></a></li>
            <li class="item" ng-hide="isTestnet"><a href="{{rootURL}}stats" translate="STATS" class="upper"></a></li>
            <li class="item" ng-hide="isTestnet"><a href="{{rootURL}}markets" translate="MARKETS" class="upper"></a></li>
            <li class="item" ng-hide="isTestnet"><a href="{{rootURL}}api" translate="API" class="upper"></a></li>
          </ul>
          <ul class="nav navbar-nav navbar-right hidden-sm">
            <li class="hidden-md">
              <form action="{{searchUrl}}" class="bc-form" method="GET">
                <div class="group">
                  <div class="item search">
                    <input type="text" name="search" id="header-search" class="form-control" placeholder="{{'SEARCH_FOR_BLOCK_ETC'|translate}}">
                    <i class="icon-search"></i>
                  </div>
                </div>
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
