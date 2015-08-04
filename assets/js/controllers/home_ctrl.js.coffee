walletApp.controller "HomeCtrl", ($scope, $window, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  $scope.status = Wallet.status
  $scope.transactions = []

  $scope.accountLabels = () ->
    $scope.accounts().map (account) -> account.label

  $scope.accountBalances = () ->
    $scope.accounts().map (account) -> account.balance

  $scope.getRandDyk = () ->
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
      text: 'When the bitcoin network is experiencing a lot of traffic, you can ensure that your transactions go through by enabling higher fees with our Advanced Send feature. Just click on the Advanced Send toggle in our Send screen to get started!'
      icon: 'ti-signal'
      linkText: ''
      link: ''
    },
    {
      title: 'Passwords are not stored or shared with us?'
      type: 'Feature'
      text: 'This means only you know the password you used for your wallet, but your funds can still be recovered with the 12-word recovery phrase. Find out how and more by visiting our'
      icon: 'ti-lock'
      linkText: 'Security Center'
      link: '/#/security-center'
    }
  ]
