
angular
  .module('walletDirectives')
  .directive('browserDetection', directive);

//   Browser compatibility warnings:
// * Secure random number generator: https://developer.mozilla.org/en-US/docs/Web/API/RandomSource/getRandomValues
// * AngularJS support (?)
// * No support before Safari 6 and equivalents based on experience

const browsers = {
  'ie': {
    name: 'Internet Explorer',
    requiredVersion: 11
  },
  'chrome': {
    name: 'Chrome',
    requiredVersion: 45 // Fixes various iframe CVE's
  },
  'firefox': {
    name: 'Firefox',
    requiredVersion: 45 // Fixes various iframe CVE's
  },
  'opera': {
    name: 'Opera',
    requiredVersion: 20 // First Chromium (33) based release
  }
};

directive.$inject = ['$q', '$translate', 'MyWallet'];

function directive ($q, $translate, MyWallet) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      result: '=' // Should initially be {disabled: true}
    },
    template: `
      <div class="browser-detection">
        <p class="text-warning" ng-show="result.warn">{{ result.msg }}</p>
        <p class="text-danger" ng-show="result.disabled">{{ result.msg }}</p>
      </div>
    `,
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    const warnUnknownBrowser = (defer) => {
      $translate('UNKNOWN_BROWSER').then((translation) => {
        defer.resolve({warn: true, msg: translation});
      });
    };

    // Check if it can handle the math required:
    const checkBrowserMath = () => {
      let defer = $q.defer();

      if (!MyWallet.browserCheckFast()) {
        $translate('UNSUITABLE_BROWSER').then((translation) => {
          defer.reject({msg: translation});
        });
      } else {
        defer.resolve();
      }

      return defer.promise;
    };

    scope.getUserAgent = () => navigator.userAgent;

    const checkBrowserVersion = () => {
      let defer = $q.defer();

      let info = browserDetection();
      let matchingBrowser = info.browser && browsers[info.browser.toLowerCase()];
      if (matchingBrowser) { // One of the known browsers listed above
        let requiredVersion = matchingBrowser.requiredVersion;
        if (info.version < requiredVersion) {
          $translate('MINIMUM_BROWSER', {browser: matchingBrowser.name, userVersion: info.version, requiredVersion: requiredVersion}).then((translation) => {
            defer.reject({msg: translation});
          });
        } else if (info.browser === 'ie') {
          $translate('WARN_AGAINST_IE').then((translation) => {
            defer.resolve({warn: true, msg: translation});
          });
        } else {
          defer.resolve({});
        }
      } else if (info.webkit) {
        // 600.1.4 shipped with iOs 8
        let minimumWebkitVersion = '600.1.4';
        // Patch field may be undefined:
        let userVersion = [
          info.webkit.major,
          info.webkit.minor,
          info.webkit.patch
        ].filter((x) => typeof (x) === 'number').join('.');
        if (compareVersions(userVersion, minimumWebkitVersion) === -1) {
          // Webkit version too old.
          if (info.browser === 'safari') {
            let safariVersion = 'version';
            const safari = scope.getUserAgent().match(/version\/(\d+\.\d+)/i);
            if (safari && safari.length === 2) {
              safariVersion = safari[1];
            }

            // iOs 8 ships with webkit 600
            $translate('MINIMUM_BROWSER', {browser: 'Safari', userVersion: safariVersion, requiredVersion: '8.0.6'}).then((translation) => {
              defer.reject({msg: translation});
            });
          } else {
            $translate('MINIMUM_BROWSER', {browser: 'Webkit', userVersion: userVersion, requiredVersion: minimumWebkitVersion}).then((translation) => {
              defer.reject({msg: translation});
            });
          }
        } else {
          if (info.browser === 'safari') {
            defer.resolve({});
          } else {
            // Unknown webkit browser:
            warnUnknownBrowser(defer);
          }
        }
      } else {
        // Unknown non-webkit browser:
        warnUnknownBrowser(defer);
      }
      return defer.promise;
    };

    scope.performCheck = () => {
      const error = (res) => {
        scope.result.disabled = true;
        scope.result.msg = res.msg;
      };

      checkBrowserMath().then(() => {
        checkBrowserVersion().then((res) => {
          scope.result.disabled = false;
          scope.result.warn = res.warn;
          scope.result.msg = res.msg;
        }).catch(error);
      }).catch(error);
    };

    scope.performCheck();
  }
}
