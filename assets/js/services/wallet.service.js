'use strict';

// MyWallet hacks

// Don't allow it to play sound
function playSound(id) {}

angular
  .module('walletServices', [])
  .factory('Wallet', Wallet);

Wallet.$inject = ['$http', '$window', '$timeout', 'Alerts', 'MyWallet', 'MyBlockchainApi', 'MyBlockchainSettings', 'MyWalletStore', 'MyWalletPayment', '$rootScope', 'ngAudio', '$cookieStore', '$translate', '$filter', '$state', '$q', 'bcPhoneNumber'];

function Wallet($http, $window, $timeout, Alerts, MyWallet, MyBlockchainApi, MyBlockchainSettings, MyWalletStore, MyWalletPayment, $rootScope, ngAudio, $cookieStore, $translate, $filter, $state, $q, bcPhoneNumber) {
  const wallet = {
    goal: {
      auth: false
    },
    status: {
      isLoggedIn: false,
      didUpgradeToHd: null,
      didInitializeHD: false,
      didLoadSettings: false,
      didLoadTransactions: false,
      didLoadBalances: false,
      didConfirmRecoveryPhrase: false
    },
    settings: {
      currency: null,
      displayCurrency: null,
      language: null,
      btcCurrency: null,
      needs2FA: null,
      twoFactorMethod: null,
      feePerKB: null,
      handleBitcoinLinks: false,
      blockTOR: null,
      rememberTwoFactor: null,
      secondPassword: null,
      ipWhitelist: null,
      apiAccess: null,
      restrictToWhitelist: null,
      loggingLevel: null
    },
    user: {
      current_ip: null,
      email: null,
      mobile: null,
      passwordHint: '',
      internationalMobileNumber: null
    }
  };
  wallet.fiatHistoricalConversionCache = {};
  wallet.conversions = {};
  wallet.paymentRequests = [];
  wallet.my = MyWallet;
  wallet.settings_api = MyBlockchainSettings;
  wallet.store = MyWalletStore;
  wallet.api = MyBlockchainApi;
  wallet.payment = MyWalletPayment;
  wallet.transactions = [];
  wallet.languages = [];
  wallet.currencies = [];
  wallet.btcCurrencies = [
    {
      serverCode: 'BTC',
      code: 'BTC',
      conversion: 100000000
    }, {
      serverCode: 'MBC',
      code: 'mBTC',
      conversion: 100000
    }, {
      serverCode: 'UBC',
      code: 'bits',
      conversion: 100
    }
  ];

  wallet.api_code = '1770d5d9-bcea-4d28-ad21-6cbd5be018a8';
  wallet.store.setAPICode(wallet.api_code);

  wallet.login = function (uid, password, two_factor_code, needsTwoFactorCallback, successCallback, errorCallback) {
    let didLogin = function () {
      wallet.status.isLoggedIn = true;
      wallet.status.didUpgradeToHd = wallet.my.wallet.isUpgradedToHD;
      if (wallet.my.wallet.isUpgradedToHD) {
        wallet.status.didConfirmRecoveryPhrase = wallet.my.wallet.hdwallet.isMnemonicVerified;
      }
      wallet.user.uid = uid;
      wallet.settings.secondPassword = wallet.my.wallet.isDoubleEncrypted;
      wallet.settings.pbkdf2 = wallet.my.wallet.pbkdf2_iterations;
      wallet.settings.logoutTimeMinutes = wallet.my.wallet.logoutTime / 60000;
      if (wallet.my.wallet.isUpgradedToHD && !wallet.status.didInitializeHD) {
        wallet.status.didInitializeHD = true;
      }
      wallet.settings_api.get_account_info(function (result) {
        $window.name = 'blockchain-' + result.guid;
        wallet.settings.ipWhitelist = result.ip_lock || '';
        wallet.settings.restrictToWhitelist = result.ip_lock_on;
        wallet.settings.apiAccess = result.is_api_access_enabled;
        wallet.settings.rememberTwoFactor = !result.never_save_auth_type;
        wallet.settings.needs2FA = result.auth_type !== 0;
        wallet.settings.twoFactorMethod = result.auth_type;
        wallet.settings.loggingLevel = result.logging_level;
        wallet.user.email = result.email;
        wallet.user.current_ip = result.my_ip;
        wallet.status.currentCountryCode = result.country_code;
        if (result.sms_number) {
          wallet.user.mobile = {
            country: result.sms_number.split(' ')[0],
            number: result.sms_number.split(' ')[1]
          };
          wallet.user.internationalMobileNumber = bcPhoneNumber.format(result.sms_number);
        } else {
          wallet.user.mobile = {
            country: '+' + result.dial_code,
            number: ''
          };
          wallet.user.internationalMobileNumber = '+' + result.dial_code;
        }
        wallet.settings.notifications = result.notifications_type && result.notifications_type.length > 0 && result.notifications_type.indexOf(1) > -1 && result.notifications_on > 0;
        wallet.user.isEmailVerified = result.email_verified;
        wallet.user.isMobileVerified = result.sms_verified;
        wallet.user.passwordHint = result.password_hint1;
        wallet.setLanguage($filter('getByProperty')('code', result.language, wallet.languages));
        wallet.settings.currency = $filter('getByProperty')('code', result.currency, wallet.currencies);
        wallet.settings.btcCurrency = $filter('getByProperty')('serverCode', result.btc_currency, wallet.btcCurrencies);
        wallet.settings.displayCurrency = wallet.settings.btcCurrency;
        wallet.settings.feePerKB = wallet.my.wallet.fee_per_kb;
        wallet.settings.blockTOR = !!result.block_tor_ips;
        wallet.status.didLoadSettings = true;
        if (wallet.my.wallet.isUpgradedToHD) {
          let didFetchTransactions = function () {
            console.log('%cStop!', 'color:white; background:red; font-size: 16pt');
            console.log('%cThis browser feature is intended for developers. If someone told you to copy-paste something here, it is a scam and will give them access to your money!', 'font-size: 14pt');
            wallet.status.didLoadBalances = true;
            wallet.updateTransactions();
          };
          wallet.my.wallet.getHistory().then(didFetchTransactions);
        }
        wallet.applyIfNeeded();
      });
      if (successCallback != null) {
        successCallback();
      }
      wallet.applyIfNeeded();
    };

    let needsTwoFactorCode = function (method) {
      Alerts.displayWarning('Please enter your 2FA code');
      wallet.settings.needs2FA = true;
      // 2: Email
      // 3: Yubikey
      // 4: Google Authenticator
      // 5: SMS

      needsTwoFactorCallback();

      wallet.settings.twoFactorMethod = method;
      wallet.applyIfNeeded();
    };

    let wrongTwoFactorCode = function (message) {
      errorCallback('twoFactor', message);
      wallet.applyIfNeeded();
    };

    let loginError = function (error) {
      console.log(error);
      if (error.indexOf('Unknown Wallet Identifier') > -1) {
        errorCallback('uid', error);
      } else if (error.indexOf('password') > -1) {
        errorCallback('password', error);
      } else {
        Alerts.displayError(error, true);
        errorCallback();
      }
      wallet.applyIfNeeded();
    };
    if (two_factor_code != null && two_factor_code !== '') {
      wallet.settings.needs2FA = true;
    } else {
      two_factor_code = null;
    }

    let authorizationProvided = function () {
      wallet.goal.auth = true;
      wallet.applyIfNeeded();
    };

    let authorizationRequired = function (callback) {
      callback(authorizationProvided());
      Alerts.displayWarning('Please check your email to approve this login attempt.', true);
      wallet.applyIfNeeded();
    };

    let betaCheckFinished = function () {
      $window.root = 'https://blockchain.info/';
      wallet.my.login(
        uid,
        null, // sharedKey
        password,
        two_factor_code,
        didLogin,
        needsTwoFactorCode,
        wrongTwoFactorCode,
        authorizationRequired,
        loginError,
        function fetchSuccess() {},
        function decryptSuccess() {},
        function buildHDSuccess() {}
      );
      wallet.fetchExchangeRate();
    };

    // If BETA=1 is set in .env then in index.html/jade $rootScope.beta is set.
    if ($rootScope.beta) {
      $http.post('/check_guid_for_beta_key', {
        guid: uid
      }).success(function (data) {
        if (data.verified) {
          betaCheckFinished();
        } else {
          if (data.error && data.error.message) {
            Alerts.displayError(data.error.message);
          }
          errorCallback();
        }
      }).error(function () {
        Alerts.displayError('Unable to verify your wallet UID.');
        errorCallback();
      });
    } else {
      betaCheckFinished();
    }
  };

  wallet.upgrade = function (successCallback, cancelSecondPasswordCallback) {
    let success = function () {
      wallet.status.didUpgradeToHd = true;
      wallet.status.didInitializeHD = true;
      wallet.my.wallet.getHistory().then(function () {
        wallet.status.didLoadBalances = true;
        wallet.updateTransactions();
      });
      successCallback();
      wallet.applyIfNeeded();
    };

    let error = function () {
      wallet.store.enableLogout();
      wallet.store.setIsSynchronizedWithServer(true);
      $window.location.reload();
    };

    let proceed = function (password) {
      $translate('FIRST_ACCOUNT_NAME').then(function (translation) {
        wallet.my.wallet.newHDWallet(translation, password, success, error);
      });
    };
    wallet.askForSecondPasswordIfNeeded()
      .then(proceed).catch(cancelSecondPasswordCallback);
  };

  wallet.legacyAddresses = function () {
    return wallet.my.wallet.keys;
  };

  let hdAddresses = {};
  wallet.hdAddresses = function (accountIdx) {
    return function (refresh) {
      refresh = refresh || null;
      if (refresh || hdAddresses[accountIdx] == null) {
        let account = wallet.accounts()[accountIdx];
        hdAddresses[accountIdx] = account.receivingAddressesLabels.map(function (address) {
          return {
            index: address.index,
            label: address.label,
            address: account.receiveAddressAtIndex(address.index),
            account: account
          };
        });
      }
      return hdAddresses[accountIdx];
    };
  };

  wallet.addAddressForAccount = function (account, successCallback, errorCallback) {
    let success = function () {
      wallet.hdAddresses(account.index)(true);
      successCallback();
      wallet.applyIfNeeded();
    };
    $translate('DEFAULT_NEW_ADDRESS_LABEL').then(function (translation) {
      account.setLabelForReceivingAddress(account.receiveIndex, translation)
        .then(success).catch(errorCallback);
    });
  };

  wallet.resendTwoFactorSms = function (uid, successCallback, errorCallback) {
    let success = function () {
      $translate('RESENT_2FA_SMS').then(Alerts.displaySuccess);
      successCallback();
      wallet.applyIfNeeded();
    };
    let error = function (e) {
      $translate('RESENT_2FA_SMS_FAILED').then(Alerts.displayError);
      errorCallback();
      wallet.applyIfNeeded();
    };
    wallet.my.resendTwoFactorSms(uid, success, error);
  };

  wallet.create = function (password, email, currency, language, success_callback) {
    let success = function (uid) {
      Alerts.displaySuccess('Wallet created with identifier: ' + uid, true);
      wallet.status.firstTime = true;

      let loginSuccess = function () {
        success_callback(uid);
      };

      let loginError = function (error) {
        console.log(error);
        Alerts.displayError('Unable to login to new wallet');
      };

      if ($rootScope.beta) {
        $http.post('/register_guid', {
          guid: uid,
          email: email
        }).success(function (data) {
          if (data.success) {
            wallet.login(uid, password, null, null, loginSuccess, loginError);
          } else {
            if (data.error && data.error.message) {
              Alerts.displayError(data.error.message);
            }
          }
        }).error(function () {
          Alerts.displayWarning('Unable to associate your new wallet with your invite code. Please try to login using your UID ' + uid + ' or register again.', true);
        });
      } else {
        wallet.login(uid, password, null, null, loginSuccess, loginError);
      }
    };

    let error = function (error) {
      if (error.message !== void 0) Alerts.displayError(error.message);
      else Alerts.displayError(error);
    };

    let currency_code = currency && currency.code || 'USD';
    let language_code = language && language.code || 'en';

    $translate('FIRST_ACCOUNT_NAME')
      .then(function (translation) {
        wallet.my.createNewWallet(
          email,
          password,
          translation,
          language_code,
          currency_code,
          success,
          error
        );
      });
  };

  wallet.askForSecondPasswordIfNeeded = function () {
    let defer = $q.defer();
    if (wallet.my.wallet.isDoubleEncrypted) {
      $rootScope.$broadcast('requireSecondPassword', defer);
    } else {
      defer.resolve(null);
    }
    return defer.promise;
  };

  wallet.saveActivity = function () {
    // TYPES: ['transactions', 'security', 'settings', 'accounts']
    $rootScope.$broadcast('updateActivityFeed');
  };

  let addressBook = void 0;
  wallet.addressBook = function (refresh) {
    let myAddressBook = wallet.my.wallet.addressBook;
    if (addressBook === void 0 || refresh) {
      addressBook = Object.keys(myAddressBook).map(function (key) {
        return {
          address: key,
          label: myAddressBook[key]
        };
      });
    }
    return addressBook;
  };

  wallet.removeAddressBookEntry = function (address) {
    wallet.my.wallet.removeAddressBookEntry(address.address);
    return wallet.addressBook(true);
  };

  wallet.createAccount = function (label, successCallback, errorCallback, cancelCallback) {
    let proceed = function (password) {
      let newAccount = wallet.my.wallet.newAccount(label, password);
      wallet.my.wallet.getHistory().then(wallet.updateTransactions);
      successCallback && successCallback();
    };
    wallet.askForSecondPasswordIfNeeded()
      .then(proceed).catch(cancelCallback);
  };

  wallet.renameAccount = function (account, name, successCallback, errorCallback) {
    account.label = name;
    successCallback();
  };

  wallet.fetchMoreTransactions = function (where, successCallback, errorCallback, allTransactionsLoadedCallback) {
    let success = function (res) {
      wallet.appendTransactions(res);
      successCallback();
      wallet.applyIfNeeded();
    };

    let error = function () {
      errorCallback();
      wallet.applyIfNeeded();
    };

    let allTransactionsLoaded = function () {
      allTransactionsLoadedCallback && allTransactionsLoadedCallback();
      wallet.applyIfNeeded();
    };

    if (where === '') {
      wallet.my.fetchMoreTransactionsForAll(success, error, allTransactionsLoaded);
    } else if (where === 'imported') {
      wallet.my.fetchMoreTransactionsForLegacyAddresses(success, error, allTransactionsLoaded);
    } else {
      wallet.my.fetchMoreTransactionsForAccount(parseInt(where), success, error, allTransactionsLoaded);
    }
  };

  wallet.changeLegacyAddressLabel = function (address, label, successCallback, errorCallback) {
    address.label = label;
    successCallback();
  };

  wallet.changeHDAddressLabel = function (accountIdx, index, label, successCallback, errorCallback) {
    let success = function () {
      wallet.hdAddresses(accountIdx)(true);
      successCallback();
      wallet.applyIfNeeded();
    };

    let error = function (msg) {
      errorCallback(msg);
      wallet.applyIfNeeded();
    };

    let account = wallet.accounts()[parseInt(accountIdx)];
    account.setLabelForReceivingAddress(index, label)
      .then(success).catch(error);
  };

  wallet.logout = function () {
    wallet.didLogoutByChoice = true;
    $window.name = 'blockchain';
    wallet.my.logout(true);
  };

  wallet.makePairingCode = function (successCallback, errorCallback) {
    let success = function (code) {
      successCallback(code);
      wallet.applyIfNeeded();
    };

    let error = function () {
      errorCallback();
      wallet.applyIfNeeded();
    };

    wallet.my.makePairingCode(success, error);
  };

  wallet.confirmRecoveryPhrase = function () {
    wallet.my.wallet.hdwallet.verifyMnemonic();
    wallet.status.didConfirmRecoveryPhrase = true;
  };

  wallet.isCorrectMainPassword = (candidate) =>
    wallet.store.isCorrectMainPassword(candidate);

  wallet.isCorrectSecondPassword = function (candidate) {
    wallet.my.wallet.validateSecondPassword(candidate);
  };

  wallet.changePassword = function (newPassword, successCallback, errorCallback) {
    wallet.store.changePassword(newPassword, (function () {
      $translate('CHANGE_PASSWORD_SUCCESS').then(function (translation) {
        Alerts.displaySuccess(translation);
        successCallback(translation);
      });
    }), function () {
      $translate('CHANGE_PASSWORD_FAILED').then(function (translation) {
        Alerts.displayError(translation);
        errorCallback(translation);
      });
    });
  };

  wallet.setIPWhitelist = function (ips, successCallback, errorCallback) {
    let success = function () {
      wallet.settings.ipWhitelist = ips;
      successCallback();
      wallet.applyIfNeeded();
    };

    let error = function () {
      errorCallback();
      wallet.applyIfNeeded();
    };

    wallet.settings_api.update_IP_lock(ips, success, error);
  };

  wallet.resendEmailConfirmation = function (successCallback, errorCallback) {
    let success = function () {
      successCallback();
      wallet.applyIfNeeded();
    };

    let error = function () {
      errorCallback();
      wallet.applyIfNeeded();
    };

    wallet.settings_api.resendEmailConfirmation(wallet.user.email, success, error);
  };
  wallet.setPbkdf2Iterations = function (n, successCallback, errorCallback, cancelCallback) {
    let proceed = function (password) {
      wallet.my.wallet.changePbkdf2Iterations(parseInt(n), password);
      wallet.settings.pbkdf2 = wallet.my.wallet.pbkdf2_iterations;
      successCallback();
    };
    wallet.askForSecondPasswordIfNeeded()
      .then(proceed).catch(cancelCallback);
  };
  wallet.setLoggingLevel = function (level) {
    wallet.settings_api.updateLoggingLevel(level, function () {
      wallet.settings.loggingLevel = level;
      wallet.saveActivity(4);
      wallet.applyIfNeeded();
    }, function () {
      Alerts.displayError('Failed to update logging level');
      wallet.applyIfNeeded();
    });
  };

  wallet.recommendedTransactionFee = function (origin, amount) {
    wallet.my.getBaseFee();
  };
  wallet.fiatToSatoshi = function (amount, currency) {
    if (currency === 'BTC' || amount == null ||
        wallet.conversions[currency] == null) return null;
    return parseInt(numeral(amount).multiply(wallet.conversions[currency].conversion).format('0'));
  };

  wallet.BTCtoFiat = function (amount, currency) {
    if (currency === 'BTC' || amount == null ||
        wallet.conversions[currency] == null) return null;
    return numeral(100000000).multiply(amount).divide(wallet.conversions[currency].conversion).format('0.00');
  };

  wallet.isBitCurrency = function (currency) {
    if (currency == null) return null;
    return ['BTC', 'mBTC', 'bits'].indexOf(currency.code) > -1;
  };

  wallet.convertCurrency = function (amount, currency1, currency2) {
    if (amount == null ||
        !(wallet.conversions[currency1.code] == null ||
        wallet.conversions[currency2.code] == null)) return null;
    if (wallet.isBitCurrency(currency1)) {
      return parseFloat(numeral(currency1.conversion).multiply(amount).divide(wallet.conversions[currency2.code].conversion).format('0.00'));
    } else {
      return parseFloat(numeral(amount).multiply(wallet.conversions[currency1.code].conversion).divide(currency2.conversion).format('0.00000000'));
    }
  };

  wallet.convertToSatoshi = function (amount, currency) {
    if (amount == null || currency == null) return null;
    if (wallet.isBitCurrency(currency)) {
      return Math.round(amount * currency.conversion);
    } else if (wallet.conversions[currency.code] != null) {
      return Math.ceil(amount * wallet.conversions[currency.code].conversion);
    } else {
      return null;
    }
  };

  wallet.convertFromSatoshi = function (amount, currency) {
    if (amount == null || currency == null) return null;
    if (wallet.isBitCurrency(currency)) {
      return amount / currency.conversion;
    } else if (wallet.conversions[currency.code] != null) {
      return amount / wallet.conversions[currency.code].conversion;
    } else {
      return null;
    }
  };

  // Takes a satoshi amount and converts it to a given currency
  // while formatting it to how it should look when displayed
  wallet.formatCurrencyForView = function (amount, currency) {
    if (!(amount && currency && currency.code)) return;
    let code = currency.code;
    if (code === 'BTC') amount = amount.toFixed(8);
    if (code === 'mBTC') amount = amount.toFixed(6);
    if (code === 'bits') amount = amount.toFixed(4);
    if (!wallet.isBitCurrency(currency)) amount = amount.toFixed(2);
    return parseFloat(amount) + ' ' + code;
  };

  wallet.toggleDisplayCurrency = function () {
    if (wallet.isBitCurrency(wallet.settings.displayCurrency)) {
      return wallet.settings.displayCurrency = wallet.settings.currency;
    } else {
      return wallet.settings.displayCurrency = wallet.settings.btcCurrency;
    }
  };

  wallet.getFiatAtTime = function (amount, time, currency) {
    let defer = $q.defer();
    let key = amount + currency + time;

    let success = function (fiat) {
      wallet.fiatHistoricalConversionCache[key] = fiat;
      defer.resolve(numeral(fiat).format('0.00'));
    };

    let error = function (reason) {
      return defer.reject(reason);
    };

    if (wallet.fiatHistoricalConversionCache[key]) {
      success(wallet.fiatHistoricalConversionCache[key]);
    } else {
      wallet.api.getFiatAtTime(time * 1000, amount, currency.toLowerCase()).then(success).catch(error);
    }

    return defer.promise;
  };

  wallet.checkAndGetTransactionAmount = function (amount, currency, success, error) {
    amount = wallet.convertToSatoshi(amount, currency);
    if (success == null || error == null) {
      console.error('Success and error callbacks are required');
      return;
    }
    return amount;
  };

  wallet.addAddressOrPrivateKey = function (addressOrPrivateKey, needsBipPassphraseCallback, successCallback, errorCallback, cancel) {
    let success = function (address) {
      successCallback(address);
      wallet.applyIfNeeded();
    };

    let proceed = function (secondPassword='') {
      let error = function (message) {
        if (message === 'needsBip38') {
          needsBipPassphraseCallback(proceedWithBip38);
        } else {
          errorCallback(message);
        }
        wallet.applyIfNeeded();
      };

      let proceedWithBip38 = function (bipPassphrase) {
        wallet.my.wallet.importLegacyAddress(addressOrPrivateKey, '', secondPassword, bipPassphrase).then(success, error);
      };

      let proceedWithoutBip38 = function () {
        wallet.my.wallet.importLegacyAddress(addressOrPrivateKey, '', secondPassword, '').then(success, error);
      };
      proceedWithoutBip38();
    };

    wallet.askForSecondPasswordIfNeeded()
      .then(proceed, cancel);
  };

  wallet.fetchBalanceForRedeemCode = function (code) {
    let defer = $q.defer();

    let success = function (balance) {
      defer.resolve(balance);
    };

    let error = function (error) {
      console.log('Could not retrieve balance');
      console.log(error);
      defer.reject();
    };
    wallet.my.getBalanceForRedeemCode(code, success, error);
    defer.promise;
  };

  wallet.getAddressBookLabel = function (address) {
    wallet.my.wallet.getAddressBookLabel(address);
  };

  wallet.getMnemonic = function (successCallback, errorCallback, cancelCallback) {
    let proceed = function (password) {
      let mnemonic = wallet.my.wallet.getMnemonic(password);
      successCallback(mnemonic);
    };
    wallet.askForSecondPasswordIfNeeded()
      .then(proceed).catch(cancelCallback);
  };

  wallet.importWithMnemonic = function (mnemonic, bip39pass, successCallback, errorCallback, cancelCallback) {
    let cancel = function () {
      cancelCallback();
    };

    let restore = function (password) {
      console.log('restoring...');
      wallet.transactions.splice(0, wallet.transactions.length);
      wallet.my.wallet.restoreHDWallet(mnemonic, bip39pass, password);
    };

    let update = function () {
      console.log('updating...');
      wallet.my.wallet.getHistory().then(wallet.updateTransactions);
      successCallback();
    };

    wallet.askForSecondPasswordIfNeeded()
      .then(restore).then(update).catch(cancel);
  };

  wallet.getDefaultAccountIndex = function () {
    if (wallet.my.wallet == null) {
      return 0;
    } else if (wallet.my.wallet.isUpgradedToHD) {
      return wallet.my.wallet.hdwallet.defaultAccountIndex;
    } else {
      return 0;
    }
  };

  wallet.getReceivingAddressForAccount = function (idx) {
    if (wallet.my.wallet.isUpgradedToHD) {
      return wallet.my.wallet.hdwallet.accounts[idx].receiveAddress;
    } else {
      return '';
    }
  };

  wallet.getReceivingAddressIndexForAccount = function (idx) {
    if (wallet.my.wallet.isUpgradedToHD) {
      return wallet.my.wallet.hdwallet.accounts[idx].receiveIndex;
    } else {
      return null;
    }
  };

  wallet.parsePaymentRequest = function (url) {
    let result = {
      address: null,
      amount: null,
      label: null,
      message: null
    };
    result.isValid = true;
    if (url.indexOf('bitcoin:') === 0) {
      let withoutPrefix = url.replace('bitcoin://', '').replace('bitcoin:', '');
      let qIndex = withoutPrefix.indexOf('?');
      if (qIndex !== -1) {
        result.address = withoutPrefix.substr(0, qIndex);
        let keys = withoutPrefix.substr(qIndex + 1).split('&');
        keys.forEach(function (item) {
          var key, value;
          key = item.split('=')[0];
          value = item.split('=')[1];
          if (key === 'amount') {
            result.amount = wallet.convertToSatoshi(parseFloat(value), wallet.btcCurrencies[0]);
          } else if (result[key] !== void 0) {
            result[key] = value;
          }
        });
      } else {
        result.address = withoutPrefix;
      }
    } else if (wallet.my.isValidAddress(url)) {
      result.address = url;
    } else {
      result.isValid = false;
    }
    return result;
  };

  wallet.isSynchronizedWithServer = function () {
    return wallet.store.isSynchronizedWithServer();
  };

  window.onbeforeunload = function (event) {
    if (!wallet.isSynchronizedWithServer() && wallet.my.wallet.isEncryptionConsistent) {
      event.preventDefault();
      return 'There are unsaved changes. Are you sure?';
    }
  };

  wallet.isValidAddress = function (address) {
    return wallet.my.isValidAddress(address);
  };

  wallet.archive = function (address_or_account) {
    wallet.saveActivity(3);
    address_or_account.archived = true;
    address_or_account.active = false;
  };

  wallet.unarchive = function (address_or_account) {
    wallet.saveActivity(3);
    address_or_account.archived = false;
    address_or_account.active = true;
  };

  wallet.deleteLegacyAddress = function (address) {
    wallet.saveActivity(3);
    wallet.my.wallet.deleteLegacyAddress(address);
  };

  wallet.accounts = function () {
    if (wallet.my.wallet.hdwallet != null) {
      return wallet.my.wallet.hdwallet.accounts;
    } else {
      return [];
    }
  };

  wallet.total = function (accountIndex) {
    if (wallet.my.wallet == null) return;
    switch (accountIndex) {
      case '':
        if (wallet.my.wallet.isUpgradedToHD) {
          return wallet.my.wallet.hdwallet.balanceActiveAccounts + wallet.my.wallet.balanceSpendableActiveLegacy;
        } else {
          return wallet.my.wallet.balanceSpendableActiveLegacy;
        }
        break;
      case 'imported':
        return wallet.my.wallet.balanceSpendableActiveLegacy;
      case void 0:
        if (wallet.my.wallet.isUpgradedToHD) {
          return wallet.my.wallet.hdwallet.balanceActiveAccounts + wallet.my.wallet.balanceSpendableActiveLegacy;
        } else {
          return wallet.my.wallet.balanceSpendableActiveLegacy;
        }
        break;
      default:
        let account = wallet.accounts()[parseInt(accountIndex)];
        if (account === null) {
          return null;
        } else {
          return account.balance;
        }
    }
  };

  wallet.updateTransactions = function () {
    for (let tx of wallet.store.getAllTransactions().reverse()) {
      let match = false;
      for (let candidate of wallet.transactions) {
        if (candidate.hash === tx.hash) {
          match = true;
          if (candidate.note == null) {
            candidate.note = wallet.my.wallet.getNote(tx.hash);
          }
          break;
        }
      }
      if (!match) {
        let transaction = angular.copy(tx);
        transaction.note = wallet.my.wallet.getNote(transaction.hash);
        wallet.transactions.unshift(transaction);
      }
    }
    wallet.status.didLoadTransactions = true;
    wallet.applyIfNeeded();
  };

  wallet.appendTransactions = function (transactions, override) {
    if (transactions == null || wallet.transactions == null) return;
    let results = [];
    for (let tx of transactions) {
      let match = false;
      for (let candidate of wallet.transactions) {
        if (candidate.hash === tx.hash) {
          if (override) {
            wallet.transactions.splice(wallet.transactions.splice(candidate));
          } else {
            match = true;
          }
          break;
        }
      }
      if (!match) {
        let transaction = angular.copy(tx);
        transaction.note = wallet.my.wallet.getNote(transaction.hash);
        results.push(wallet.transactions.push(transaction));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  wallet.beep = function () {
    let sound = ngAudio.load('beep.wav');
    sound.play();
  };

  wallet.monitor = function (event, data) {
    if (event === 'on_tx' || event === 'on_block') {
      let before = wallet.transactions.length;
      wallet.updateTransactions();
      let numberOfTransactions = wallet.transactions.length;
      if (numberOfTransactions > before) {
        wallet.beep();
        if (wallet.transactions[0].result > 0 && !wallet.transactions[0].intraWallet) {
          $translate('JUST_RECEIVED_BITCOIN').then(function (translation) {
            Alerts.displayReceivedBitcoin(translation);
          });
          wallet.saveActivity(0);
        }
      }
    } else if (event === 'error_restoring_wallet') {
    } else if (event === 'did_set_guid') {
    } else if (event === 'on_wallet_decrypt_finish') {
    } else if (event === 'hd_wallets_does_not_exist') {
      wallet.status.didUpgradeToHd = false;
      $timeout(function () {
        $rootScope.$broadcast('needsUpgradeToHD', 1000);
      });
    } else if (event === 'wallet not found') {
      $translate('WALLET_NOT_FOUND').then(function (translation) {
        Alerts.displayError(translation);
      });
    } else if (event === 'ticker_updated' || event === 'did_set_latest_block') {
      wallet.applyIfNeeded();
    } else if (event === 'logging_out') {
      if (wallet.didLogoutByChoice) {
        $translate('LOGGED_OUT').then(function (translation) {
          $cookieStore.put('alert-success', translation);
        });
      } else {
        $translate('LOGGED_OUT_AUTOMATICALLY').then(function (translation) {
          $cookieStore.put('alert-warning', translation);
          wallet.applyIfNeeded();
        });
      }
      wallet.status.isLoggedIn = false;
      while (wallet.transactions.length > 0) {
        wallet.transactions.pop();
      }
      while (wallet.paymentRequests.length > 0) {
        wallet.paymentRequests.pop();
      }
      wallet.user.uid = '';
      wallet.password = '';
    } else if (event === 'ws_on_close' || event === 'ws_on_open') {
    } else if (event.type !== void 0) {
      if (event.type === 'error') {
        Alerts.displayError(event.msg);
        wallet.applyIfNeeded();
      } else if (event.type === 'success') {
        Alerts.displaySuccess(event.msg);
        wallet.applyIfNeeded();
      } else if (event.type === 'notice') {
        Alerts.displayWarning(event.msg);
        wallet.applyIfNeeded();
      } else {
      }
    } else {
    }
  };

  wallet.store.addEventListener(function (event, data) {
    wallet.monitor(event, data);
  });

  let message = $cookieStore.get('alert-warning');
  if (message !== void 0 && message !== null) {
    Alerts.displayWarning(message, true);
    $cookieStore.remove('alert-warning');
  }
  message = $cookieStore.get('alert-success');
  if (message !== void 0 && message !== null) {
    Alerts.displaySuccess(message);
    $cookieStore.remove('alert-success');
  }

  wallet.setNote = function (tx, text) {
    wallet.my.wallet.setNote(tx.hash, text);
  };

  wallet.deleteNote = function (tx) {
    wallet.my.wallet.deleteNote(tx.hash);
  };

  wallet.setLogoutTime = function (minutes, success, error) {
    wallet.store.setLogoutTime(minutes * 60000);
    wallet.settings.logoutTimeMinutes = minutes;
    success();
  };

  wallet.getLanguages = function () {
    let tempLanguages = [];
    let languages = wallet.store.getLanguages();
    for (let code in languages) {
      let name = languages[code];
      let language = {
        code: code,
        name: name
      };
      tempLanguages.push(language);
    }
    tempLanguages = $filter('orderBy')(tempLanguages, 'name');
    let results = [];
    for (let i = 0, len = tempLanguages.length; i < len; i++) {
      let language = tempLanguages[i];
      results.push(wallet.languages.push(language));
    }
    return results;
  };

  wallet.getCurrencies = function () {
    let results = [];
    let currencies = wallet.store.getCurrencies();
    for (let code in currencies) {
      let name = currencies[code];
      let currency = {
        code: code,
        name: name
      };
      results.push(wallet.currencies.push(currency));
    }
    return results;
  };

  wallet.getCurrency = function () {
    return wallet.my.getCurrency();
  };

  wallet.setLanguage = function (language) {
    $translate.use(language.code);
    wallet.settings.language = language;
  };

  wallet.changeLanguage = function (language) {
    wallet.settings_api.change_language(language.code, (function () {}));
    wallet.setLanguage(language);
  };

  wallet.changeCurrency = function (currency) {
    wallet.settings_api.change_local_currency(currency.code);
    wallet.settings.currency = currency;
  };

  wallet.changeBTCCurrency = function (btcCurrency) {
    wallet.settings_api.change_btc_currency(btcCurrency.serverCode);
    wallet.settings.btcCurrency = btcCurrency;
  };

  wallet.changeEmail = function (email, successCallback, errorCallback) {
    wallet.settings_api.change_email(email, (function () {
      wallet.user.email = email;
      wallet.user.isEmailVerified = false;
      successCallback();
      wallet.applyIfNeeded();
    }), function () {
      $translate('CHANGE_EMAIL_FAILED').then(function (translation) {
        Alerts.displayError(translation);
        wallet.applyIfNeeded();
      });
      errorCallback();
    });
  };
  wallet.enableNotifications = function () {
    let success = function () {
      wallet.settings.notifications = true;
      wallet.applyIfNeeded();
    };
    let error = function () {
      Alerts.displayError('Failed to enable notifications');
      wallet.applyIfNeeded();
    };
    wallet.my.wallet.enableNotifications(success, error);
  };

  wallet.disableNotifications = function () {
    let success = function () {
      wallet.settings.notifications = false;
      wallet.applyIfNeeded();
    };
    let error = function () {
      Alerts.displayError('Failed to disable notifications');
      wallet.applyIfNeeded();
    };
    wallet.my.wallet.disableNotifications(success, error);
  };

  wallet.setFeePerKB = function (fee, successCallback, errorCallback) {
    wallet.my.wallet.fee_per_kb = fee;
    wallet.settings.feePerKB = fee;
    successCallback();
  };

  wallet.fetchExchangeRate = function () {
    let success = function (result) {
      for (let code in result) {
        let info = result[code];
        wallet.conversions[code] = {
          symbol: info.symbol,
          conversion: parseInt(numeral(100000000).divide(numeral(info['last'])).format('1'))
        };
      }
      wallet.applyIfNeeded();
    };
    let fail = function (error) {
      console.log('Failed to load ticker:');
      console.log(error);
    };
    wallet.api.getTicker().then(success).catch(fail);
  };

  wallet.getActivityLogs = function (success) {
    wallet.settings_api.getActivityLogs(success, function () {
      console.log('Failed to load activity logs');
    });
  };

  wallet.isEmailVerified = function () {
    return wallet.my.isEmailVerified;
  };

  wallet.internationalPhoneNumber = function (mobile) {
    if (mobile == null) return null;
    return mobile.country + ' ' + mobile.number.replace(/^0*/, '');
  };

  wallet.changeMobile = function (mobile, successCallback, errorCallback) {
    wallet.settings_api.changeMobileNumber(this.internationalPhoneNumber(mobile), (function () {
      wallet.user.mobile = mobile;
      wallet.user.isMobileVerified = false;
      successCallback();
      wallet.applyIfNeeded();
    }), function () {
      $translate('CHANGE_MOBILE_FAILED').then(function (translation) {
        Alerts.displayError(translation);
      });
      errorCallback();
      wallet.applyIfNeeded();
    });
  };

  wallet.verifyMobile = function (code, successCallback, errorCallback) {
    wallet.settings_api.verifyMobile(code, (function () {
      wallet.user.isMobileVerified = true;
      successCallback();
      wallet.applyIfNeeded();
    }), function () {
      $translate('VERIFY_MOBILE_FAILED').then(function (translation) {
        errorCallback(translation);
      });
      wallet.applyIfNeeded();
    });
  };

  wallet.applyIfNeeded = function () {
    if (MyWallet.mockShouldReceiveNewTransaction === void 0) {
      $rootScope.$safeApply();
    }
  };

  wallet.changePasswordHint = function (hint, successCallback, errorCallback) {
    wallet.settings_api.update_password_hint1(hint, (function () {
      wallet.user.passwordHint = hint;
      successCallback();
      wallet.applyIfNeeded();
    }), function (err) {
      errorCallback(err);
      wallet.applyIfNeeded();
    });
  };

  wallet.isMobileVerified = function () {
    return wallet.my.isMobileVerified;
  };

  wallet.disableSecondFactor = function () {
    wallet.settings_api.unsetTwoFactor(function () {
      wallet.settings.needs2FA = false;
      wallet.settings.twoFactorMethod = null;
      wallet.applyIfNeeded();
    }, function () {
      console.log('Failed');
      wallet.applyIfNeeded();
    });
  };

  wallet.setTwoFactorSMS = function () {
    wallet.settings_api.setTwoFactorSMS(function () {
      wallet.settings.needs2FA = true;
      wallet.settings.twoFactorMethod = 5;
      wallet.applyIfNeeded();
    }, function () {
      console.log('Failed');
      wallet.applyIfNeeded();
    });
  };

  wallet.setTwoFactorEmail = function () {
    wallet.settings_api.setTwoFactorEmail(function () {
      wallet.settings.needs2FA = true;
      wallet.settings.twoFactorMethod = 2;
      wallet.applyIfNeeded();
    }, function () {
      console.log('Failed');
      wallet.applyIfNeeded();
    });
  };

  wallet.setTwoFactorYubiKey = function (code, successCallback, errorCallback) {
    wallet.settings_api.setTwoFactorYubiKey(code, function () {
      wallet.settings.needs2FA = true;
      wallet.settings.twoFactorMethod = 1;
      successCallback();
      wallet.applyIfNeeded();
    }, function (error) {
      console.log(error);
      errorCallback(error);
      wallet.applyIfNeeded();
    });
  };

  wallet.setTwoFactorGoogleAuthenticator = function () {
    wallet.settings_api.setTwoFactorGoogleAuthenticator(function (secret) {
      wallet.settings.googleAuthenticatorSecret = secret;
      wallet.applyIfNeeded();
    }, function () {
      console.log('Failed');
      wallet.applyIfNeeded();
    });
  };

  wallet.confirmTwoFactorGoogleAuthenticator = function (code, successCallback, errorCallback) {
    wallet.settings_api.confirmTwoFactorGoogleAuthenticator(code, function () {
      wallet.settings.needs2FA = true;
      wallet.settings.twoFactorMethod = 4;
      wallet.settings.googleAuthenticatorSecret = null;
      successCallback();
      wallet.applyIfNeeded();
    }, function () {
      errorCallback();
      wallet.applyIfNeeded();
    });
  };

  wallet.enableRememberTwoFactor = function (successCallback, errorCallback) {
    let success = function () {
      wallet.settings.rememberTwoFactor = true;
      successCallback();
      wallet.applyIfNeeded();
    };
    let error = function () {
      errorCallback();
      wallet.applyIfNeeded();
    };
    wallet.settings_api.toggleSave2FA(false, success, error);
  };

  wallet.disableRememberTwoFactor = function (successCallback, errorCallback) {
    let success = function () {
      wallet.settings.rememberTwoFactor = false;
      successCallback();
      wallet.applyIfNeeded();
    };
    let error = function () {
      errorCallback();
      wallet.applyIfNeeded();
    };
    wallet.settings_api.toggleSave2FA(true, success, error);
  };

  wallet.handleBitcoinLinks = function () {
    wallet.saveActivity(2);
    $window.navigator.registerProtocolHandler('bitcoin', $window.location.origin + '/#/open/%s', 'Blockchain');
  };

  wallet.enableBlockTOR = function () {
    wallet.settings_api.update_tor_ip_block(1, function () {
      wallet.settings.blockTOR = true;
      wallet.applyIfNeeded();
    }, function () {
      console.log('Failed');
      wallet.applyIfNeeded();
    });
  };

  wallet.disableBlockTOR = function () {
    wallet.settings_api.update_tor_ip_block(0, function () {
      wallet.settings.blockTOR = false;
      wallet.applyIfNeeded();
    }, function () {
      console.log('Failed');
      wallet.applyIfNeeded();
    });
  };

  wallet.enableRestrictToWhiteListedIPs = function () {
    wallet.settings_api.update_IP_lock_on(true, function () {
      wallet.settings.restrictToWhitelist = true;
      wallet.saveActivity(2);
      wallet.applyIfNeeded();
    }, function () {
      console.log('Failed');
      wallet.applyIfNeeded();
    });
  };

  wallet.disableRestrictToWhiteListedIPs = function () {
    wallet.settings_api.update_IP_lock_on(false, function () {
      wallet.settings.restrictToWhitelist = false;
      wallet.saveActivity(2);
      wallet.applyIfNeeded();
    }, function () {
      console.log('Failed');
      wallet.applyIfNeeded();
    });
  };

  wallet.getTotalBalanceForActiveLegacyAddresses = function () {
    if (wallet.my.wallet == null) return;
    return wallet.my.wallet.balanceSpendableActiveLegacy;
  };

  wallet.setDefaultAccount = function (account) {
    wallet.my.wallet.hdwallet.defaultAccountIndex = account.index;
  };

  wallet.isDefaultAccount = function (account) {
    return wallet.my.wallet.hdwallet.defaultAccountIndex === account.index;
  };

  wallet.isValidBIP39Mnemonic = function (mnemonic) {
    return wallet.my.isValidateBIP39Mnemonic(mnemonic);
  };

  wallet.removeSecondPassword = function (successCallback, errorCallback) {
    let success = function () {
      Alerts.displaySuccess('Second password has been removed.');
      wallet.settings.secondPassword = false;
      successCallback();
    };
    let error = function () {
      Alerts.displayError('Second password cannot be unset. Contact support.');
      errorCallback();
    };
    let cancel = errorCallback;
    let decrypting = function () {
      console.log('Decrypting...');
    };
    let syncing = function () {
      console.log('Syncing...');
    };
    let proceed = function (password) {
      wallet.my.wallet.decrypt(password, success, error, decrypting, syncing);
    };
    wallet.askForSecondPasswordIfNeeded().then(proceed).catch(cancel);
  };

  wallet.validateSecondPassword = function (password) {
    return wallet.my.wallet.validateSecondPassword(password);
  };

  wallet.setSecondPassword = function (password, successCallback) {
    let success = function () {
      Alerts.displaySuccess('Second password set.');
      wallet.settings.secondPassword = true;
      successCallback();
    };
    let error = function () {
      Alerts.displayError('Second password cannot be set. Contact support.');
    };
    let encrypting = function () {
      console.log('Encrypting...');
    };
    let syncing = function () {
      console.log('Syncing...');
    };
    wallet.my.wallet.encrypt(password, success, error, encrypting, syncing);
  };

  // Testing: only works on mock MyWallet

  wallet.refresh = function () {
    wallet.my.refresh();
    wallet.updateTransactions();
  };

  wallet.isMock = wallet.my.mockShouldFailToSend !== void 0;
  wallet.getLanguages();
  wallet.getCurrencies();

  return wallet;
}
