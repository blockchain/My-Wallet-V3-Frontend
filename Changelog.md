__Blockchain HD Frontend__

_Recent changes_

#   (2015-12-10)



---

## Bug Fixes

- **Deploy:** better error message if check_guid fails
  ([a5540517](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/a55405176ca63a008967037049a695ea6289b950))
- **Forms:**
  - correct mistake in #220
  ([ff16fb92](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/ff16fb92613be7dfd90c3695265f78a3278c10ee))
  - fix initial focus and validation
  ([a9a68550](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/a9a685504aa2d0f523abbf0e8127d9356864480f))
- **Receive:** don't hide QR code when entering address
  ([7c28110e](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/7c28110e77545015260cb3356c5ffb8ecddf5814))
- **Redeem:** fix getting balance for claim code
  ([9faade16](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/9faade1691f725a67f2f9df005c997ce87eb2f52))
- **Send:** smarter method for computing available balance
  ([1a255123](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/1a2551239f84e56db4af6a715503719baaf92acf))
- **Settings:** current password wasn't validating when changing password
  ([cc51dcc6](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/cc51dcc6fd8d4777c148d92942ea71258222c064))
- **Wallet:** add missing return statements
  ([e20e5539](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/e20e553930173b26970f7ef82a6f18629526f122))
- **filter:** use convert filter in transaction ctrl, default conversion to BTC
  ([60550aac](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/60550aac58f6dbf1133b559f9f81099b0e807a15))
- **tasks:** wrap dist min file in iife
  ([f4fec6ac](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/f4fec6accaed4aa2e68b7b767c21a8474d8606dd))


## Refactor

- **Currency:** create separate service for currency data and functions
- **Dependencies:** remove unused bower dependency and clean up whitelist
- **Languages:** add service for wallet languages
- **Tests:** remove unused local-storage dependency
- **WalletService:** use arrow notation and restore missing return statements
- **btc:** remove unused directive (btc)
- **filters:** remove unused filter (btcFilter)
- **numeral:**
  - remove numeraljs from app
  - remove numeraljs from filters, replace with currency functions


## Test

- **Languages:** add languages service test spec
- **filter:** add test spec for convert filter



---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problem or suggestion, create an issue.* :) **Thanks** </sub></sup>