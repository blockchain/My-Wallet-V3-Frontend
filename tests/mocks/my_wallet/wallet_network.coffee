angular.module('walletApp.core').factory 'WalletNetwork', () ->
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
