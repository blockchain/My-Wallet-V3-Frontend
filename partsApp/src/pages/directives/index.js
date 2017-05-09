import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';

import routes from './directives.routes.js';
import DirectivesController from './directives.controller.js';

import gridNavigationDirective from 'components/gridNavigation';
import headerDirective from 'components/header';

const modules = [
  uiRouter,
  ngResource,
  gridNavigationDirective,
  headerDirective
];

export default angular
  .module('app.pages.directives', modules)
  .config(routes)
  .controller('DirectivesController', DirectivesController)
  .name;
