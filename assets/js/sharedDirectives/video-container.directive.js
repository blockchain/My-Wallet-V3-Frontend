angular
  .module('shared')
  .directive('videoContainer', videoContainer);

videoContainer.$inject = ['$window', '$timeout', '$sce'];

function videoContainer ($window, $timeout) {
  const directive = {
    restrict: 'E',
    template: `
    <div ng-click="load(); toggle();" ng-class="{'playing': playing}" class="video-container center"><img class="imag-prev" ng-src="{{::img}}" ng-class="{'transparent': playing}"/><img src="img/spinner.gif" class="loading"/>
      <video ng-src="{{ ngSrc }}" type="video/mp4"></video>
    </div>
    `,
    replace: true,
    scope: {
      ngSrc: '=',
      img: '@',
      class: '@'
    },
    link: link
  };

  return directive;

  function link (scope, elem, attrs) {
    scope.videoElem = elem.find('video')[0];

    scope.toggle = () => scope.playing = !scope.playing;

    scope.$watch('playing', (isPlaying) => {
      if (!scope.videoElem.play && !scope.videoElem.pause) return;
      isPlaying ? scope.videoElem.play() : scope.videoElem.pause();
    }, true);
  }
}
