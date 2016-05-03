angular
  .module('walletApp.core')
  .factory 'MyWalletHelpers', () ->
    {
      tor: () ->
        false
      privateKeyCorrespondsToAddress: () ->
        $q.resolve(true)
    }
