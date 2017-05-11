// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import routes from './adverts.routes.js';
import Adverts from './adverts.component.js';
// External resources

const modules = [
  uiRouter,
  ngResource
];

export default angular
  .module('app.directives.adverts', modules)
  .config(routes)
  .component('adverts', Adverts)
  .name;
