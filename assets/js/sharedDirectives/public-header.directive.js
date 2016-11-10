angular
  .module('sharedDirectives')
  .directive('publicHeader', publicHeader);

publicHeader.$inject = ['$rootScope', '$location', 'languages'];

function publicHeader ($rootScope, $location, languages) {
  const directive = {
    restrict: 'E',
    replace: true,
    template: `
    <div role="navigation" class="navbar navbar-default navbar-inverse bc-header" data-preflight-tag="PublicHeader">
      <div class="container-fluid container-max-width">
        <div class="navbar-header flex-between"><a href="{{rootURL}}" class="navbar-brand"><img id="logo" src="img/blockchain-logo.svg" alt="Blockchain"/></a>
          <button type="button" ng-init="navCollapsed = true" ng-click="navCollapsed = !navCollapsed" class="navbar-toggle"><span class="sr-only">Toggle navigation</span><span ng-show="navCollapsed" class="ti-angle-down white h4"></span><span ng-show="!navCollapsed" class="ti-angle-up white h4"></span></button>
        </div>
        <div ng-class="{'in bg-blue' : !navCollapsed}" ng-click="navCollapsed=true" class="navbar-collapse collapse">
          <ul class="nav navbar-nav navbar-left" ng-show="i18nLoaded">
            <li class="item"><a href="{{rootURL}}" translate="HOME" class="pam"></a></li>
            <li class="item"><a href="{{rootURL}}charts" translate="CHARTS" class="pam"></a></li>
            <li class="item"><a href="{{rootURL}}stats" translate="STATS" class="pam"></a></li>
            <li class="item"><a href="https://markets.blockchain.info" translate="MARKETS" class="pam"></a></li>
            <li class="item"><a href="{{rootURL}}api" translate="API" class="pam"></a></li>
            <li class="item active"><a href="#" translate="WALLET" class="pam"></a></li>
          </ul>
          <ul class="nav navbar-nav navbar-right hidden-sm">
            <li class="hidden-md">
              <form action="{{searchUrl}}" method="GET">
                <input type="text" name="search" class="form-control input-sm search-query" placeholder="{{'SEARCH'|translate}}">
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
    scope.$watch(languages.get, (code) => {
      scope.language = languages.mapCodeToName(code);
      scope.searchUrl = code === 'en' ? '/search' : `/${code}/search`;
    });
  }
}
