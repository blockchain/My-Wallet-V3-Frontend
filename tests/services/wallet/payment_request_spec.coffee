describe "walletServices", () ->
  Wallet = undefined
  MyWallet = undefined
  mockObserver = undefined
  errors = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, localStorageService) ->
      localStorageService.remove("mockWallets")

      Wallet = $injector.get("Wallet")

      return

    return

  describe "parsePaymentRequest()", ->

    it "should recognise bitcoin://", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("http://")
      expect(result.hasBitcoinPrefix).toBeFalse

      result = Wallet.parsePaymentRequest("bitcoin://")
      expect(result.hasBitcoinPrefix).toBeTrue
    )

    it "should recognise a valid request", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=10")
      expect(result.isValid).toBeTrue
    )

    it "should extract the address", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=0.1")
      expect(result.address).toBe "abcdefg"
    )

    it "should recognise bitcoin:address", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin:abc")
      expect(result.hasBitcoinPrefix).toBeTrue
      expect(result.address).toBe "abc"
    )

    it "should recognise a bitcoin address without bitcoin URI prefix", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("abc")
      expect(result.address).toBe "abc"

    )

    it "should extract the address if no amount param is present", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg")
      expect(result.address).toBe "abcdefg"
    )

    it "should extract the amount", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=0.1")
      expect(result.amount).toBe 10000000
    )

    it "should ignore additional parameters", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=0.1&other=hello")
      expect(result.amount).toBe 10000000
      expect(result.address).toBe "abcdefg"
    )

    it "should ignore the order of parameters", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg?other=hello&amount=0.1")
      expect(result.amount).toBe 10000000
      expect(result.address).toBe "abcdefg"
    )

    it "should parse payment requests above 1 btc in amount", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=100")
      expect(result.amount).toBe 10000000000
      expect(result.address).toBe "abcdefg"
    )
