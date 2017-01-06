
function SiftController ($scope, $routeParams) {
  const isInIframe = (window.parent !== window);

  if (!isInIframe) {
    console.error('Must be inside iframe');
    return;
  }

  // const parentUrl = document.referrer.replace('/wallet/', '');
  // window.parent.postMessage({from: 'sift', to: 'exchange', command: '...'}, parentUrl);
}

export default SiftController;
