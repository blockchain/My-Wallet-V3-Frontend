// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import routes from './adverts.routes.js';
import AdvertsPage from './adverts.component.js';
import Mocks from './adverts.mocks.js';
// External resources
import ScenarioMenu from 'shared/scenarioMenu';
// Wallet resources
import 'walletJs/walletDirectives.js';
import 'walletJs/templates.js';
import 'walletJs/directives/adverts.directive.js';

const modules = [
  uiRouter,
  ngResource,
  ScenarioMenu,
  'walletDirectives',
  'templates-main'
];

export default angular
  .module('app.directives.adverts', modules)
  .config(routes)
  .factory('Adverts', Mocks.Adverts)
  .factory('Env', Mocks.Env)
  .component('advertsPage', AdvertsPage)
  .name;
