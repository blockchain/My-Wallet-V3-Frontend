
angular
  .module('walletApp')
  .directive('videoContainer', videoContainer);

videoContainer.$inject = ['$window', '$timeout', '$sce'];

function videoContainer($window, $timeout, $sce) {
  const directive = {
    restrict: 'E',
    templateUrl: 'templates/video-container.jade',
    replace: true,
    scope: {},
    link: link
  };

  return directive;

  function link(scope, elem, attrs) {
    scope.img = attrs['img']
    scope.video = attrs['video']
    scope.videoElem = elem.find('video')[0];

    scope.toggle = () => { scope.playing = scope.playing ? false : true; }

    scope.trust = (src) => { return $sce.trustAsResourceUrl(src); }

    scope.$watch('playing', (newVal, oldVal) => {
      if ( !scope.videoElem.play && !scope.videoElem.pause ) { return }

      if (newVal) { scope.videoElem.play()
      } else { scope.videoElem.pause() }
    }, true)
  }
}