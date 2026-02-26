angular
  .module('shared')
  .directive('publicHeader', publicHeader);

publicHeader.$inject = ['$rootScope', '$location', '$window', 'AngularHelper', 'Env', 'languages'];

function publicHeader ($rootScope, $location, $window, AngularHelper, Env, languages) {
  const directive = {
    restrict: 'E',
    replace: true,
    template: `
    <div class="wrapper" data-preflight-tag="PublicHeader" ng-mouseleave="collapseHeader()">
      <nav role="navigation" ng-class="{'open': state.open, 'searching': state.searching, 'scrolling': state.scrolling}">
        <ul class="igation">
          <li>
            <a class="bc-logo" href="https://blockchain.com">
              <img src="img/white-blockchain.svg" alt="Blockchain" />
            </a>
            <button class="menu-button" ng-click="expandHeader()" ng-class="{'is-active': state.open}">
                <span></span>
            </button>
            <button class="search-button" type="button" ng-click="handleSearch()"></button>
          </li>
          <li class="with-children" ng-mouseenter="!size().mobile && expandHeader()" ng-mouseleave="collapseHeader($event)">
            <a href="{{rootURL}}wallet" id="wallet-link">Wallet</a>
            <ul>
              <li><a ui-sref="public.login-no-uid">Login</a></li>
            </ul>
          </li>
          <li class="with-children" ng-mouseenter="!size().mobile && expandHeader()" ng-mouseleave="collapseHeader($event)">
            <a href="{{rootURL}}">Data</a>
            <ul>
              <li><a href="{{rootURL}}charts">Charts</a></li>
              <li><a href="{{rootURL}}stats">Stats</a></li>
              <li><a href="{{rootURL}}markets">Markets</a></li>
            </ul>
          </li>
          <li class="with-children" ng-mouseenter="!size().mobile && expandHeader()" ng-mouseleave="collapseHeader($event)">
            <a href="{{rootURL}}api">API</a>
            <ul>
              <li><a href="https://www.blockchain.com/enterprise">Business</a></li>
            </ul>
          </li>
          <li class="with-children" ng-mouseenter="!size().mobile && expandHeader()" ng-mouseleave="collapseHeader($event)">
            <a href="https://www.blockchain.com/about">About</a>
            <ul>
              <li><a href="https://www.blockchain.com/team">Team</a></li>
              <li><a href="https://www.blockchain.com/careers">Careers</a></li>
              <li><a href="https://www.blockchain.com/press">Press</a></li>
              <li><a href="https://blog.blockchain.com">Blog</a></li>
            </ul>
          </li>
          <li class="flex-space"></li>
          <li>
            <form action="https://blockchain.info/search" class="search-form" method="GET">
              <input class="search-bar" name="search" placeholder="block, hash, transaction, etc..." type="text" />
            </form>
          </li>
          <li>
            <a class="wallet-button" ui-sref="public.signup">Get A Free Wallet</a>
          </li>
        </ul>
      </nav>
    </div>
    `,
    scope: {
      posY: '=',
      i18nLoaded: '='
    },
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    Env.then(env => {
      scope.rootURL = env.rootURL;
    });

    scope.$watch(languages.get, (code) => {
      scope.searchUrl = code === 'en' ? '/search' : `/${code}/search`;
    });

    scope.size = () => $rootScope.size;

    scope.expandHeader = () => {
      scope.state.searching = false;
      if (scope.size().mobile) {
        scope.state.searching = false;
        scope.state.open = !scope.state.open;
      } else {
        scope.state.open = true;
      }
    };

    scope.collapseHeader = ($event) => {
      let toElement = $event && $event.toElement;
      if (scope.size().mobile) {

      } else {
        if (!toElement) {
          scope.state.open = false;
        } else if (toElement.getAttribute('class') === 'igation') {
          scope.state.open = false;
        }
      }
    };

    scope.handleSearch = () => {
      scope.state.searching = !scope.state.searching;
    };

    scope.handleHeader = (posY) => {
      if (posY > 0) scope.state.scrolling = true;
      else scope.state.scrolling = false;
    };

    scope.state = {
      open: false,
      searching: false
    };

    scope.$watch('posY', scope.handleHeader);
  }
}
