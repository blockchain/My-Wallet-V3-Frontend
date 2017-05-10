// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import routes from './components.routes.js';
import ComponentsController from './components.controller.js';

const modules = [
  uiRouter,
  ngResource
];

export default angular
  .module('app.pages.components', modules)
  .config(routes)
  .controller('ComponentsController', ComponentsController)
  .name;
