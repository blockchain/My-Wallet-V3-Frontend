__Blockchain HD Frontend__

_Recent changes_

#   (2015-12-04)



---

## Bug Fixes

- **Camera:** turn off camera after use in Chrome 47
  ([fc0f7d3e](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/fc0f7d3ea9c820cdcbafe072cdbc898b25cc0a59))
- **Login:** don't promise to fill in UID if we don't have it
  ([bf5718a6](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/bf5718a6c496463486312fcb6c955608255c3081))
- **Send:**
  - show default account when oppening modal from 'All Transactions'
  ([1a9a56c7](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/1a9a56c7ef23fb8190291c705290962e144350d4))
  - do not validate empty 'to' field
  ([e039541a](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/e039541a081d7aa47ab6173e64959883694d592e))
- **dyk:** fix dyk link, more useful translation strings
  ([7047923f](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/7047923f3c85fb2e0ce4729b3f5c27b3aacd008c))
- **index:** load wallet service
  ([b2116631](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/b2116631c6ddf414b24ef10ec2207f55293e39fe))
- **modal:** remove black bar from beneath modals
  ([c90462ec](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/c90462ec39f505b9b9b6b78ab9a16cf93a4209ab))
- **receive:** vertically align labels
  ([fea311f9](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/fea311f95d1ccc03a4d783e02b94ba8ef154ba59))
- **routes:** use correct controller for address book
  ([6f9ad52b](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/6f9ad52ba7c9ded1ae096f3a72f0ccc4543ced14))
- **tests:** coverage for service js files
  ([109fd04d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/109fd04db164976492080ef65a91055a8c083e74))
- **uiLadda:** has its own scope
  ([6bfe9814](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/6bfe9814b8d6281de9981603b10aedeb540de837))
- **wallet:** add MyWalletPayment as a property of Wallet
  ([3ed881d6](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/3ed881d619d37ce62352ddacd1bb16ffc9482faa))


## Features

- **Receive:** show new receive address after receiving
  ([94b03e9d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/94b03e9ddeb30fd34bb56175f539e0bc6e931d14))
- **Send:** 'total available' validation message
  ([f8509bd3](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/f8509bd3fe660c56136e623ac3c3dfa8914a4db2))
- **recovery:** add warning to wallet recovery page
  ([35dec7f5](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/35dec7f56845ac7118244790d3aac4e92727c59e))


## Refactor

- **Wallet:**
  - remove legacy loadScript function
  - remove unnecessary return statements
  - convert wallet.js.coffee to wallet.service.js
- **activity-feed:**
  - change watch syntax
  - convert activity-feed.directive to js
- **address-book-entry:** change name, clean code
- **adverts:** convert adverts directive to js
- **amount:** convert amount directive to js
- **filters:** convert filters to js
- **routes:** convert routes to js
- **translations:** convert translations config to js


## Test

- **Wallet:** add tests for 2FA functions



---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problem or suggestion, create an issue.* :) **Thanks** </sub></sup>