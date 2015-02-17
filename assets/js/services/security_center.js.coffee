angular.module("securityCenter", []).factory "SecurityCenter", ($log, Wallet, $rootScope, filterFilter) -> 
  settings = Wallet.settings
  user = Wallet.user
  status = Wallet.status
  # transactions = Wallet.transactions
  # legacyAddresses = []
  # unfilteredLegacyAddresses = Wallet.legacyAddresses
  
  service = {
    security: {
      level: null
    }
  }

  # Legacy addresses are no longer considered for the security level  
  # # Check for any level:
  # $rootScope.$watch(
  #   () -> status.legacyAddressBalancesLoaded,
  #   () ->
  #     if legacyAddresses.length == 0 && status.legacyAddressBalancesLoaded == true
  #       for address in filterFilter(filterFilter(unfilteredLegacyAddresses, {active: true, isWatchOnlyLegacyAddress: false}), greaterThan('balance', 50000))
  #         legacyAddresses.push address
  #     updateLevel()
  # )
 
  
  # Check for upgrade to level 1:
  $rootScope.$watch(
    () -> user.isEmailVerified  + status.didConfirmRecoveryPhrase + user.passwordHint,
    () -> 
      updateLevel()
  )
  
  # Check for upgrade to level 2:
  $rootScope.$watch(
    () -> settings.needs2FA + user.isMobileVerified,
    () -> 
      updateLevel()
  )

  # Check for upgrade to level 3 (settings):
  $rootScope.$watch(
    () -> settings.blockTOR,
    () -> 
      updateLevel()
  )
  
  # # Check for upgrade to level 3 (transactions that might sweep legacy addresses)
  # $rootScope.$watchCollection(
  #   () -> transactions,
  #   () ->
  #     updateLevel()
  # )
  
  # greaterThan = (prop, val) ->
  #   (item) ->
  #     if item[prop] > val
  #       true
  #
  # The user may perform these steps in any order, so we need to check for all levels after each change:
  updateLevel = () ->
    # if !status.legacyAddressBalancesLoaded
    #   service.security.level = null
    #   return
        
    service.security.level = 0
    if user.isEmailVerified && status.didConfirmRecoveryPhrase && user.passwordHint
      service.security.level = 1

      if settings.needs2FA && user.isMobileVerified 
        service.security.level = 2

        if settings.blockTOR
          # addrs = filterFilter(legacyAddresses, {active: true, isWatchOnlyLegacyAddress: false})
          #
          # for address in addrs
          #   return unless address.balance < 50000 # Allow small amounts

          service.security.level = 3
  
  return service