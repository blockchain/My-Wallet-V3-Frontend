// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import Mocks from './scenario2.mocks.js';
import Scenario2 from './scenario2.component.js';
// External resources
import 'walletJs/directives/adverts.directive.js';
import 'walletJs/walletDirectives.js';
import 'walletJs/templates.js';

const modules = [
  uiRouter,
  ngResource,
  'templates-main',
  'walletDirectives'
];

export default angular
  .module('app.directives.adverts.scenario2', modules)
  .factory('Adverts', Mocks.Adverts)
  .factory('Env', Mocks.Env)
  .component('advertsScenario2', Scenario2)
  .name;
