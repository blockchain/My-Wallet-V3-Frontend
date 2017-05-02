const modules = [
  'ngSanitize',
  'ngRoute'
];

import MainController from './main.controller';
import AnalyticsController from './analytics.controller';
import RoutesConfig from './routes.config';

angular
  .module('google', modules)
  .controller('MainController', MainController)
  .controller('AnalyticsController', AnalyticsController)
  .config(RoutesConfig);
