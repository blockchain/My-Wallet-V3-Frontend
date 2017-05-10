import './app.scss';

import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';

import routing from './app.routes.js';
import Adverts from 'components/adverts';
import Components from 'components/components';
import Directives from 'components/directives';
import Home from 'components/home';

const modules = [
  uiRouter,
  Adverts,
  Home,
  Components,
  Directives
];

angular
  .module('app', modules)
  .config(routing);
