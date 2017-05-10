import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';

import GridNavigationComponent from './gridNavigation.component.js';

const modules = [
  uiRouter,
  ngResource
];

export default angular
  .module('app.components.gridNavigation', modules)
  .component('gridNavigation', GridNavigationComponent)
  .name;
