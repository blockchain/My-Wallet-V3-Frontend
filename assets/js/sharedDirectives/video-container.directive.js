angular
  .module('sharedDirectives')
  .directive('videoContainer', videoContainer);

videoContainer.$inject = ['$window', '$timeout', '$sce'];

function videoContainer ($window, $timeout, $sce) {
  const directive = {
    restrict: 'E',
    template: `
    <div ng-click="load(); toggle();" ng-class="{'playing': playing}" class="video-container center"><img class="imag-prev" ng-src="{{::img}}" ng-class="{'transparent': playing}"/><img src="img/spinner.gif" class="loading"/>
      <video src="" type="video/mp4"></video>
    </div>
    `,
    replace: true,
    scope: {},
    link: link
  };

  return directive;

  function link (scope, elem, attrs) {
    scope.img = attrs['img'];
    scope.src = attrs['src'];
    scope.class = attrs['class'];
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
