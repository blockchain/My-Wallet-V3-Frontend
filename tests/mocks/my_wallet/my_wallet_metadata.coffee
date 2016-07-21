angular
  .module('walletApp.core')
  .factory 'MyWalletMetadata', () ->
    lastSeen =
      lastViewed: 3

    mockFailure = false

    (metaDataType, mockFailure) =>
      if (mockFailure == true)
        mockFailure = true
      {
        fetch: () =>
          then: (cb) =>
            if (!mockFailure)
              cb(lastSeen)
            {
              catch: (cb) =>
                if (mockFailure)
                  cb()
            }

        update: () =>
          then: (cb) =>
            cb()
            {
              catch: () =>
            }

      }
