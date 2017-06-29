angular
  .module('shared')
  .directive('publicHeader', publicHeader);

publicHeader.$inject = ['$location', 'Env', 'languages'];

function publicHeader ($location, Env, languages) {
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
          <ul class="nav navbar-nav navbar-right hidden-sm flex-center flex-justify-mobile">
            <li>
              <button ui-sref="public.login-no-uid" class="round button-white-inverse upper mr-20">Log In</button>
              <button ui-sref="public.signup" class="round button-primary upper">Sign Up</button>
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
    Env.then(env => {
      scope.rootURL = env.rootURL;
      scope.isTestnet = env.network === 'testnet';
    });

    scope.$watch(languages.get, (code) => {
      scope.searchUrl = code === 'en' ? '/search' : `/${code}/search`;
    });
  }
}
