angular
  .module('walletApp')
  .directive('bcFileUpload', bcFileUpload);

bcFileUpload.$inject = ['Alerts'];

function bcFileUpload (Alerts) {
  const directive = {
    restrict: 'E',
    scope: {
      state: '=',
      onUpload: '='
    },
    templateUrl: 'templates/bc-file-upload.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.canvasOpts = {x: 0, y: 0, w: 400, h: 300};
    scope.webcam = {
      video: null
    };

    scope.enableWebcam = () => {
      scope.state.webcam = { streaming: true };
    };

    scope.disableWebcam = () => {
      scope.state.webcam = {};
    };

    scope.upload = () => {
      scope.disableWebcam();
      scope.enableWebcam();
      scope.onUpload();
    };

    scope.webcamError = () => {
      scope.disableWebcam();
      Alerts.displayError('CAMERA_PERMISSION_DENIED');
    };

    var getVideoData = (x, y, w, h) => {
      let hiddenCanvas = document.createElement('canvas');
      hiddenCanvas.width = scope.webcam.video.width;
      hiddenCanvas.height = scope.webcam.video.height;
      var ctx = hiddenCanvas.getContext('2d');
      ctx.drawImage(scope.webcam.video, 0, 0, scope.webcam.video.width, scope.webcam.video.height);
      return ctx.getImageData(x, y, w, h);
    };

    scope.capture = () => {
      let canvas = document.querySelector('#snapshot');
      canvas.width = scope.webcam.video.width;
      canvas.height = scope.webcam.video.height;
      var ctxPat = canvas.getContext('2d');

      let idata = getVideoData(scope.canvasOpts.x, scope.canvasOpts.y, scope.canvasOpts.w, scope.canvasOpts.h);
      ctxPat.putImageData(idata, 0, 0);

      canvas.toBlob((blob) => {
        scope.state.file = blob;
      }, 'image/png');
    };

    scope.enableWebcam();
    scope.$watch('state.file', (file) => file && scope.disableWebcam());
  }
}
