@TransactionCtrl = ($scope, Wallet, $log, $stateParams, $filter, $cookieStore, $sce) ->
  window.scrollTo(0, 0);
  #################################
  #           Private             #
  #################################

  $scope.didLoad = () ->
    $scope.addressBook = Wallet.addressBook
    $scope.status    = Wallet.status
    $scope.settings = Wallet.settings
    $scope.accountIndex = $stateParams.accountIndex

    $scope.transactions = Wallet.transactions
    $scope.accounts = Wallet.accounts

    $scope.from = ""
    $scope.to = ""

    $scope.transaction = {} # {from_account: null, to_account: null, from_address: null, to_address: null}

    $scope.$watchCollection "transactions", (newVal) ->
      transaction = $filter("getByProperty")("hash", $stateParams.hash, newVal)
      $scope.transaction = transaction
      return

    $scope.$watch "transaction.hash + accounts", () ->
      tx = $scope.transaction
      if tx? && tx.hash && $scope.accounts.length > 0
        if tx.from.account?
          $scope.from = $scope.accounts[tx.from.account.index].label
        else
          if tx.from.legacyAddresses? && tx.from.legacyAddresses.length > 0
            address = $filter("getByProperty")("address", tx.from.legacyAddresses[0].address, Wallet.legacyAddresses)
            if address.label != address.address
              $scope.from = address.label
            else
              $scope.from = address.address + " (you)"
          else if tx.from.externalAddresses?
            $scope.from = Wallet.addressBook[tx.from.externalAddresses.addressWithLargestOutput]
            unless $scope.from
              $scope.from = tx.from.externalAddresses.addressWithLargestOutput

        $scope.destinations = []
        # $scope.destinations.push {"address": "mi add", "amount": 123}
        # $scope.destinations.push {"address": "mi addfdsf", "amount": 1234324}

        if tx.to.account?
          accountLabel = $scope.accounts[tx.to.account.index].label
          $scope.destinations.push {"address": accountLabel, "amount": ""}
        else
          convert = (y) -> " [" + $filter("btc")(y) + "]"
          label = (a) ->
            address = $filter("getByProperty")("address", a, Wallet.legacyAddresses)
            res = if address.label != address.address then address.label else address.address
            "(you) " + res
          adBook = (a) ->
            name = Wallet.addressBook[a]
            if name then name else a
          makeRow = (name,a) -> {"address": name(a.address), "amount": convert(a.amount)}

          if tx.to.legacyAddresses?   then l = tx.to.legacyAddresses   else l = []
          if tx.to.externalAddresses? then e = tx.to.externalAddresses else e = []
          $scope.destinations = l.map(makeRow.bind(undefined, label)).concat e.map(makeRow.bind(undefined, adBook))
          if $scope.destinations.length is 1 then $scope.destinations[0].amount = ""

  # First load:
  $scope.didLoad()
