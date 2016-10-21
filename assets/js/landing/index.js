
// import angular from 'angular';
import uib from 'angular-ui-bootstrap';

import LandingController from './landing.controller';
import publicHeader from './public-header.directive';
import videoContainer from './video-container.directive';

export default angular.module('walletApp.landing', [uib])
  .controller('LandingController', LandingController)
  .directive('publicHeader', publicHeader)
  .directive('videoContainer', videoContainer)
  .name;
