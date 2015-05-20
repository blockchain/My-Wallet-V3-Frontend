@FeedbackCtrl = ($scope, Wallet, $log) ->
 
  # WebInfo string (most likely unnecessary):
  #'*Location*: file:///Users/Justin/Documents/Projects/JIRAForm/index.html *User-Agent*: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36 *Screen Resolution*: 2560 x 1440'
  $scope.webInfo = ''