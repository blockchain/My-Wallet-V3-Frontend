// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import routes from './adverts.routes.js';
import Adverts from './adverts.component.js';
import AdvertsScenario1 from './scenario1';
import AdvertsScenario2 from './scenario2';
// External resources
import ScenarioMenu from 'shared/scenarioMenu';

const modules = [
  uiRouter,
  ngResource,
  ScenarioMenu,
  AdvertsScenario1,
  AdvertsScenario2
];

export default angular
  .module('app.directives.adverts', modules)
  .config(routes)
  .component('advertsPage', Adverts)
  .name;
