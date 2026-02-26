angular.module('ngAudio', [])
.factory('ngAudioObject', [ function () {
  return function (id) {
    this.id = id;

    this.play = function () {
      return;
    };

    this.pause = function () {
      return;
    };

    this.restart = function () {
      return;
    };

    this.stop = function () {
      return;
    };

    this.setVolume = function (volume) {
      return;
    };

    this.setMuting = function (muting) {
      return;
    };

    this.setProgress = function (progress) {
      return;
    };

    this.setCurrentTime = function (currentTime) {
      return;
    };
  };
}])
.service('ngAudio', ['ngAudioObject', function (ngAudioObject) {
  this.play = function (id) {
    var audio = new ngAudioObject(id); // eslint-disable-line new-cap
    audio.play();
    return audio;
  };

  this.load = function (id) {
    return new ngAudioObject(id); // eslint-disable-line new-cap
  };

  this.mute = function () {
    return;
  };

  this.unmute = function () {
    return;
  };

  this.toggleMute = function () {
    return;
  };
}]);
