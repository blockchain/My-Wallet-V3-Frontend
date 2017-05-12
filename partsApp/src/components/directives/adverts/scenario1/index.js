// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import Mocks from './scenario1.mocks.js';
import Scenario1 from './scenario1.component.js';
// External resources
import 'walletJs/walletDirectives.js';
import 'walletJs/directives/adverts.directive.js';
import 'walletJs/templates.js';

const modules = [
  uiRouter,
  ngResource,
  'templates-main',
  'walletDirectives'
];

export default angular
  .module('app.directives.adverts.scenario1', modules)
  .factory('Adverts', Mocks.Adverts)
  .factory('Env', Mocks.Env)
  .component('advertsScenario1', Scenario1)
  .name;
