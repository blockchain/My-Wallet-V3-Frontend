angular.module('walletApp.core').factory 'MyWalletStore', () ->
  transactions = [];
  notes = {}

  eventListener = undefined

  password = undefined

  defaultAccountIndex = 0

  isSynchronizedWithServer = true # In the sense that the server is up to date

  addressBook = { # The same for everyone
      "17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq": "John"
      "1LJuG6yvRh8zL9DQ2PTYjdNydipbSUQeq": "Alice"
  }

  feePerKB = 10000


  legacyAddresses = () -> []

  {
    isSynchronizedWithServer: () ->
      isSynchronizedWithServer

    setIsSynchronizedWithServer: (setting) ->
      isSynchronizedWithServer = setting

    sendEvent: (event) ->
      eventListener(event)

    getFeePerKB: () ->
      return feePerKB

    setFeePerKB: (fee) ->
      feePerKB = fee
      return

    getMultiAccountSetting: () ->
        true

    getLogoutTime: () ->
        10

    addEventListener: (func) ->
        eventListener = func

    getPbkdf2Iterations: () ->
      10

    setPbkdf2Iterations: () ->
      return

    getLanguages: () ->
      {de: "Deutch", en: "English", nl: "Nederlands"}

    getCurrencies: () ->
      {USD: "US Dollar", EUR: "Euro"}

    didUpgradeToHd: () ->
      true

    isMnemonicVerified: () ->
      false

    isCorrectMainPassword: (candidate) ->
      candidate == password

    changePassword: (newPassword) ->
      password = newPassword

    getAllTransactions: (idx) ->
      res = []
      for transaction in transactions
        res.push transaction

      return res

    getAllLegacyAddresses: () ->
      res = []
      for key, value of legacyAddresses
        res.push key
      return res

    getLegacyActiveAddresses: () ->
      activeAddresses = []
      for key, value of legacyAddresses
        unless value.archived
          activeAddresses.push key
      return activeAddresses

    getLegacyAddressLabel: (address) ->
      return legacyAddresses[address].label

    isWatchOnlyLegacyAddress: (address) ->
      return legacyAddresses[address].privateKey == null

    legacyAddressExists: (candidate) ->
      return legacyAddresses[candidate]?

    getAddressBook: () ->
      addressBook

    getLegacyAddressBalance: (address) ->
      return legacyAddresses[address].balance

    getPrivateKey: (address) ->
      if address in legacyAddresses
        return legacyAddresses[address].privateKey;
      else
        return null

    setLegacyAddressBalance: (address, balance) ->
      legacyAddresses[address] = balance
      return


    getTotalBalanceForActiveLegacyAddresses: () ->
      tally = 0
      for key, value of legacyAddresses
        tally += value.balance
      return tally

    setLegacyAddressLabel: (label) ->
      return

    deleteLegacyAddress: (address) ->
      return

    archiveLegacyAddr: (address) ->
      return

    unArchiveLegacyAddr: (address) ->
      return

    getDefaultAccountIndex: () ->
      return defaultAccountIndex

    setDefaultAccountIndex: (idx) ->
      defaultAccountIndex = idx
      return

    getDoubleEncryption: () ->
      return false

    getNote: (hash) ->
      notes[hash]

    setNote: (hash, text) ->
      notes[hash] = text
      # Circular reference:
      # MyWallet.sync()
      return

    # Mock only:

    mockSetPassword: (pwd) ->
      password = pwd

    setNotes: (theNotes) ->
      notes = theNotes

    getNotes: () ->
      notes

    setTransactions: (theTransactions) ->
      transactions = theTransactions

    appendTransaction: (transaction) ->
      transactions.push transaction

    addLegacyAddress: (address, privateKey, balance, label, archived) ->
      legacyAddresses[address] = {privateKey: privateKey, balance: balance, label: label, archived: archived}
      return

    setAPICode: (api_code) ->
      return

  }
