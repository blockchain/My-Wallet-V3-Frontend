angular.module('walletApp.core').factory 'WalletTokenEndpoints', () ->
  service = {
    verifyEmail: (token)->
      {
        then: (callback) ->
          if token == "token"
            callback({success: true, guid: "1234"})
          {
            catch: (callback) ->
              if token == "wrong-token"
                callback({success: false, error: ""})
              {
              }
        }
      }

    unsubscribe: (token)->
      {
        then: (callback) ->
          if token == "token"
            callback({success: true, guid: "1234"})
          {
            catch: (callback) ->
              if token == "wrong-token"
                callback({success: false, error: ""})
              {
              }
        }
      }

    resetTwoFactor: (token)->
      {
        then: (callback) ->
          if token == "token"
            callback({success: true, guid: "1234"})
          {
            catch: (callback) ->
              if token == "wrong-token"
                callback({success: false, error: ""})
              {
              }
        }
      }

    authorizeApprove: (token) ->
      {
        then: (callback) ->
          if token == "token"
            callback({success: true, guid: "1234"})
          else if token == "token-other-browser"
            callback({success: null})
          {
            catch: (callback) ->
              if token == "wrong-token"
                callback({success: false, error: ""})
              {
              }
        }
      }
  }
  {
    then: (cb) -> cb(service)
  }
