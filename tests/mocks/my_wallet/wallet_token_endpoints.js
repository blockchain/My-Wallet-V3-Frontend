angular.module('walletApp.core').factory('WalletTokenEndpoints', () =>
    ({
      verifyEmail(token){
        return {
          then(callback) {
            if (token === "token") {
              callback({success: true, guid: "1234"});
            }
            return {
              catch(callback) {
                if (token === "wrong-token") {
                  callback({success: false, error: ""});
                }
                return {
                };
              }
          };
          }
        };
      },

      unsubscribe(token){
        return {
          then(callback) {
            if (token === "token") {
              callback({success: true, guid: "1234"});
            }
            return {
              catch(callback) {
                if (token === "wrong-token") {
                  callback({success: false, error: ""});
                }
                return {
                };
              }
          };
          }
        };
      },

      resetTwoFactor(token){
        return {
          then(callback) {
            if (token === "token") {
              callback({success: true, guid: "1234"});
            }
            return {
              catch(callback) {
                if (token === "wrong-token") {
                  callback({success: false, error: ""});
                }
                return {
                };
              }
          };
          }
        };
      },

      authorizeApprove(token) {
        return {
          then(callback) {
            if (token === "token") {
              callback({success: true, guid: "1234"});
            } else if (token === "token-other-browser") {
              callback({success: null});
            }
            return {
              catch(callback) {
                if (token === "wrong-token") {
                  callback({success: false, error: ""});
                }
                return {
                };
              }
          };
          }
        };
      }
    })
);
