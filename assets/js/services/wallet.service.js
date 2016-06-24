'use strict';

angular
  .module('walletServices', [])
  .factory('Wallet', Wallet);

Wallet.$inject = ['$http', '$window', '$timeout', '$location', 'Alerts', 'MyWallet', 'MyBlockchainApi', 'MyBlockchainRng', 'MyBlockchainSettings', 'MyWalletStore', 'MyWalletPayment', 'MyWalletHelpers', '$rootScope', 'ngAudio', '$cookies', '$translate', '$filter', '$state', '$q', 'bcPhoneNumber', 'languages', 'currency'];

function Wallet ($http, $window, $timeout, $location, Alerts, MyWallet, MyBlockchainApi, MyBlockchainRng, MyBlockchainSettings, MyWalletStore, MyWalletPayment, MyWalletHelpers, $rootScope, ngAudio, $cookies, $translate, $filter, $state, $q, bcPhoneNumber, languages, currency) {
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
  wallet.rng = MyBlockchainRng;

  $rootScope.$watch('rootURL', () => {
    // If a custom rootURL is set by index.jade:
    //                    Grunt can replace this:
    const customRootURL = $rootScope.rootURL;
    wallet.api.ROOT_URL = customRootURL;
    // If customRootURL is set by Grunt:
    $rootScope.rootURL = customRootURL;

    const absUrl = $location.absUrl();
    const path = $location.path();
    if (absUrl && path && path.length) {
      // e.g. https://blockchain.info/wallet/#
      $rootScope.rootPath = $location.absUrl().slice(0, -$location.path().length);
    }

    //                         Grunt can replace this:
    const customWebSocketURL = $rootScope.webSocketURL;
    if (customWebSocketURL) {
      wallet.my.ws.wsUrl = customWebSocketURL;
    }

    // If a custom apiDomain is set by index.jade:
    //                             Grunt can replace this:
    const customApiDomain = $rootScope.apiDomain || 'https://api.blockchain.info/';
    $rootScope.apiDomain = customApiDomain;
    if (customApiDomain) {
      wallet.api.API_ROOT_URL = customApiDomain;
    }

    // These are set by grunt dist:
    $rootScope.versionFrontend = null;
    $rootScope.versionMyWallet = null;

    console.info(
      'Using My-Wallet-V3 Frontend %s and My-Wallet-V3 v%s, connecting to %s',
      $rootScope.versionFrontend, $rootScope.versionMyWallet, $rootScope.rootURL
    );
  });

  wallet.Payment = MyWalletPayment;

  wallet.api_code = '1770d5d9-bcea-4d28-ad21-6cbd5be018a8';
  MyBlockchainApi.API_CODE = wallet.api_code;

  wallet.login = (uid, password, two_factor_code, needsTwoFactorCallback, successCallback, errorCallback) => {
    let didLogin = (result) => {
      let guid = result.guid;
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
      wallet.settings_api.getAccountInfo((result) => {
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
        wallet.settings.notifications = result.notifications_type && result.notifications_type.length > 0 && result.notifications_type.indexOf(1) > -1 && (parseInt(result.notifications_on, 10) === 0 || parseInt(result.notifications_on, 10) === 2);
        wallet.user.isEmailVerified = result.email_verified;
        wallet.user.isMobileVerified = result.sms_verified;
        wallet.user.passwordHint = result.password_hint1;
        wallet.setLanguage($filter('getByProperty')('code', result.language, languages));
        wallet.settings.currency = $filter('getByProperty')('code', result.currency, currency.currencies);
        wallet.settings.btcCurrency = $filter('getByProperty')('serverCode', result.btc_currency, currency.bitCurrencies);
        wallet.settings.displayCurrency = wallet.settings.btcCurrency;
        wallet.settings.feePerKB = wallet.my.wallet.fee_per_kb;
        wallet.settings.blockTOR = !!result.block_tor_ips;
        wallet.status.didLoadSettings = true;
        if (wallet.my.wallet.isUpgradedToHD) {
          let didFetchTransactions = () => {
            if (browserDetection().browser === 'ie') {
              console.warn('Stop!');
              console.warn('This browser feature is intended for developers. If someone told you to copy-paste something here, it is a scam and will give them access to your money!');
            } else {
              console.log('%cStop!', 'color:white; background:red; font-size: 16pt');
              console.log('%cThis browser feature is intended for developers. If someone told you to copy-paste something here, it is a scam and will give them access to your money!', 'font-size: 14pt');
            }
            wallet.status.didLoadTransactions = true;
            wallet.status.didLoadBalances = true;
            $rootScope.$safeApply();
          };
          wallet.my.wallet.getHistory().then(didFetchTransactions);
        }
        $rootScope.$safeApply();
      });
      if (successCallback != null) {
        successCallback(guid);
      }
      $rootScope.$safeApply();
    };

    let needsTwoFactorCode = (method) => {
      Alerts.displayWarning('Please enter your 2FA code');
      wallet.settings.needs2FA = true;
      // 2: Email
      // 3: Yubikey
      // 4: Google Authenticator
      // 5: SMS

      needsTwoFactorCallback(method);

      wallet.settings.twoFactorMethod = method;
      $rootScope.$safeApply();
    };

    let wrongTwoFactorCode = (message) => {
      errorCallback('twoFactor', message);
      $rootScope.$safeApply();
    };

    let loginError = (error) => {
      console.log(error);
      if (error.length && error.indexOf('Unknown Wallet Identifier') > -1) {
        errorCallback('uid', error);
      } else if (error.length && error.indexOf('password') > -1) {
        errorCallback('password', error);
      } else {
        Alerts.displayError(error.message || error, true);
        errorCallback();
      }
      $rootScope.$safeApply();
    };

    if (two_factor_code != null && two_factor_code !== '') {
      wallet.settings.needs2FA = true;
    } else {
      two_factor_code = null;
    }

    let authorizationProvided = () => {
      wallet.goal.auth = true;
      $rootScope.$safeApply();
    };

    let authorizationRequired = (callback) => {
      callback(authorizationProvided());
      Alerts.displayWarning('CHECK_EMAIL_VERIFY_BROWSER', true);
      $rootScope.$safeApply();
    };

    var two_factor = null;
    if (wallet.settings.twoFactorMethod) {
      two_factor = {
        type: wallet.settings.twoFactorMethod,
        code: two_factor_code
      };
    }

    const doLogin = (uid, sessionGuid, sessionToken) => {
      if (uid !== sessionGuid) {
        // Don't reuse the session token for a different wallet.
        sessionToken = null;
      }

      // Immedidately store the new guid and session token, in case the user needs
      // to refresh their browser:
      const newSessionToken = (token) => {
        $cookies.put('session', token);
        $cookies.put('uid', uid);
      };

      wallet.my.login(
        uid,
        password,
        {
          twoFactor: two_factor,
          sessionToken: sessionToken
        },
        {
          newSessionToken: newSessionToken,
          needsTwoFactorCode: needsTwoFactorCode,
          wrongTwoFactorCode: wrongTwoFactorCode,
          authorizationRequired: authorizationRequired
        }
      ).then(didLogin).catch(loginError);
    };

    // Check if we already have a session token:
    let sessionToken = $cookies.get('session');
    let sessionGuid = $cookies.get('uid');

    if (!sessionToken) {
      $http.get($rootScope.rootURL + 'wallet-legacy/guid_from_cookie', {withCredentials: true}).success(data => {
        if (data.success) {
          sessionToken = data.sid;
          sessionGuid = data.guid;
        }
        doLogin(uid, sessionGuid, sessionToken);
      }).error(() => {
        // If guid_from_cookie endpoint can't be reach, just create a new session
        doLogin(uid, sessionGuid, sessionToken);
      });
    } else {
      doLogin(uid, sessionGuid, sessionToken);
    }

    currency.fetchExchangeRate();
  };

  wallet.upgrade = (successCallback, cancelSecondPasswordCallback) => {
    let success = () => {
      wallet.status.didUpgradeToHd = true;
      wallet.status.didInitializeHD = true;
      wallet.my.wallet.getHistory().then(() => {
        wallet.status.didLoadBalances = true;
        // Montitored by e.g. acticity feed:
        wallet.status.didLoadTransactions = true;
      });
      successCallback();
      $rootScope.$safeApply();
    };

    let error = () => {
      wallet.store.enableLogout();
      wallet.store.setIsSynchronizedWithServer(true);
      $window.location.reload();
    };

    let proceed = (password) => {
      $translate('FIRST_ACCOUNT_NAME').then((translation) => {
        wallet.my.wallet.upgradeToV3(translation, password, success, error);
      });
    };
    wallet.askForSecondPasswordIfNeeded()
      .then(proceed).catch(cancelSecondPasswordCallback);
  };

  wallet.legacyAddresses = () => {
    if (wallet.status.isLoggedIn) {
      return wallet.my.wallet.keys;
    } else {
      return null;
    }
  };

  wallet.getReceiveAddress = MyWalletHelpers.memoize((acctIdx, addrIdx) => {
    let account = wallet.accounts()[acctIdx];
    return account.receiveAddressAtIndex(addrIdx);
  });

  wallet.getLabelledHdAddresses = (acctIdx) => {
    let account = wallet.accounts()[acctIdx];
    return account.receivingAddressesLabels.map(({ index, label }) => ({
      index, label, address: wallet.getReceiveAddress(acctIdx, index)
    }));
  };

  wallet.getPendingPayments = (acctIdx) => {
    let labelledAddresses = wallet.getLabelledHdAddresses(acctIdx);
    let addresses = labelledAddresses.map(a => a.address);
    return $q.resolve(MyBlockchainApi.getBalances(addresses)).then(data => (
      labelledAddresses.map(({ index, address, label }) => ({
        index, address, label,
        ntxs: data[address].n_tx
      })).filter(a => a.ntxs === 0)
    ));
  };

  wallet.addAddressForAccount = (account) => {
    let index = account.receiveIndex;
    let address = wallet.getReceiveAddress(account.index, index);
    let label = $translate.instant('DEFAULT_NEW_ADDRESS_LABEL');
    return $q.resolve(account.setLabelForReceivingAddress(index, label))
      .then(() => ({ index, address, label }));
  };

  wallet.create = (password, email, currency, language, success_callback) => {
    let success = (uid, sharedKey, password, sessionToken) => {
      $cookies.put('session', sessionToken);
      $cookies.put('uid', uid);
      Alerts.displaySuccess('Wallet created with identifier: ' + uid, true);
      wallet.status.firstTime = true;

      let loginSuccess = (guid) => {
        success_callback(uid);
      };

      let loginError = (error) => {
        console.log(error);
        Alerts.displayError('Unable to login to new wallet');
      };

      wallet.login(uid, password, null, null, loginSuccess, loginError);
    };

    let error = (error) => {
      if (error.message !== void 0) Alerts.displayError(error.message);
      else Alerts.displayError(error);
    };

    let currency_code = currency && currency.code || 'USD';
    let language_code = language && language.code || 'en';

    $translate('FIRST_ACCOUNT_NAME')
      .then((translation) => {
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

  wallet.askForSecondPasswordIfNeeded = () => {
    let defer = $q.defer();
    if (wallet.my.wallet.isDoubleEncrypted) {
      $rootScope.$broadcast('requireSecondPassword', defer);
    } else {
      defer.resolve(null);
    }
    return defer.promise;
  };

  wallet.saveActivity = () => {
    // TYPES: ['transactions', 'security', 'settings', 'accounts']
    $rootScope.$broadcast('updateActivityFeed');
  };

  let addressBook = void 0;
  wallet.addressBook = (refresh) => {
    let myAddressBook = wallet.my.wallet.addressBook;
    if (addressBook === void 0 || refresh) {
      addressBook = Object.keys(myAddressBook).map((key) => {
        return {
          address: key,
          label: myAddressBook[key]
        };
      });
    }
    return addressBook;
  };

  wallet.removeAddressBookEntry = (address) => {
    wallet.my.wallet.removeAddressBookEntry(address.address);
    wallet.addressBook(true); // Refreshes address book
  };

  wallet.createAccount = (label, successCallback, errorCallback, cancelCallback) => {
    let proceed = (password) => {
      wallet.my.wallet.newAccount(label, password);
      wallet.my.wallet.getHistory();
      successCallback && successCallback();
    };
    wallet.askForSecondPasswordIfNeeded()
      .then(proceed).catch(cancelCallback);
  };

  wallet.renameAccount = (account, name, successCallback, errorCallback) => {
    account.label = name;
    successCallback();
  };

  wallet.changeLegacyAddressLabel = (address, label, successCallback, errorCallback) => {
    address.label = label;
    successCallback();
  };

  wallet.changeHDAddressLabel = (accountIdx, index, label, successCallback, errorCallback) => {
    let account = wallet.accounts()[parseInt(accountIdx, 10)];
    $q.resolve(account.setLabelForReceivingAddress(index, label))
      .then(successCallback).catch(errorCallback);
  };

  wallet.logout = () => {
    $cookies.remove('password');
    let sessionToken = $cookies.get('session');
    $cookies.remove('session');
    wallet.didLogoutByChoice = true;
    $window.name = 'blockchain';
    wallet.my.logout(sessionToken, true);
  };

  wallet.makePairingCode = (successCallback, errorCallback) => {
    let success = (code) => {
      successCallback(code);
      $rootScope.$safeApply();
    };

    let error = () => {
      errorCallback();
      $rootScope.$safeApply();
    };

    wallet.my.makePairingCode(success, error);
  };

  wallet.confirmRecoveryPhrase = () => {
    wallet.my.wallet.hdwallet.verifyMnemonic();
    wallet.status.didConfirmRecoveryPhrase = true;
  };

  wallet.isCorrectMainPassword = (candidate) =>
    wallet.store.isCorrectMainPassword(candidate);

  wallet.changePassword = (newPassword, successCallback, errorCallback) => {
    wallet.store.changePassword(newPassword, () => {
      let msg = 'CHANGE_PASSWORD_SUCCESS';
      Alerts.displaySuccess(msg);
      successCallback(msg);
    }, () => {
      let err = 'CHANGE_PASSWORD_FAILED';
      Alerts.displayError(err);
      errorCallback(err);
    });
  };

  wallet.setIPWhitelist = (ips, successCallback, errorCallback) => {
    let success = () => {
      wallet.settings.ipWhitelist = ips;
      successCallback();
      $rootScope.$safeApply();
    };

    let error = () => {
      errorCallback();
      $rootScope.$safeApply();
    };

    wallet.settings_api.updateIPlock(ips, success, error);
  };

  wallet.resendEmailConfirmation = (successCallback, errorCallback) => {
    let success = () => {
      successCallback();
      $rootScope.$safeApply();
    };

    let error = () => {
      errorCallback();
      $rootScope.$safeApply();
    };

    wallet.settings_api.resendEmailConfirmation(wallet.user.email, success, error);
  };
  wallet.setPbkdf2Iterations = (n, successCallback, errorCallback, cancelCallback) => {
    let proceed = (password) => {
      wallet.my.wallet.changePbkdf2Iterations(parseInt(n, 10), password);
      wallet.settings.pbkdf2 = wallet.my.wallet.pbkdf2_iterations;
      successCallback();
    };
    wallet.askForSecondPasswordIfNeeded()
      .then(proceed).catch(cancelCallback);
  };
  wallet.setLoggingLevel = (level) => {
    wallet.settings_api.updateLoggingLevel(level, () => {
      wallet.settings.loggingLevel = level;
      wallet.saveActivity(4);
      $rootScope.$safeApply();
    }, () => {
      Alerts.displayError('Failed to update logging level');
      $rootScope.$safeApply();
    });
  };

  wallet.toggleDisplayCurrency = () => {
    if (currency.isBitCurrency(wallet.settings.displayCurrency)) {
      wallet.settings.displayCurrency = wallet.settings.currency;
    } else {
      wallet.settings.displayCurrency = wallet.settings.btcCurrency;
    }
  };

  wallet.checkAndGetTransactionAmount = (amount, currency, success, error) => {
    amount = currency.convertToSatoshi(amount, currency);
    if (success == null || error == null) {
      console.error('Success and error callbacks are required');
      return;
    }
    return amount;
  };

  wallet.addAddressOrPrivateKey = (addressOrPrivateKey, needsBipPassphraseCallback, successCallback, errorCallback, cancel) => {
    let success = (address) => {
      successCallback(address);
      $rootScope.$safeApply();
    };

    let proceed = (secondPassword = '') => {
      let error = (message) => {
        if (message === 'needsBip38') {
          needsBipPassphraseCallback(proceedWithBip38);
        } else {
          errorCallback(message);
        }
        $rootScope.$safeApply();
      };

      let proceedWithBip38 = (bipPassphrase) => {
        wallet.my.wallet.importLegacyAddress(addressOrPrivateKey, '', secondPassword, bipPassphrase).then(success, error);
      };

      let proceedWithoutBip38 = () => {
        wallet.my.wallet.importLegacyAddress(addressOrPrivateKey, '', secondPassword, '').then(success, error);
      };
      proceedWithoutBip38();
    };

    wallet.askForSecondPasswordIfNeeded()
      .then(proceed, cancel);
  };

  wallet.fetchBalanceForRedeemCode = (code) => {
    let logError = (error) => {
      console.log(error);
      throw $translate.instant('ERR_FETCH_BALANCE');
    };
    return MyBlockchainApi.getBalanceForRedeemCode(code)
      .catch(logError);
  };

  wallet.getAddressBookLabel = (address) =>
    wallet.my.wallet.getAddressBookLabel(address);

  wallet.getMnemonic = (successCallback, errorCallback, cancelCallback) => {
    let proceed = (password) => {
      let mnemonic = wallet.my.wallet.getMnemonic(password);
      successCallback(mnemonic);
    };
    wallet.askForSecondPasswordIfNeeded()
      .then(proceed).catch(cancelCallback);
  };

  wallet.importWithMnemonic = (mnemonic, bip39pass, successCallback, errorCallback, cancelCallback) => {
    let cancel = () => {
      cancelCallback();
    };

    let restore = (password) => {
      console.log('restoring...');
      wallet.my.wallet.restoreHDWallet(mnemonic, bip39pass, password);
    };

    let update = () => {
      console.log('updating...');
      wallet.my.wallet.getHistory().then(successCallback);
    };

    wallet.askForSecondPasswordIfNeeded()
      .then(restore).then(update).catch(cancel);
  };

  wallet.getDefaultAccountIndex = () => {
    if (wallet.my.wallet == null) {
      return 0;
    } else if (wallet.my.wallet.isUpgradedToHD) {
      return wallet.my.wallet.hdwallet.defaultAccountIndex;
    } else {
      return 0;
    }
  };

  wallet.getReceivingAddressForAccount = (idx) => {
    if (wallet.my.wallet.isUpgradedToHD) {
      return wallet.my.wallet.hdwallet.accounts[idx].receiveAddress;
    } else {
      return '';
    }
  };

  wallet.getReceivingAddressIndexForAccount = (idx) => {
    if (wallet.my.wallet.isUpgradedToHD) {
      return wallet.my.wallet.hdwallet.accounts[idx].receiveIndex;
    } else {
      return null;
    }
  };

  wallet.parsePaymentRequest = (url) => {
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
        keys.forEach((item) => {
          var key, value;
          key = item.split('=')[0];
          value = item.split('=')[1];
          if (key === 'amount') {
            result.amount = currency.convertToSatoshi(parseFloat(value), currency.bitCurrencies[0]);
          } else if (result[key] !== void 0) {
            result[key] = value;
          }
        });
      } else {
        result.address = withoutPrefix;
      }
    } else if (wallet.isValidAddress(url)) {
      result.address = url;
    } else {
      result.isValid = false;
    }
    return result;
  };

  wallet.isSynchronizedWithServer = () =>
    wallet.store.isSynchronizedWithServer();

  window.onbeforeunload = (event) => {
    if (!wallet.isSynchronizedWithServer() && wallet.my.wallet.isEncryptionConsistent) {
      event.preventDefault();
      return 'There are unsaved changes. Are you sure?';
    }
    if ($rootScope.autoReload) {
      $cookies.put('reload.url', $location.url());
    }
  };

  wallet.isValidAddress = (address) => MyWalletHelpers.isBitcoinAddress(address);
  wallet.isValidPrivateKey = (priv) => MyWalletHelpers.isValidPrivateKey(priv);

  wallet.archive = (address_or_account) => {
    wallet.saveActivity(3);
    address_or_account.archived = true;
    address_or_account.active = false;
  };

  wallet.unarchive = (address_or_account) => {
    wallet.saveActivity(3);
    address_or_account.archived = false;
    address_or_account.active = true;
  };

  wallet.deleteLegacyAddress = (address) => {
    wallet.saveActivity(3);
    wallet.my.wallet.deleteLegacyAddress(address);
  };

  wallet.accounts = () => {
    if (!wallet.status.isLoggedIn) return null;
    if (wallet.my.wallet.hdwallet != null) {
      return wallet.my.wallet.hdwallet.accounts;
    } else {
      return [];
    }
  };

  wallet.total = (accountIndex) => {
    if (wallet.my.wallet == null || !wallet.status.isLoggedIn) return null;
    switch (accountIndex) {
      case '':
      case void 0:
        if (wallet.my.wallet.isUpgradedToHD) {
          if (wallet.my.wallet.balanceActiveLegacy == null || wallet.my.wallet.hdwallet.balanceActiveAccounts == null) return null;
          return wallet.my.wallet.hdwallet.balanceActiveAccounts + wallet.my.wallet.balanceActiveLegacy;
        } else {
          return wallet.my.wallet.balanceActiveLegacy;
        }
        break;
      case 'imported':
        return wallet.my.wallet.balanceActiveLegacy;
      default:
        let account = wallet.accounts()[parseInt(accountIndex, 10)];
        return account == null ? null : account.balance;
    }
  };

  wallet.formatTransactionCoins = (tx) => {
    let input = tx.processedInputs
      .filter(i => !i.change)[0] || tx.processedInputs[0];
    let outputs = tx.processedOutputs
      .filter(o => !o.change && o.address !== input.address);

    let setLabel = (io) => (
      io.label = io.label || wallet.getAddressBookLabel(io.address) || io.address
    );

    setLabel(input);
    outputs.forEach(setLabel);

    return { input: input, outputs: outputs };
  };

  wallet.beep = () => {
    let sound = ngAudio.load('beep.wav');
    sound.play();
  };

  wallet.monitor = (event, data) => {
    if (event === 'on_tx') {
      $rootScope.cancelRefresh();
      let tx = wallet.my.wallet.txList.transactions()[0];
      if (tx.result > 0 && tx.txType === 'received') {
        wallet.beep();
        Alerts.displayReceivedBitcoin('JUST_RECEIVED_BITCOIN');
      }
    } else if (event === 'on_block') {
    } else if (event === 'error_restoring_wallet') {
    } else if (event === 'did_set_guid') {
    } else if (event === 'on_wallet_decrypt_finish') {
    } else if (event === 'hd_wallets_does_not_exist') {
      wallet.status.didUpgradeToHd = false;
      $timeout(() => {
        $rootScope.$broadcast('needsUpgradeToHD', 1000);
      });
    } else if (event === 'wallet not found') {
      Alerts.displayError('WALLET_NOT_FOUND');
    } else if (event === 'ticker_updated' || event === 'did_set_latest_block') {
      $rootScope.$safeApply();
    } else if (event === 'logging_out') {
      if (wallet.didLogoutByChoice) {
        $translate('LOGGED_OUT').then((translation) => {
          $cookies.put('alert-success', translation);
        });
      } else {
        $translate('LOGGED_OUT_AUTOMATICALLY').then((translation) => {
          $cookies.put('alert-warning', translation);
          $rootScope.$safeApply();
        });
      }
      wallet.status.isLoggedIn = false;
      while (wallet.paymentRequests.length > 0) {
        wallet.paymentRequests.pop();
      }
      wallet.user.uid = '';
      wallet.password = '';
    } else if (event === 'ws_on_close' || event === 'ws_on_open') {
    } else if (event.type !== void 0) {
      if (event.type === 'error') {
        Alerts.displayError(event.msg);
        $rootScope.$safeApply();
      } else if (event.type === 'success') {
        Alerts.displaySuccess(event.msg);
        $rootScope.$safeApply();
      } else if (event.type === 'notice') {
        Alerts.displayWarning(event.msg);
        $rootScope.$safeApply();
      } else {
      }
    } else if (event === 'on_email_verified') {
      if (data.email === wallet.user.email && data.verified) {
        wallet.user.isEmailVerified = 1;
        Alerts.displaySuccess('EMAIL_VERIFIED_MSG');
      }
    } else {
    }
    $rootScope.$safeApply();
  };

  wallet.store.addEventListener((event, data) => {
    wallet.monitor(event, data);
  });

  let message = $cookies.get('alert-warning');
  if (message !== void 0 && message !== null) {
    Alerts.displayWarning(message, true);
    $cookies.remove('alert-warning');
  }
  message = $cookies.get('alert-success');
  if (message !== void 0 && message !== null) {
    Alerts.displaySuccess(message);
    $cookies.remove('alert-success');
  }

  wallet.setNote = (tx, text) => {
    wallet.my.wallet.setNote(tx.hash, text);
    $rootScope.$safeApply();
  };

  wallet.deleteNote = (tx) => {
    wallet.my.wallet.deleteNote(tx.hash);
  };

  wallet.setLogoutTime = (minutes, success, error) => {
    wallet.store.setLogoutTime(minutes * 60000);
    wallet.settings.logoutTimeMinutes = minutes;
    success();
  };

  wallet.getCurrency = () => wallet.my.getCurrency();

  wallet.setLanguage = (language) => {
    $translate.use(language.code);
    wallet.settings.language = language;
  };

  wallet.changeLanguage = (language) => $q((resolve, reject) => {
    wallet.settings_api.changeLanguage(language.code, () => {
      wallet.setLanguage(language);
      resolve(true);
    }, reject);
  });

  wallet.changeCurrency = (curr) => $q((resolve, reject) => {
    wallet.settings_api.changeLocalCurrency(curr.code, () => {
      wallet.settings.currency = curr;
      if (!currency.isBitCurrency(wallet.settings.displayCurrency)) {
        wallet.settings.displayCurrency = curr;
      }
      resolve(true);
    }, reject);
  });

  wallet.changeBTCCurrency = (btcCurrency) => $q((resolve, reject) => {
    wallet.settings_api.changeBtcCurrency(btcCurrency.serverCode, () => {
      wallet.settings.btcCurrency = btcCurrency;
      if (currency.isBitCurrency(wallet.settings.displayCurrency)) {
        wallet.settings.displayCurrency = btcCurrency;
      }
      resolve(true);
    }, reject);
  });

  wallet.changeEmail = (email, successCallback, errorCallback) => {
    wallet.settings_api.changeEmail(email, () => {
      wallet.user.email = email;
      wallet.user.isEmailVerified = 0;
      successCallback();
      $rootScope.$safeApply();
    }, () => {
      Alerts.displayError('CHANGE_EMAIL_FAILED');
      $rootScope.$safeApply();
      errorCallback();
    });
  };

  wallet.enableNotifications = () => {
    let success = () => {
      wallet.settings.notifications = true;
      $rootScope.$safeApply();
    };
    let error = () => {
      Alerts.displayError('Failed to enable notifications');
      $rootScope.$safeApply();
    };
    wallet.my.wallet.enableNotifications(success, error);
  };

  wallet.disableNotifications = () => {
    let success = () => {
      wallet.settings.notifications = false;
      $rootScope.$safeApply();
    };
    let error = () => {
      Alerts.displayError('Failed to disable notifications');
      $rootScope.$safeApply();
    };
    wallet.my.wallet.disableNotifications(success, error);
  };

  wallet.setFeePerKB = (fee, successCallback, errorCallback) => {
    wallet.my.wallet.fee_per_kb = fee;
    wallet.settings.feePerKB = fee;
    successCallback();
  };

  wallet.getActivityLogs = (success) => {
    wallet.settings_api.getActivityLogs(success, () => {
      console.log('Failed to load activity logs');
    });
  };

  wallet.isEmailVerified = () => wallet.my.isEmailVerified;

  wallet.internationalPhoneNumber = (mobile) => {
    if (mobile == null) return null;
    return mobile.country + ' ' + mobile.number.replace(/^0*/, '');
  };

  wallet.changeMobile = (mobile, successCallback, errorCallback) => {
    wallet.settings_api.changeMobileNumber(wallet.internationalPhoneNumber(mobile), () => {
      wallet.user.mobile = mobile;
      wallet.user.isMobileVerified = false;
      successCallback();
      $rootScope.$safeApply();
    }, () => {
      Alerts.displayError('CHANGE_MOBILE_FAILED');
      errorCallback();
      $rootScope.$safeApply();
    });
  };

  wallet.verifyMobile = (code, successCallback, errorCallback) => {
    wallet.settings_api.verifyMobile(code, () => {
      wallet.user.isMobileVerified = true;
      successCallback();
      $rootScope.$safeApply();
    }, () => {
      $translate('VERIFY_MOBILE_FAILED').then((translation) => {
        errorCallback(translation);
      });
      $rootScope.$safeApply();
    });
  };

  wallet.changePasswordHint = (hint, successCallback, errorCallback) => {
    wallet.settings_api.updatePasswordHint1(hint, () => {
      wallet.user.passwordHint = hint;
      successCallback();
      $rootScope.$safeApply();
    }, (err) => {
      errorCallback(err);
      $rootScope.$safeApply();
    });
  };

  wallet.isMobileVerified = () => wallet.my.isMobileVerified;

  wallet.disableSecondFactor = () => {
    wallet.settings_api.unsetTwoFactor(() => {
      wallet.settings.needs2FA = false;
      wallet.settings.twoFactorMethod = null;
      $rootScope.$safeApply();
    }, () => {
      console.log('Failed');
      $rootScope.$safeApply();
    });
  };

  wallet.setTwoFactorSMS = () => {
    wallet.settings_api.setTwoFactorSMS(() => {
      wallet.settings.needs2FA = true;
      wallet.settings.twoFactorMethod = 5;
      $rootScope.$safeApply();
    }, () => {
      console.log('Failed');
      $rootScope.$safeApply();
    });
  };

  wallet.setTwoFactorEmail = () => {
    wallet.settings_api.setTwoFactorEmail(() => {
      wallet.settings.needs2FA = true;
      wallet.settings.twoFactorMethod = 2;
      $rootScope.$safeApply();
    }, () => {
      console.log('Failed');
      $rootScope.$safeApply();
    });
  };

  wallet.setTwoFactorYubiKey = (code, successCallback, errorCallback) => {
    wallet.settings_api.setTwoFactorYubiKey(code, () => {
      wallet.settings.needs2FA = true;
      wallet.settings.twoFactorMethod = 1;
      successCallback();
      $rootScope.$safeApply();
    }, (error) => {
      console.log(error);
      errorCallback(error);
      $rootScope.$safeApply();
    });
  };

  wallet.setTwoFactorGoogleAuthenticator = () => {
    wallet.settings_api.setTwoFactorGoogleAuthenticator((secret) => {
      wallet.settings.googleAuthenticatorSecret = secret;
      $rootScope.$safeApply();
    }, () => {
      console.log('Failed');
      $rootScope.$safeApply();
    });
  };

  wallet.confirmTwoFactorGoogleAuthenticator = (code, successCallback, errorCallback) => {
    wallet.settings_api.confirmTwoFactorGoogleAuthenticator(code, () => {
      wallet.settings.needs2FA = true;
      wallet.settings.twoFactorMethod = 4;
      wallet.settings.googleAuthenticatorSecret = null;
      successCallback();
      $rootScope.$safeApply();
    }, () => {
      errorCallback();
      $rootScope.$safeApply();
    });
  };

  wallet.enableRememberTwoFactor = (successCallback, errorCallback) => {
    let success = () => {
      wallet.settings.rememberTwoFactor = true;
      successCallback();
      $rootScope.$safeApply();
    };
    let error = () => {
      errorCallback();
      $rootScope.$safeApply();
    };
    wallet.settings_api.toggleSave2FA(false, success, error);
  };

  wallet.disableRememberTwoFactor = (successCallback, errorCallback) => {
    let success = () => {
      wallet.settings.rememberTwoFactor = false;
      // This takes effect immedidately:
      $cookies.remove('session');
      successCallback();
      $rootScope.$safeApply();
    };
    let error = () => {
      errorCallback();
      $rootScope.$safeApply();
    };
    wallet.settings_api.toggleSave2FA(true, success, error);
  };

  wallet.handleBitcoinLinks = () => {
    wallet.saveActivity(2);
    const uri = $rootScope.rootPath + '/open/%s';
    $window.navigator.registerProtocolHandler('bitcoin', uri, 'Blockchain');
  };

  wallet.enableBlockTOR = () => {
    wallet.settings_api.updateTorIpBlock(1, () => {
      wallet.settings.blockTOR = true;
      $rootScope.$safeApply();
    }, () => {
      console.log('Failed');
      $rootScope.$safeApply();
    });
  };

  wallet.disableBlockTOR = () => {
    wallet.settings_api.updateTorIpBlock(0, () => {
      wallet.settings.blockTOR = false;
      $rootScope.$safeApply();
    }, () => {
      console.log('Failed');
      $rootScope.$safeApply();
    });
  };

  wallet.enableRestrictToWhiteListedIPs = () => {
    wallet.settings_api.updateIPlockOn(true, () => {
      wallet.settings.restrictToWhitelist = true;
      wallet.saveActivity(2);
      $rootScope.$safeApply();
    }, () => {
      Alerts.displayError('ERR_ENABLE_IP_RESTRICT');
      $rootScope.$safeApply();
    });
  };

  wallet.disableRestrictToWhiteListedIPs = () => {
    wallet.settings_api.updateIPlockOn(false, () => {
      wallet.settings.restrictToWhitelist = false;
      wallet.saveActivity(2);
      $rootScope.$safeApply();
    }, () => {
      console.log('Failed');
      $rootScope.$safeApply();
    });
  };

  wallet.setDefaultAccount = (account) => {
    wallet.my.wallet.hdwallet.defaultAccountIndex = account.index;
  };

  wallet.isDefaultAccount = (account) =>
    wallet.my.wallet.hdwallet.defaultAccountIndex === account.index;

  wallet.isValidBIP39Mnemonic = (mnemonic) =>
    MyWalletHelpers.isValidBIP39Mnemonic(mnemonic);

  wallet.removeSecondPassword = (successCallback, errorCallback) => {
    let success = () => {
      Alerts.displaySuccess('Second password has been removed.');
      wallet.settings.secondPassword = false;
      successCallback();
    };
    let error = () => {
      Alerts.displayError('SECOND_PASSWORD_REMOVE_ERR');
      errorCallback();
    };
    let cancel = errorCallback;
    let decrypting = () => {
      console.log('Decrypting...');
    };
    let syncing = () => {
      console.log('Syncing...');
    };
    let proceed = (password) => {
      wallet.my.wallet.decrypt(password, success, error, decrypting, syncing);
    };
    wallet.askForSecondPasswordIfNeeded().then(proceed).catch(cancel);
  };

  wallet.validateSecondPassword = (password) =>
    wallet.my.wallet.validateSecondPassword(password);

  wallet.setSecondPassword = (password, successCallback) => {
    let success = () => {
      Alerts.displaySuccess('Second password set.');
      wallet.settings.secondPassword = true;
      successCallback();
    };
    let error = () => {
      Alerts.displayError('Second password cannot be set. Contact support.');
    };
    let encrypting = () => {
      console.log('Encrypting...');
    };
    let syncing = () => {
      console.log('Syncing...');
    };
    wallet.my.wallet.encrypt(password, success, error, encrypting, syncing);
  };

  // Testing: only works on mock MyWallet

  wallet.refresh = () => {
    wallet.my.refresh();
  };

  wallet.isMock = wallet.my.mockShouldFailToSend !== void 0;

  return wallet;
}
