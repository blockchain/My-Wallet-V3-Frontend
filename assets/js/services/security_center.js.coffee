walletServices = angular.module("securityCenter", [])
walletServices.factory "SecurityCenter", ($log, Wallet, $rootScope, filterFilter) -> 
  settings = Wallet.settings
  user = Wallet.user
  status = Wallet.status
  transactions = Wallet.transactions
  legacyAddresses = []
  unfilteredLegacyAddresses = Wallet.legacyAddresses
  
  service = {
    security: {
      level: null
    }
  }
  
  # Check for any level:
  $rootScope.$watch(
    () -> status.legacyAddressBalancesLoaded,
    () -> 
      if legacyAddresses.length == 0 && status.legacyAddressBalancesLoaded == true
        for address in filterFilter(filterFilter(unfilteredLegacyAddresses, {active: true, isWatchOnlyLegacyAddress: false}), greaterThan('balance', 50000))
          legacyAddresses.push address
      updateLevel()
  )
 
  
  # Check for upgrade to level 1:
  $rootScope.$watch(
    () -> user.isEmailVerified,
    () -> 
      updateLevel()
  )
  
  # Check for upgrade to level 2:
  $rootScope.$watch(
    () -> settings.needs2FA + user.isMobileVerified + status.didConfirmRecoveryPhrase,
    () -> 
      updateLevel()
  )

  # Check for upgrade to level 3 (settings):
  $rootScope.$watch(
    () -> settings.secondPassword + settings.blockTOR,
    () -> 
      updateLevel()
  )
  
  # Check for upgrade to level 3 (transactions that might sweep legacy addresses)
  $rootScope.$watchCollection(
    () -> transactions,
    () -> 
      updateLevel()
  )
  
  greaterThan = (prop, val) ->
    (item) ->
      if item[prop] > val
        true 
  
  # The user may perform these steps in any order, so we need to check for all levels after each change:
  updateLevel = () ->
    if !status.legacyAddressBalancesLoaded
      service.security.level = null 
      return
        
    service.security.level = 0
    if user.isEmailVerified
      service.security.level = 1

      if settings.needs2FA && user.isMobileVerified && status.didConfirmRecoveryPhrase
        service.security.level = 2

        if settings.blockTOR && settings.secondPassword
          addrs = filterFilter(legacyAddresses, {active: true, isWatchOnlyLegacyAddress: false})

          for address in addrs
            return unless address.balance < 50000 # Allow small amounts

          service.security.level = 3
  
  return service