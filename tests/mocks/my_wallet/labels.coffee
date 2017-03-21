angular.module('walletApp.core').factory 'Labels', () ->
  addLabel: () ->
  getLabel: (accountIdx, receiveIdx) ->
    if (receiveIdx == 1)
      'Hello'
    else
      null
