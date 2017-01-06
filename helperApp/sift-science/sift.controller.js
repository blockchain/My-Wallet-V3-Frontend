
function SiftController ($scope, $routeParams, $timeout) {
  const isInIframe = (window.parent !== window);

  if (!isInIframe) {
    console.error('Must be inside iframe');
    return;
  }

  const parentUrl = document.referrer.replace('/wallet/', '');

  var _sift = window._sift = window._sift || [];
  _sift.push(['_setCookieDomain', window.location.hostname]);
  _sift.push(['_setAccount', $routeParams.apiKey]);
  _sift.push(['_setUserId', $routeParams.userId]);
  _sift.push(['_trackPageview']);

  // Sift Science submits data by loading a GIF image. We need to detect when
  // it's done loading.
  var OriginalImage = window.Image;
  window.Image = function (width, height) {
    let img = new OriginalImage(width, height);

    // onload is overriden by Sift Science directly after new Image(1,1)
    $timeout(() => {
      let originalOnLoad = img.onload;
      img.onload = () => {
        window.parent.postMessage({from: 'sift-science', to: 'exchange', command: 'done'}, parentUrl);
        originalOnLoad();
      };
    }, 0);
    return img;
  };
}

export default SiftController;
