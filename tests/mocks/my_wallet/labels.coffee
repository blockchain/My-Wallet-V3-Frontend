angular.module('walletApp').factory 'Labels', () ->
  addLabel: () -> Promise.resolve()
  getLabel: (accountIdx, receiveIdx) ->
    if (receiveIdx == 1)
      'Hello'
    else
      null
  all: (accountIdx) ->
    [
      null,
      { label: 'pending' },
      {label: 'labelled_address', used: true},
      {label: null, used: true}
    ]
  checkIfUsed: (accountIdx) ->
    Promise.resolve()
  removeLabel: () ->
    Promise.resolve()
  fetchBalance: (addresses) -> Promise.resolve()
