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
      getMobileOperatingSystem: () ->
        'unknown'
      guidToGroup: (uid) ->
        if uid[0] == 'a' then 'a' else 'b'
    }
