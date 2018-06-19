describe('faqCtrl', () => {
  let scope;

  let env = {
    partners: {
      sfox: {
        countries: ['US'],
        states: ['NY']
      },
      unocoin: {
        countries: ['IN']
      },
      coinify: {
        countries: ['UK', 'FR']
      }
    },
    webHardFork: { faqMessage: '' }
  }

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $rootScope, $controller, $httpBackend) {
      scope = $rootScope.$new();
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();
      return $controller('faqCtrl',
        {$scope: scope, env: env, canTrade: true});
    })
  );

    beforeEach(() => {
      scope.questions = [
        { name: 'WALLET_SAFETY',
        link: ['START_CLICK_HERE', 'wallet.common.security-center'] },
        { name: 'WALLET_ID_VS_ADDRESS' },
        { name: 'HOW_TO_TRANSACT' },
        { name: 'HOW_MUCH_TO_SEND' },
        { name: 'WHEN_IS_A_TX_CONFIRMED' },
        { name: 'CAN_BC_SEE_FUNDS' },
        { name: 'CAN_BC_RESET_PW', values: {'link': 'wallet.common.security-center', 'text': 'SECURITY_CENTER'} }
      ];
    })

    it('should have an array of questions', () => expect(scope.questions.length).toBeGreaterThan(0));

    describe('toggle', () => {
      it('should toggle question display to true', () => {
        let q = scope.questions[0];
        scope.toggle(q);
        expect(q.displayed).toBe(true);
      });

      it('should toggle question display to false', () => {
        let q = scope.questions[0];
        q.displayed = true;
        scope.toggle(q);
        expect(q.displayed).toBe(false);
      });
    });
});
