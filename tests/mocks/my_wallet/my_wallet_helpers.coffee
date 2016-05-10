angular
  .module('walletApp.core')
  .factory 'MyWalletHelpers', () ->
    {
      then: (cb) -> cb({
        tor: () ->
          false
        privateKeyCorrespondsToAddress: () ->
          $q.resolve(true)
        scorePassword: (pw) ->
          (pw && pw.length || 0) * 25
      })
    }
