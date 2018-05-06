angular.module('walletApp.core').factory('WalletNetwork', () =>
  ({
    resendTwoFactorSms () {
      return {
        then (callback) {
          callback();
          return {
            catch (callback) {
              if (false) {
                callback();
                return {
                };
              }
            }
          };
        }
      };
    }
  })
);
