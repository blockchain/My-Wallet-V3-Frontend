__Blockchain HD Frontend__

_Recent changes_

#   (2016-01-11)



---

## Bug Fixes

- **Accounts:** revert accidental change in 433de77b4a
  ([f149f45c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/f149f45c962d0c285f775d9917d5bf40eacca783))
- **Adverts:** set .rootURL to '/' by default
  ([ba77aa9f](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/ba77aa9ff930e268b1fba50fc25b27f0d21c3599))
- **Currency:** correct decimal places for bits and mBTC
  ([e5d3c6c4](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/e5d3c6c4f2cb2b377b54b259be6561d129f6da18))
- **Deploy:**
  - fix filename for .woff2 fonts
  ([c785d759](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/c785d759ac1f72f8314bd2acb8cfe93e3cc9c3dd))
  - ROOT_URL now required for dev, defaults to / in production
  ([465c694a](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/465c694af5082dc61667659141cffd23184a3314))
  - dmore aggresive cleaning in dist task
  ([fa1d4906](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/fa1d4906ba7d9198eff28527b691116848851a29))
  - clean bower and npm cache in dist task
  ([f6349813](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/f6349813fa6f433a903362d3fbdf37e5f3245dfb))
  - move CSS and JS to /js so that relative font path works
  ([a0e377e0](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/a0e377e0db41614e086eea4ad4d3c294bbfa0496))
- **Feedback:**
  - missing controller file
  ([950f3824](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/950f3824946f3f2ce231098345058d51c6e63612))
  - use new endpoint
  ([46348250](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/463482500c01c104e59256505568b61f95c1574f))
- **Login:** disable browser validation and autocomplete
  ([c0ecd11d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/c0ecd11da6262a42662cc79e18f0f83648424184))
- **LostGuid:** use .rootURL
  ([9d5df846](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/9d5df8467a8b5354f9785a73dfcbae0686f654a1))
- **Recover:** fix redirect after recovery
  ([f22ca557](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/f22ca557376f8f0b6bca94b42831c45abab243b4))
- **Signup:** improved validation
  ([4baac6ea](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/4baac6ea6b2699861ba3dad8b08ee09ec31878c2))
- **Sponsors:** use .rootURL
  ([f94175e0](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/f94175e045ac90f3b5f46e4b553e8f9b6055609d))
- **VerifyEmail:** guid in token was ignored
  ([76fcf8e2](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/76fcf8e230150d99868934804c7a10789eac381c))
- **bcAsyncInput:** spinner remained after save, blockchain/My-Wallet-V3-Frontend@867850dbdbb276
  ([1443b338](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/1443b338119628f36e0b8640127883a6239e9fea))


## Features

- remove beta invite system
  ([a2b4d07c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/a2b4d07c7059e4667d96674458e8e336cc3f06ed))
- **2FA:** process reset 2FA email link
  ([118c884b](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/118c884bfdff0ef5de7dc9882f6810c7c2709455))
- **Deploy:** pass backend URL to grunt dist
  ([eae05c42](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/eae05c42b0db8e838619285c63220e840ced0720))
- **Login:**
  - new browser approval - different browser
  ([d53490d1](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/d53490d140265861218fc1f208869c1929cb39af))
  - new browser approval - assuming user is in the same browser
  ([58fc7d26](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/58fc7d26166367abb846cb33057c8df5cedc3fb5))
- **Recovery:** use download attribute for nicer file name and to prevent in-browser viewing
  ([1d35f29d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/1d35f29da815dbfcfd73aea6a14db6793a4c2b33))
- **Release:** use beta version of my-wallet-v3 bower
  ([85fbbd2d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/85fbbd2d908a4fa1a7e29e5e3f20032e02e8b026))
- **Reset2FA:** form to reset two step verification
  ([18ba4615](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/18ba4615c78516c837c7cfede8820f41751e9531))
- **Routes:**
  - show modal after verifying email
  ([4d1bdfaa](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/4d1bdfaaf19be2e8486ae578ba76dd849be76aa9))
  - login and verify email routes and endpoint support
  ([206d60b5](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/206d60b51c58e07bbc43a41db46816112cfcfebb))
- **Unsubscribe:** unsubscribe route
  ([632db4c6](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/632db4c634ac6b2792cc0f27310740b2c73ed8e4))


## Refactor

- **Cookies:** replace references to deprecated  with
- **Dependencies:** removed unused npm dependencies. Removed unmaintained E2E tests.
- **RecoverGuid:** move functionality out of controller
- **Signup:** cleaned up controller and improved tests
- **WalletTokenEndpoints:** slightly modified result


## Test

- fixed
- **Mocks:** added MyWalletTokenEndpoints mock


## Chore

- **Changelog:** update for beta branch



---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problem or suggestion, create an issue.* :) **Thanks** </sub></sup>