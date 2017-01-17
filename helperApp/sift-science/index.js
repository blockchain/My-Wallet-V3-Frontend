const modules = [
  'ngSanitize',
  'ngRoute'
];

import MainController from './main.controller';
import SiftController from './sift.controller';
import RoutesConfig from './routes.config';

angular
  .module('sift', modules)
  .controller('MainController', MainController)
  .controller('SiftController', SiftController)
  .config(RoutesConfig);
