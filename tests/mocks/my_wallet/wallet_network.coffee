angular.module('walletApp.core').factory 'WalletNetwork', () ->
  then: (cb) -> cb({
    resendTwoFactorSms: ()->
      {
        then: (callback) ->
          callback()
          {
            catch: (callback) ->
              if false
                callback()
                {
                }
        }
      }
  })
