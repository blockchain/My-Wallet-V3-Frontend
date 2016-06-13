angular
  .module('walletApp.core')
  .factory 'MyWalletHelpers', () ->
    {
      tor: () ->
        false
      privateKeyCorrespondsToAddress: () ->
        $q.resolve(true)
      scorePassword: (pw) ->
        (pw && pw.length || 0) * 25
      memoize: (f) -> f
    }
