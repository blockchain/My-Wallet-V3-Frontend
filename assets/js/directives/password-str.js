'use strict';

angular.module('passwordStr', []);

angular.module('passwordStr', []).
    directive('passwordStr', function () {
        return {
            restrict: 'A',
            template: '<div class="progress">\
                         <div class="progress-bar {{colorBar}}" \
                              role="progressbar" \
                              aria-valuenow="60" \
                              aria-valuemin="0" \
                              aria-valuemax="100" \
                              style="width: {{entropy(password)}}%;"> \
                                       {{veredict(H)}} \
                         </div>\
                        </div>',
            controller: ['$scope',
              function($scope){
                $scope.colorBar = "progress-bar-danger";
                $scope.H = 0;

                var hasLowerCase = function (str){
                    return (/[a-z]/.test(str));
                }
                var hasUpperCase = function (str){
                    return (/[A-Z]/.test(str));
                }
                var hasNumbers = function (str){
                    return (/[0-9]/.test(str));
                }
                var hasPunctuation = function (str){
                    return (/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(str));
                }

                $scope.entropy = function(pass) {
                  var base = 0;
                  if (hasLowerCase(pass)) {
                    base += 26;
                  }
                  if (hasUpperCase(pass)) {
                    base += 26;
                  }
                  if (hasNumbers(pass)) {
                    base += 10;
                  }
                  if (hasPunctuation(pass)) {
                    base += 30;
                  }
                  $scope.H = Math.log2(Math.pow(base, pass.length));
                  if ($scope.H > 100) {$scope.H = 100};
                  return $scope.H;         
                };

                $scope.veredict = function(H) {
                    var message = "Weak";
                    switch (true) {
                        case (H <= 20):
                            var message = "Very weak";
                            $scope.colorBar = "progress-bar-danger"
                            break;
                        case (H > 20 && H <= 40):
                            var message = "Weak";
                            $scope.colorBar = "progress-bar-danger"
                            break;
                        case (H > 40 && H <= 60):
                            var message = "Medium";
                            $scope.colorBar = "progress-bar-info"
                            break;
                        case (H > 60 && H <= 80):
                            var message = "Strong";
                            $scope.colorBar = "progress-bar-success"
                            break;
                        case (H > 80):
                            var message = "Very strong";
                            $scope.colorBar = "progress-bar-success"
                            break;
                        default:
                            var message = "Impossible";
                            $scope.colorBar = "progress-bar-danger"
                            break;
                    }
                    return message;        
                };
              }
            ],
            scope: {
                 password: '@',
            }
        };

    });
