angular
  .module('shared')
  .directive('publicHeader', publicHeader);

publicHeader.$inject = ['$location', 'Env', 'languages'];

function publicHeader ($location, Env, languages) {
  const directive = {
    restrict: 'E',
    replace: true,
    template: `
    <div class="wrapper" data-preflight-tag="PublicHeader">
      <nav role="navigation">
        <ul class="igation">
          <li>
            <a class="bc-logo" href="{{rootURL}}">
              <img src="img/white-blockchain.svg" alt="Blockchain" />
            </a>
            <button class="menu-button">
    					<span></span>
    				</button>
    				<button class="search-button" type="button"></button>
          </li>
          <li class="with-children">
            <a href="{{rootURL}}wallet" id="wallet-link">Wallet</a>
            <ul>
              <li><a href="{{rootURL}}wallet/#/login">Login</a></li>
            </ul>
          </li>
          <li class="with-children">
            <a href="https://blockchain.info">Data</a>
            <ul>
              <li><a href="{{rootURL}}charts">Charts</a></li>
              <li><a href="{{rootURL}}stats">Stats</a></li>
              <li><a href="{{rootURL}}markets">Markets</a></li>
            </ul>
          </li>
          <li class="with-children">
            <a href="{{rootURL}}api">API</a>
            <ul>
              <li><a href="https://www.blockchain.com/enterprise">Business</a></li>
            </ul>
          </li>
          <li class="with-children">
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
            <a class="wallet-button" href="{{rootURL}}wallet/#/signup" target="_blank">Get A Free Wallet</a>
          </li>
        </ul>
      </nav>
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
