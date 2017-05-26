describe('SendCtrl', () => {
  let scope;
  let Wallet;
  let MyWallet;
  let MyWalletHelpers;
  let Alerts;
  let fees;
  scope = undefined;
  let $q;
  let $httpBackend;
  let $timeout;

  let askForSecondPassword;

  let modalInstance = {
    close () {},
    dismiss () {}
  };

  let hasErr = (input, err) => scope.sendForm[input].$error[err];

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $rootScope, $controller, $compile, _$q_, _$timeout_) {
      $q = _$q_;
      $timeout = _$timeout_;
      $httpBackend = $injector.get('$httpBackend');
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();
      MyWallet = $injector.get('MyWallet');
      Wallet = $injector.get('Wallet');
      let MyWalletPayment = $injector.get('MyWalletPayment');
      let currency = $injector.get('currency');
      fees = $injector.get('fees');
      MyWalletHelpers = $injector.get('MyWalletHelpers');
      Alerts = $injector.get('Alerts');

      MyWallet.wallet = {
        guid: 'a',
        setNote () {},
        createPayment (p, shouldFail, failWith) { return new MyWalletPayment(MyWallet.wallet, p, shouldFail, failWith); },
        keys: [
          { address: 'some_address', archived: false, isWatchOnly: false, label: 'some_label' },
          { address: 'watch_address', archived: false, isWatchOnly: true },
          { address: 'other_address', archived: true, isWatchOnly: false }
        ],
        hdwallet: {
          defaultAccount: { label: 'Checking', index: 0, archived: false, balance: 100 },
          defaultAccountIndex: 0,
          accounts: [
            { label: 'Checking', index: 0, archived: false, balance: 1 },
            { label: 'Savings', index: 1, archived: false, balance: 1 },
            { label: 'Something', index: 2, archived: true }
          ]
        },
        accountInfo: {
          countryCodeGuess: 'US'
        }
      };

      Wallet.isValidAddress = address => address === 'valid_address';

      Wallet.status = {
        isLoggedIn: true,
        didLoadBalances: true
      };

      Wallet.settings = {
        currency: currency.currencies[0],
        btcCurrency: currency.bitCurrencies[0],
        feePerKB: 10000
      };

      askForSecondPassword = $q.defer();
      Wallet.askForSecondPasswordIfNeeded = () => askForSecondPassword.promise;

      scope = $rootScope.$new();

      scope.qrStream = {};
      scope.qrStream.stop = function () { };
    })
  );

  describe('', () => {
    beforeEach(() =>
      angular.mock.inject(function ($injector, $rootScope, $controller, $compile) {
        $controller('SendCtrl', {
          $scope: scope,
          $stateParams: {},
          $uibModalInstance: modalInstance,
          paymentRequest: {address: '', amount: ''},
          options: {}
        });

        let element = angular.element(
          '<form role="form" name="sendForm" novalidate>' +
          '<input type="text" name="from" ng-model="transaction.from" required />' +
          '<input type="text" name="priv" ng-model="transaction.priv" required />' +
          '<input type="text" name="destinations0" ng-model="transaction.destinations[0]" required />' +
          '<input type="number" name="amounts0" ng-model="transaction.amounts[0]" ng-change="" min="1" required />' +
          '<input type="number" name="amountsFiat0" ng-model="transaction.amountsFiat[0]" ng-change="" min="1" required />' +
          '<input type="text" name="destinations1" ng-model="transaction.destinations[1]" required />' +
          '<input type="number" name="amounts1" ng-model="transaction.amounts[1]" ng-change="" min="1" required />' +
          '<input type="text" name="destinations2" ng-model="transaction.destinations[2]" required />' +
          '<input type="number" name="amounts1" ng-model="transaction.amounts[1]" ng-change="" min="1" required />' +
          '<input type="number" name="fee" ng-model="transaction.fee" ng-change="" min="1" required />' +
          '<textarea rows="4" name="note" ng-model="transaction.note" ng-maxlength="512"></textarea>' +
          '</form>'
        );

        $compile(element)(scope);
        return scope.$apply();
      })
    );

    it('should be able to close', () => {
      spyOn(modalInstance, 'dismiss');
      scope.close();
      expect(modalInstance.dismiss).toHaveBeenCalled();
    });

    describe('initialization', () => {

      it('should load wallet status', () => expect(scope.status).toBeDefined());

      it('should load wallet settings', () => expect(scope.settings).toBeDefined());

      it('should know the users fiat currency', () => expect(scope.fiatCurrency.code).toEqual('USD'));

      it('should know the users btc currency', () => expect(scope.btcCurrency.code).toEqual('BTC'));

      it('should not be sending', () => expect(scope.sending).toEqual(false));

      it('should not start on the confirmation step', () => expect(scope.confirmationStep).toEqual(false));

      it('should not start in advanced send mode', () => expect(scope.advanced).toEqual(false));
    });

    describe('transaction template', () => {

      it('should have a null from field', () => expect(scope.transactionTemplate.from).toBeNull());

      it('should have a single, null destination field', () => {
        expect(scope.transactionTemplate.destinations.length).toEqual(1);
        expect(scope.transactionTemplate.destinations[0]).toBeNull();
      });

      it('should have a single, null amount field', () => {
        expect(scope.transactionTemplate.amounts.length).toEqual(1);
        expect(scope.transactionTemplate.amounts[0]).toEqual(null);
      });

      it('should have an initial fee set to 0', () => expect(scope.transactionTemplate.fee).toEqual(0));

      it('should have an empty note field', () => expect(scope.transactionTemplate.note).toEqual(''));
    });

    describe('origins', () => {

      it('should load', () => {
        expect(scope.originsLoaded).toBe(true);
        expect(scope.origins.length).toBeGreaterThan(0);
      });

      it('should contain accounts', () => {
        let accounts = scope.origins.filter(origin => origin.index != null);
        expect(accounts.length).toBe(2);
      });

      it('should contain addresses', () => {
        let addresses = scope.origins.filter(origin => origin.isWatchOnly);
        expect(addresses.length).toBe(1);
      });

      it('should not cointain archived accounts or addresses', () => {
        let hasArchived = scope.origins.some(origin => origin.archived);
        expect(hasArchived).toBe(false);
      });

      it('should contain watch-only addresses', () => {
        let hasWatchOnly = scope.origins.some(origin => origin.isWatchOnly);
        expect(hasWatchOnly).toBe(true);
      });
    });

    describe('payment request', () => {

      beforeEach(() => scope.paymentRequest = { address: 'request_address', amount: 1738, message: 'hi' });

      it('should be called when the modal opens', () => {
        // TODO: Don't know how to test this one
        pending();
        expect(scope.applyPaymentRequest).toHaveBeenCalled();
      });

      it('should set the destination', () => {
        scope.applyPaymentRequest(scope.paymentRequest, 0);
        expect(scope.transaction.destinations[0].address).toEqual('request_address');
        expect(scope.transaction.destinations[0].type).toEqual('External');
      });

      it('should set the amount', () => {
        scope.applyPaymentRequest(scope.paymentRequest, 0);
        expect(scope.transaction.amounts[0]).toEqual(1738);
      });

      it('should set the note from the message', () => {
        scope.applyPaymentRequest(scope.paymentRequest, 0);
        expect(scope.transaction.note).toEqual('hi');
      });
    });

    describe('on update', () => {
      let data = {
        finalFee: 2,
        sweepFees: [1,2,3,4,5,6],
        balance: 5,
        sweepAmount: 2.5,
        fees: { estimate: [{ surge: true },{},{},{},{},{}] },
        confEstimation: 2,
        absoluteFeeBounds: [2,4,6,8,10,12]
      };

      it('should set the surge warning', () => {
        scope.defaultBlockInclusion = 0;
        scope.payment.triggerUpdate(data);
        expect(scope.transaction.surge).toEqual(true);
      });

      it('should set the blockIdx to the confEstimation', () => {
        scope.payment.triggerUpdate(data);
        expect(scope.transaction.blockIdx).toEqual(data.confEstimation);
      });

      it('should set the fee bounds', () => {
        scope.payment.triggerUpdate(data);
        expect(scope.transaction.feeBounds).toEqual(data.absoluteFeeBounds);
      });

      it('should set the sweep fees', () => {
        scope.payment.triggerUpdate(data);
        expect(scope.transaction.sweepFees).toEqual(data.sweepFees);
      });

      describe('fee', () => {

        it('should be set to finalFee in regular send', () => {
          scope.payment.triggerUpdate(data);
          expect(scope.transaction.fee).toEqual(2);
        });

        it('should be set to finalFee in advanced send', () => {
          scope.advanced = true;
          scope.payment.triggerUpdate(data);
          expect(scope.transaction.fee).toEqual(2);
        });

        it('should not change if fee field was touched in advanced send', () => {
          scope.advanced = true;
          scope.transaction.fee = 3;
          scope.sendForm.fee.$setDirty();
          scope.payment.triggerUpdate(data);
          expect(scope.transaction.fee).toEqual(3);
        });
      });

      describe('maxAvailable', () => {
        it('should be set to the sweepAmount', () => {
          scope.payment.triggerUpdate(data);
          expect(scope.transaction.maxAvailable).toEqual(2.5);
        });

        it('should be set to the balance minus the fee in advanced send', () => {
          scope.advanced = true;
          scope.payment.triggerUpdate(data);
          expect(scope.transaction.maxAvailable).toEqual(3);
        });
      });
    });

    describe('from', () =>
      it('should be invalid if null', () => {
        scope.transaction.from = null;
        scope.$apply();
        expect(hasErr('from', 'required')).toBe(true);
      })
    );

    describe('destinations', () => {
      beforeEach(function () {
        scope.transaction.from = { label: 'Spending' };
        scope.transaction.destinations = [null, null];
      });

      it('should be invalid if null', () => {
        // check first destination
        expect(scope.transaction.destinations[0]).toBeNull();
        expect(hasErr('destinations0', 'required')).toBe(true);

        // check second destination
        expect(scope.transaction.destinations[1]).toBeNull();
        expect(hasErr('destinations1', 'required')).toBe(true);
      });

      it('should check that the destination has a valid address', () => {
        // check for invalid first
        scope.transaction.destinations[0] = { address: 'invalid_address' };
        scope.$apply();
        expect(hasErr('destinations0', 'isValidAddress')).toBe(true);

        // check for valid address
        scope.transaction.destinations[0] = { address: 'valid_address' };
        scope.$apply();
        expect(hasErr('destinations0', 'isValidAddress')).not.toBeDefined();
      });
    });

    describe('amounts', () => {
      beforeEach(function () {
        scope.transaction.amounts = [100, 5000];
        return scope.$apply();
      });

      it('should be valid', () => {
        expect(scope.sendForm.amounts0.$valid).toBe(true);
        expect(scope.sendForm.amounts1.$valid).toBe(true);
      });

      it('should be invalid if null', () => {
        scope.transaction.amounts = [null, null];
        scope.$apply();
        expect(hasErr('amounts0', 'required')).toBe(true);
        expect(hasErr('amounts1', 'required')).toBe(true);
      });

      it('should be invalid if amounts are not numbers', () => {
        // TODO: $apply throws an error bc 'asdf' is NaN. Not sure how to test...
        pending();
        scope.transaction.amounts = ['asdf', 'probably_not_a_number'];
        scope.$apply();
        expect(hasErr('amounts0', 'number')).toBe(true);
        expect(hasErr('amounts1', 'number')).toBe(true);
      });

      it('should be invalid if it is less than 1 satoshi', () => {
        scope.transaction.amounts = [-17, 0.3];
        scope.$apply();
        expect(hasErr('amounts0', 'min')).toBe(true);
        expect(hasErr('amounts1', 'min')).toBe(true);
      });
    });

    describe('miners fee', () => {
      beforeEach(function () {
        scope.transaction.destinations = Wallet.legacyAddresses().slice(0, 2);
        scope.transaction.amounts = [100, 5000];
      });

      it('should be valid', () => {
        expect(scope.transaction.fee).toEqual(0);
        expect(scope.sendForm.fee.$valid).toBe(false);
        scope.transaction.fee = 10000;
        scope.$digest();
        expect(scope.sendForm.fee.$valid).toBe(true);
      });

      it('should be invalid if null', () => {
        scope.transaction.fee = null;
        scope.$apply();
        expect(hasErr('fee', 'required')).toBe(true);
      });

      it('should be invalid if blank', () => {
        scope.transaction.fee = '';
        scope.$apply();
        expect(hasErr('fee', 'required')).toBe(true);
      });

      it('should be invalid if it is less than 0 satoshi', () => {
        scope.transaction.fee = -23.1738;
        scope.$apply();
        expect(hasErr('fee', 'min')).toBe(true);
      });

      it('should be invalid if it is not a number', () => {
        // TODO: $apply throws a NaN err (yet again). Still not sure how to test...
        pending();
        scope.transaction.fee = 'nah_tho';
        scope.$apply();
        expect(hasErr('fee', 'number')).toBe(true);
      });
    });

    describe('dynamic fee', function () {
      let avgSize = 500;

      let lowFee = 4999;
      let midFee = 25000;
      let highFee = 30001;
      let lgSizeFee = 100000;

      beforeEach(function () {
        spyOn(fees, 'showFeeWarning').and.callFake(() => $q.resolve());
        scope.transaction.feeBounds = [30000, 25000, 20000, 15000, 10000, 5000];
      });

      it('should warn when the tx fee is low', function (done) {
        scope.advanced = true;
        scope.transaction.fee = lowFee;
        scope.transaction.size = avgSize;
        scope.checkFee().then(function () {
          expect(fees.showFeeWarning).toHaveBeenCalledWith(4999, 5000, 4999, false);
          return done();
        });
        return scope.$digest();
      });

      it('should warn when the tx fee is high', function (done) {
        scope.advanced = true;
        scope.transaction.fee = highFee;
        scope.transaction.size = avgSize;
        scope.checkFee().then(function () {
          expect(fees.showFeeWarning).toHaveBeenCalledWith(30001, 30000, 30001, false);
          return done();
        });
        return scope.$digest();
      });

      it('should not warn when the tx fee is normal', function (done) {
        scope.transaction.fee = midFee;
        scope.transaction.size = avgSize;
        scope.checkFee().then(function () {
          expect(fees.showFeeWarning).not.toHaveBeenCalled();
          return done();
        });
        return scope.$digest();
      });

      it('should take tx size into account when deciding to show warning', function (done) {
        scope.transaction.fee = lgSizeFee;
        scope.transaction.feeBounds[0] = 100000;
        scope.checkFee().then(function () {
          expect(fees.showFeeWarning).not.toHaveBeenCalled();
          return done();
        });
        return scope.$digest();
      });

      it('should warn when there is a surge', function (done) {
        scope.transaction.fee = midFee;
        scope.transaction.surge = true;
        scope.checkFee().then(function () {
          expect(fees.showFeeWarning).toHaveBeenCalledWith(25000, 25000, 25000, true);
          return done();
        });
        return scope.$digest();
      });
    });

    describe('note', () =>
      it('should not be valid after 512 characters', () => {
        scope.transaction.note = (new Array(513 + 1)).join('x');
        scope.$apply();
        expect(hasErr('note', 'maxlength')).toBe(true);
      })
    );

    describe('send', () =>
      beforeEach(() =>
        scope.transaction = {
          from: Wallet.accounts()[0],
          destinations: Wallet.legacyAddresses().slice(0, 2),
          amounts: [100, 200],
          amountsFiat: [100],
          fee: 50,
          note: 'this_is_a_note'
        }
      )
    );

    describe('after send', () => {
      beforeEach(function () {
        scope.transaction.from = Wallet.accounts()[1];
        scope.transaction.destinations[0] = Wallet.accounts()[0];
        scope.transaction.amounts[0] = 420;
        scope.transaction.fee = 10;
      });

      describe('failure', () => {
        beforeEach(function () {
          scope.payment = MyWallet.wallet.createPayment({}, true);
          return askForSecondPassword.resolve();
        });

        it('should display an error when process fails', inject(function (Alerts) {
          spyOn(Alerts, 'displayError').and.callThrough();
          expect(scope.alerts.length).toEqual(0);
          scope.send();
          scope.$digest();
          expect(scope.alerts.length).toEqual(1);
          expect(Alerts.displayError).toHaveBeenCalled();
          expect(Alerts.displayError.calls.argsFor(0)[0]).toEqual('err_message');
        })
        );

        it('should close the modal if it receives Tx Exists error', inject(function (Alerts) {
          scope.payment = MyWallet.wallet.createPayment({}, true, 'Transaction Already Exists');
          spyOn(modalInstance, 'close').and.callThrough();
          spyOn(Alerts, 'displayError').and.callThrough();
          scope.send();
          scope.$digest();
          expect(modalInstance.close).toHaveBeenCalled();
          expect(Alerts.displayError).not.toHaveBeenCalled();
        })
        );
      });

      describe('success', () => {
        beforeEach(() => askForSecondPassword.resolve());

        let digestAndFlush = function () {
          scope.$digest();
          return $timeout.flush();
        };

        it('should return sending to false', () => {
          scope.send();
          digestAndFlush();
          expect(scope.sending).toBe(false);
        });

        it('should close the modal', () => {
          spyOn(modalInstance, 'close');
          scope.send();
          digestAndFlush();
          expect(modalInstance.close).toHaveBeenCalled();
        });

        it('should play "The Beep"', inject(function (Wallet) {
          spyOn(Wallet, 'beep');
          scope.send();
          digestAndFlush();
          expect(Wallet.beep).toHaveBeenCalled();
        })
        );

        it('should clear alerts', inject(function (Alerts) {
          spyOn(Alerts, 'clear');
          scope.send();
          digestAndFlush();
          expect(Alerts.clear).toHaveBeenCalled();
        })
        );

        it('should show a confirmation alert', inject(function (Alerts) {
          spyOn(Alerts, 'displaySentBitcoin').and.callThrough();
          scope.send();
          digestAndFlush();
          expect(Alerts.displaySentBitcoin).toHaveBeenCalledWith('BITCOIN_SENT');
        })
        );

        it('should tell the user to refresh with TOR', inject(function (Alerts, MyWalletHelpers) {
          MyWalletHelpers.tor = () => true;
          spyOn(Alerts, 'displaySentBitcoin').and.callThrough();
          scope.send();
          digestAndFlush();
          expect(Alerts.displaySentBitcoin).toHaveBeenCalledWith('BITCOIN_SENT_TOR');
        })
        );

        it('should show account transactions', inject(function ($state) {
          spyOn($state, 'go');
          scope.send();
          digestAndFlush();
          expect($state.go).toHaveBeenCalledWith('wallet.common.transactions');
        })
        );

        it('should show imported address transactions', inject(function ($state) {
          spyOn($state, 'go');
          scope.transaction.from = Wallet.legacyAddresses()[0];
          scope.send();
          digestAndFlush();
          expect($state.go).toHaveBeenCalledWith('wallet.common.transactions');
        })
        );

        it('should set a note if there is one', inject(function (Wallet, MyWallet) {
          spyOn(Wallet, 'setNote').and.callThrough();
          spyOn(MyWallet.wallet, 'setNote');
          scope.transaction.note = 'this_is_a_note';
          scope.send();
          digestAndFlush();
          expect(Wallet.setNote).toHaveBeenCalledWith({ hash: 'tx-hash' }, 'this_is_a_note');
          expect(MyWallet.wallet.setNote).toHaveBeenCalledWith('tx-hash', 'this_is_a_note');
        })
        );

        it('should not set a note if there is not one', inject(function (Wallet) {
          spyOn(Wallet, 'setNote');
          scope.send();
          digestAndFlush();
          expect(Wallet.setNote).not.toHaveBeenCalled();
        })
        );

        describe('address input metrics', () => {
          beforeEach(() => spyOn(scope, 'sendInputMetrics'));

          it('should not send if inputMetric is null', () => {
            scope.send();
            digestAndFlush();
            expect(scope.sendInputMetrics).not.toHaveBeenCalled();
          });

          it('should not send if inputMetric is not valid', () => {
            scope.inputMetric = "asdf";
            scope.send();
            digestAndFlush();
            expect(scope.sendInputMetrics).not.toHaveBeenCalled();
          });

          it('should send if inputMetric is valid', () => {
            scope.inputMetric = "paste";
            scope.send();
            digestAndFlush();
            expect(scope.sendInputMetrics).toHaveBeenCalledWith('paste');
          });
        });
      });
    });

    describe('sendInputMetrics', () =>
      it('should record the event correctly', () => {
        $httpBackend.expectGET('https://blockchain.info/event?name=wallet_web_tx_from_paste').respond('success');
        scope.sendInputMetrics('paste');
        return $httpBackend.verifyNoOutstandingExpectation();
      })
    );

    describe('resetSendForm', () => {

      beforeEach(function () {
        scope.transaction.from = Wallet.legacyAddresses()[1];
        scope.transaction.destinations = [Wallet.accounts()[1]];
        scope.transaction.amounts = [1111];
        return scope.transaction.fee = 9000;
      });

      it('should set transaction to equal the template', () => {
        scope.resetSendForm();
        expect(scope.transaction.destinations).toEqual([null]);
        expect(scope.transaction.amounts).toEqual([null]);
        expect(scope.transaction.fee).toEqual(0);
      });
    });

      // Not working for some reason
      // it "should set transaction from field to default account", inject((MyWallet) ->
      //   scope.resetSendForm()
      //   expect(scope.transaction.from).toEqual(MyWallet.wallet.hdwallet.defaultAccount)
      // )

    describe('numberOfActiveAccountsAndLegacyAddresses', () =>

      it('should return the correct amount', () => {
        let amount = scope.numberOfActiveAccountsAndLegacyAddresses();
        expect(amount).toEqual(4);
      })
    );

    describe('hasZeroBalance', () =>

      it('should determine if balance is zero', () => expect(scope.hasZeroBalance({balance: 0})).toBe(true))
    );

    describe('applyPaymentRequest', () =>

      it('should succesfully apply a payment request', inject(function (Wallet) {
        scope.result = Wallet.parsePaymentRequest('bitcoin://abcdefgh?amount=0.001');
        scope.applyPaymentRequest(scope.result, 0);
        expect(scope.transaction.amounts[0]).toBe(100000);
        expect(scope.transaction.destinations[0].address).toBe("abcdefgh");
      })
      )
    );

    describe('getToLabels', () =>

      it('should return an array of addresses', () => {
        scope.transaction.destinations[0] = Wallet.legacyAddresses()[0];
        expect(scope.getToLabels()).toEqual([ { address : 'some_address', archived : false, isWatchOnly : false, label : 'some_label' } ]);
      })
    );

    describe('getTransactionTotal', () => {

      beforeEach(function () {
        scope.transaction.amounts = [100, 250, 350];
        return scope.transaction.fee = 50;
      });

      it('should add up the transaction without fee', () => {
        let total = scope.getTransactionTotal();
        expect(total).toEqual(700);
      });

      it('should add up the transaction with fee', () => {
        let total = scope.getTransactionTotal(true);
        expect(total).toEqual(750);
      });
    });

    describe('amountsAreValid', () => {

      beforeEach(function () {
        scope.transaction.amounts = [10, 20];
        return scope.transaction.maxAvailable = 40;
      });

      it('should be true when all conditions are met', () => expect(scope.amountsAreValid()).toEqual(true));

      it('should be false when any amounts are null', () => {
        scope.transaction.amounts[0] = null;
        expect(scope.amountsAreValid()).toEqual(false);
      });

      it('should be false when amounts exceed the available balance', () => {
        scope.transaction.maxAvailable = 29;
        expect(scope.amountsAreValid()).toEqual(false);
      });
    });

    describe('checkForSameDestination', () => {

      beforeEach(() => scope.transaction.destinations = [Wallet.accounts()[0], Wallet.accounts()[1]]);

      it('should recognize when all destinations are valid', () => {
        scope.transaction.from = Wallet.legacyAddresses()[0];
        scope.checkForSameDestination();
        expect(hasErr('destinations0', 'isNotEqual')).toBeUndefined();
        expect(hasErr('destinations1', 'isNotEqual')).toBeUndefined();
      });

      it('should recognize when two destinations match', () => {
        scope.transaction.from = Wallet.accounts()[1];
        scope.checkForSameDestination();
        expect(hasErr('destinations0', 'isNotEqual')).toBeUndefined();
        expect(hasErr('destinations1', 'isNotEqual')).toBe(true);
      });
    });

    describe('hasAmountError', () =>

      it('should be true when all conditions are met', () => {
        let field = scope.sendForm.amounts0;
        let fiatField = scope.sendForm.amountsFiat0;
        expect(field.$invalid).toEqual(true);
        field.$setTouched();
        fiatField.$setTouched();
        spyOn(scope, 'amountsAreValid').and.returnValue(false);
        expect(scope.hasAmountError(0)).toEqual(true);
      })
    );

    describe('useAll', () => {
      beforeEach(() => scope.transaction.maxAvailable = 100);

      it('should set the transaction amount', () => {
        scope.useAll();
        expect(scope.transaction.amounts[0]).toEqual(100);
      });

      it('should not use all if there is more than 1 destination', () => {
        scope.transaction.amounts = [1, 2];
        scope.useAll();
        expect(scope.transaction.amounts[0]).toEqual(1);
      });

      it('should set payment.amount', () => {
        spyOn(scope.payment, 'amount');
        scope.useAll();
        expect(scope.payment.amount).toHaveBeenCalled();
      });
    });

    describe('modal navigation', () => {

      it('should build the payment before going to confirmation step', inject(function ($q) {
        spyOn(scope, 'checkFee').and.callFake(() => $q.resolve());
        spyOn(scope, 'finalBuild').and.callFake(() => $q.resolve());
        scope.goToConfirmation();
        scope.$digest();
        expect(scope.finalBuild).toHaveBeenCalled();
        expect(scope.confirmationStep).toEqual(true);
      })
      );

      it('should be able to go back from confirmation step', () => {
        scope.confirmationStep = true;
        scope.backToForm();
        expect(scope.confirmationStep).toBeFalsy();
      });

      it('should be able to switch to advanced send', () => {
        expect(scope.advanced).toBeFalsy();
        scope.advancedSend();
        expect(scope.advanced).toBeTruthy();
      });

      it('should be able to switch back to regular send', () => {
        scope.advanced = true;
        scope.regularSend();
        expect(scope.advanced).toBeFalsy();
      });

      it('should trim destinations when switching back to regular', () => {
        scope.transaction.destinations = [null, null];
        scope.regularSend();
        expect(scope.transaction.destinations.length).toEqual(1);
      });

      it('should trim amounts when switching back to regular', () => {
        scope.transaction.amounts = [null, null];
        scope.regularSend();
        expect(scope.transaction.amounts.length).toEqual(1);
      });

      beforeEach(function () {
        scope.transaction.destinations = [null, null];
        return scope.transaction.amounts = [0.5, 1.2];});

      it('should be able to add a destination', () => {
        scope.addDestination();
        expect(scope.transaction.destinations.length).toBe(3);
        expect(scope.transaction.amounts.length).toBe(3);
      });

      it('should be able to remove a destination', () => {
        scope.removeDestination(0);
        expect(scope.transaction.destinations.length).toBe(1);
        expect(scope.transaction.amounts.length).toBe(1);
      });
    });

    describe('finalBuild', () =>

      it('should resolve with the payment transaction', function (done) {
        scope.finalBuild().then(function (tx) {
          expect(tx).toEqual('tx');
          return done();
        });
        return scope.$digest();
      })
    );

    describe('checkPriv', () => {

      let pkctaSpy = function (val, reject) {
        if (reject == null) { reject = false; }
        let returnVal = reject ? $q.reject(val) : $q.resolve(val);
        spyOn(MyWalletHelpers, 'privateKeyCorrespondsToAddress').and.returnValue(returnVal);
        return MyWalletHelpers.privateKeyCorrespondsToAddress;
      };

      beforeEach(function () {
        scope.transaction.from = { address: 'addr', isWatchOnly: true };
        return scope.transaction.priv = 'priv_key';
      });

      it('should not check the priv if the address is spendable', () => {
        let s = pkctaSpy();
        scope.transaction.from.isWatchOnly = false;
        scope.checkPriv();
        expect(s).not.toHaveBeenCalled();
      });

      it('should set the decrypted private key if successful', () => {
        let s = pkctaSpy('decrypted_priv');
        spyOn(scope.payment, 'from');
        scope.checkPriv();
        scope.$digest();
        expect(scope.payment.from).toHaveBeenCalledWith('decrypted_priv', undefined);
      });

      it('should reject if the priv and address do not match', function (done) {
        let s = pkctaSpy(null);
        scope.checkPriv().then(done).catch(function (e) {
          expect(s).toHaveBeenCalledWith('addr', 'priv_key', undefined);
          expect(e).toEqual('PRIV_NO_MATCH');
          return done();
        });
        return scope.$digest();
      });

      it('should reject if the bip38 password is wrong', function (done) {
        let s = pkctaSpy('wrongBipPass', true);
        scope.checkPriv('wrong').catch(function (e) {
          expect(s).toHaveBeenCalledWith('addr', 'priv_key', 'wrong');
          expect(e).toEqual('INCORRECT_PASSWORD');
          return done();
        }).then(done);
        return scope.$digest();
      });

      it('should prompt the user for their bip password if needed', () => {
        spyOn(Alerts, 'prompt').and.returnValue({ then () {} });
        pkctaSpy('needsBip38', true);
        scope.checkPriv();
        scope.$digest();
        expect(Alerts.prompt).toHaveBeenCalledWith('NEED_BIP38', jasmine.any(Object));
      });
    });

    describe('with a pasted custom bitcoin url', () =>

      it('should parse the url and update scope', inject((function ($timeout) {
        let pasteEvent = { target: { value:  'bitcoin:145JWCey6sK7B8XrY44Q3LeugeJT7M2N4i?amount=0.00034961&message=this%20is%20not%20the%20bitcoin%20you\'re%20looking%20for'} };
        scope.transaction.destinations = [{address: 'bitcoin:145JWCey6sK7B8XrY44Q3LeugeJT7M2N4i?amount=0.00034961&message=this%20is%20not%20the%20bitcoin%20you\'re%20looking%20for'}];
        scope.handlePaste(pasteEvent, 0);
        $timeout.flush();
        expect(scope.transaction.amounts[0]).toEqual(34961);
        expect(scope.transaction.destinations[0].address).toEqual('145JWCey6sK7B8XrY44Q3LeugeJT7M2N4i');
      })
      )
      )
    );
  });

  describe('with a payment request', () => {
    beforeEach(() =>
      angular.mock.inject(function ($injector, $rootScope, $controller, $compile) {
        $controller('SendCtrl', {
          $scope: scope,
          $stateParams: {},
          $uibModalInstance: modalInstance,
          paymentRequest: {address: "valid_address", amount: 1000000},
          options: {}
        });

        let element = angular.element(
          '<form role="form" name="sendForm" novalidate>' +
          '<input type="text" name="from" ng-model="transaction.from" required />' +
          '<input type="text" name="priv" ng-model="transaction.priv" required />' +
          '<input type="text" name="destinations0" ng-model="transaction.destinations[0]" required />' +
          '<input type="number" name="amounts0" ng-model="transaction.amounts[0]" ng-change="" min="1" required />' +
          '<input type="number" name="fee" ng-model="transaction.fee" ng-change="" min="0" required />' +
          '<textarea rows="4" name="note" ng-model="transaction.note" ng-maxlength="512"></textarea>' +
          '</form>'
        );

        $compile(element)(scope);
        return scope.$apply();
      })
    );

    it('should check that the destination has a valid address', () => expect(hasErr('destinations0', 'isValidAddress')).not.toBeDefined());
  });
});
