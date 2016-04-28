
angular
  .module('walletApp')
  .directive('videoContainer', videoContainer);

videoContainer.$inject = ['$window', '$timeout', '$sce'];

function videoContainer ($window, $timeout, $sce) {
  const directive = {
    restrict: 'E',
    templateUrl: 'templates/video-container.jade',
    replace: true,
    scope: {},
    link: link
  };

  return directive;

  function link (scope, elem, attrs) {
    scope.img = attrs['img'];
    scope.src = attrs['src'];
    scope.videoElem = elem.find('video')[0];

    scope.toggle = () => scope.playing = !scope.playing;
    scope.trust = (src) => $sce.trustAsResourceUrl(src);
    scope.load = () => scope.videoElem.setAttribute('src', scope.trust(scope.src));

    scope.$watch('playing', (isPlaying) => {
      if (!scope.videoElem.play && !scope.videoElem.pause) return;
      isPlaying ? scope.videoElem.play() : scope.videoElem.pause();
    }, true);
  }
}
