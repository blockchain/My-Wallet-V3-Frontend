// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import routes from './activity-feed.routes.js';
import ActivityFeedPage from './activity-feed.component.js';
import Mocks from './activity-feed.mocks.js';
// External resources
import ScenarioMenu from 'shared/scenarioMenu';
// Wallet resources
import 'walletJs/walletDirectives.js';
import 'walletJs/templates.js';
import 'walletJs/directives/activity-feed.directive.js';
import 'walletImg/spinner.gif';

const modules = [
  uiRouter,
  ngResource,
  ScenarioMenu,
  'walletDirectives',
  'templates-main'
];

export default angular
  .module('app.directives.activity-feed', modules)
  .config(routes)
  .factory('Activity', Mocks.Activity)
  .factory('Wallet', Mocks.Wallet)
  .factory('MyWallet', Mocks.MyWallet)
  .factory('buyStatus', Mocks.buyStatus)
  .component('activityFeedPage', ActivityFeedPage)
  .name;
