walletApp.controller "HomeCtrl", ($scope, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  $scope.status = Wallet.status
  $scope.transactions = []

  $scope.dykSelected = false

  $scope.accountLabels = () ->
    $scope.accounts().map (account) -> account.label

  $scope.accountBalances = () ->
    $scope.accounts().map (account) -> account.balance

  $scope.getRandDyk = () ->
    $scope.dykSelected = true
    $scope.dyks[$scope.getRandInRange(0, $scope.dyks.length - 1)]

  $scope.getRandInRange = (min, max) ->
    Math.floor(Math.random() * (max - min + 1) + min)

  # Watchers
  $scope.$watch 'status.didLoadTransactions', (didLoad) ->
    $scope.transactions = Wallet.transactions if didLoad

  # Modals
  $scope.newAccount = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/account-form.jade"
      controller: "AccountFormCtrl"
      resolve:
        account: -> undefined
      windowClass: "bc-modal"
    )

  if $scope.status.firstTime
    modalInstance = $modal.open(
      templateUrl: "partials/first-login-modal.jade"
      controller: "FirstTimeCtrl"
      resolve:
        firstTime: ->
          Wallet.status.firstTime = false
      windowClass: "bc-modal rocket-modal"
    )

  # Did You Know? data
  $scope.dyks = [
    {
      title: 'You can send Custom Fees?'
      type: 'Feature'
      text: 'When the bitcoin network is experiencing a lot of traffic, you can ensure that your transactions go through by enabling higher fees with our Custom Send feature. Higher fees allow miners to confirm your transactions faster - giving you peace of mind that your transactions go through.'
      link: '#'
    }
  ]
