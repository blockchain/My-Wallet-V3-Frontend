angular
  .module('sharedDirectives')
  .directive('publicHeader', publicHeader);

publicHeader.$inject = ['$rootScope', '$location', 'languages'];

function publicHeader ($rootScope, $location, languages) {
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
            <li class="item" ng-hide="isTestnet"><a href="https://markets.blockchain.info" translate="MARKETS" class="upper"></a></li>
            <li class="item" ng-hide="isTestnet"><a href="{{rootURL}}api" translate="API" class="upper"></a></li>
            <li class="item" ng-hide="isTestnet"><a href="https://blockchain.com/about" translate="ABOUT" class="upper"></a></li>
          </ul>
          <ul class="nav navbar-nav navbar-right hidden-sm">
            <li class="hidden-md">
              <form action="{{searchUrl}}" class="bc-form" method="GET">
                <div class="group">
                  <div class="item search">
                    <input type="text" name="search" class="form-control input-sm search-query" placeholder="{{'SEARCH'|translate}}">
                    <i class="icon-search"></i>
                  </div>
                </div>
              </form>
            </li>
            <li class="dropdown" uib-dropdown>
              <a href="#" class="dropdown-toggle" role="button" aria-haspopup="true" uib-dropdown-toggle>
                <div class="flex-center">
                  {{language}}<span class="caret mlm"></span>
                </div>
              </a>
              <ul class="dropdown-menu" uib-dropdown-menu>
                <li ng-repeat="lang in languages"><a ng-href="/{{lang.code}}/wallet/#{{path()}}">{{lang.name}}</a></li>
              </ul>
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
    scope.languages = languages.languages;
    scope.path = () => $location.path();
    scope.isTestnet = $rootScope.network === 'testnet';
    scope.$watch(languages.get, (code) => {
      scope.language = languages.mapCodeToName(code);
      scope.searchUrl = code === 'en' ? '/search' : `/${code}/search`;
    });
  }
}
