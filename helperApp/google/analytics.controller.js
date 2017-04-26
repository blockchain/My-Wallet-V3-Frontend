
function AnalyticsController ($scope, $routeParams, $window) {
  const isInIframe = (window.parent !== window);
  const parentUrl = document.referrer.replace('/wallet/', '');

  if (!isInIframe) {
    console.error('Must be inside iframe');
    return;
  }

  $window.ga.l = new Date();
  $window.ga('create', $routeParams.analyticsKey, 'auto');
  $window.ga('set', 'title', `Wallet - ${$routeParams.stateName}`);
  $window.ga('send', 'pageview', `wallet/${$routeParams.stateName}`, {
    anonymizeIp: true,
    hitCallback: () => {
      $window.parent.postMessage({from: 'google', to: 'wallet', command: 'done'}, parentUrl);
    }
  });
}

export default AnalyticsController;
