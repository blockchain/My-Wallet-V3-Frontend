angular
  .module('walletApp')
  .directive('bcFileUpload', bcFileUpload);

bcFileUpload.$inject = ['$rootScope', 'Alerts'];

function bcFileUpload ($rootScope, Alerts) {
  const directive = {
    restrict: 'E',
    scope: {
      file: '=',
      locked: '=',
      idType: '=',
      onUpload: '='
    },
    templateUrl: 'templates/bc-file-upload.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.browserWithCamera = $rootScope.browserWithCamera;
    scope.state = {
      webcam: {
        stream: false
      }
    };

    scope.reset = () => {
      scope.file = null;
      scope.invalidFile = null;
      scope.disableWebcam();
    };

    scope.enableWebcam = () => {
      scope.state.webcam.active = true;
    };

    scope.disableWebcam = () => {
      scope.state.webcam = {};
    };

    scope.webcamStream = () => {
      scope.state.webcam.stream = true;
    };

    scope.webcamError = () => {
      scope.state.webcam.error = true;
    };

    scope.upload = () => {
      scope.disableWebcam();
      scope.onUpload();
    };

    scope.webcam = {
      video: {},
      videoWidth: 660,
      videoHeight: 495
    };

    scope.canvasOpts = { x: 0, y: 70, w: 660, h: 355 };

    var getVideoData = (x, y, w, h) => {
      let hiddenCanvas = document.createElement('canvas');
      hiddenCanvas.width = scope.webcam.video.width;
      hiddenCanvas.height = scope.webcam.video.height;
      var ctx = hiddenCanvas.getContext('2d');
      ctx.drawImage(scope.webcam.video, 0, 0, scope.webcam.video.width, scope.webcam.video.height);
      return ctx.getImageData(x, y, w, h);
    };

    scope.capture = () => {
      scope.state.webcam.disabled = true;
      let canvas = document.querySelector('#snapshot');
      canvas.width = scope.webcam.video.width;
      canvas.height = scope.webcam.video.height;
      var ctxPat = canvas.getContext('2d');

      let idata = getVideoData(scope.canvasOpts.x, scope.canvasOpts.y, scope.canvasOpts.w, scope.canvasOpts.h);
      ctxPat.putImageData(idata, 0, 0);

      canvas.toBlob((blob) => {
        scope.file = blob;
      }, 'image/png');
    };

    scope.$watch('file', (file) => file && scope.disableWebcam());
  }
}
