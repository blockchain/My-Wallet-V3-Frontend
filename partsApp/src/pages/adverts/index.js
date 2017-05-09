import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';

import routes from './adverts.routes.js';
import AdvertsController from './adverts.controller.js';

import headerDirective from 'components/header';

const modules = [
  uiRouter,
  ngResource,
  headerDirective
];

console.log(routes);

export default angular
  .module('app.pages.adverts', modules)
  .config(routes)
  .controller('AdvertsController', AdvertsController)
  .name;
