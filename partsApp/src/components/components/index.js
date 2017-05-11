// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import routes from './components.routes.js';
import Components from './components.component.js';

const modules = [
  uiRouter,
  ngResource
];

export default angular
  .module('app.components', modules)
  .config(routes)
  .component('components', Components)
  .name;
