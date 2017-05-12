// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import ScenarioMenu from './scenarioMenu.component.js';

const modules = [
  uiRouter,
  ngResource
];

export default angular
  .module('app.shared.scenarioMenu', modules)
  .component('scenarioMenu', ScenarioMenu)
  .name;
