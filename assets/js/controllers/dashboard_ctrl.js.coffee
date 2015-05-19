@DashboardCtrl = ($scope, Wallet, $log) ->

	$scope.accounts = Wallet.accounts
	$scope.status = Wallet.status

	$scope.setPaymentRequestURL = (address, amount) ->
    $scope.paymentRequestAddress = address
    $scope.paymentRequestURL = "bitcoin:" + address
    if amount? && amount > 0
      $scope.paymentRequestURL += "?amount=" + numeral(amount).divide(100000000)

  $scope.$watch 'accounts', (accts) ->
  	if accts[0]?
  		defaultAcctIdx = Wallet.getDefaultAccountIndex()
  		receiveAddress = Wallet.getReceivingAddressForAccount(defaultAcctIdx)
  		$scope.setPaymentRequestURL(receiveAddress)