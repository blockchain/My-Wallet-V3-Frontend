
describe 'fees service', () ->
  fees = undefined

  beforeEach angular.mock.module('walletApp')

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_) ->
      fees = $injector.get('fees')

  describe 'guessAbsoluteFee', ->

    it 'should calculate correctly', ->
      result = fees.guessAbsoluteFee(226, 10000)
      expect(result).toBe(2260)

    it 'should round partial satoshi values up', ->
      result = fees.guessAbsoluteFee(226.01, 10000)
      expect(result).toBe(2261)

  describe 'getClosestBlock', ->

    feeEstimates = [
      { fee: 60000, surge: false }, { fee: 50000, surge: false },
      { fee: 40000, surge: false }, { fee: 30000, surge: false },
      { fee: 20000, surge: false }, { fee: 10000, surge: false }
    ]

    it 'should return the closest block', ->
      result = fees.getClosestBlock(20000, 226, feeEstimates)
      expect(result).toBe(1)

    it 'should return the 6th block when fee is low', ->
      result = fees.getClosestBlock(20000, 1200, feeEstimates)
      expect(result).toBe(6)

    it 'should return the 7th block when fee is very low', ->
      result = fees.getClosestBlock(20000, 50000, feeEstimates)
      expect(result).toBe(7)
