__Blockchain HD Frontend__

_Recent changes_

#   (2015-12-21)



---

## Bug Fixes

- **Deploy:**
  - ROOT_URL now required for dev, defaults to / in production
  ([93dd3c2d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/93dd3c2df8dcf7127c0e98e927d9fda734a54e09))
  - dmore aggresive cleaning in dist task
  ([32ef6349](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/32ef6349804aacadc57c1c1ea61b5ec34e450396))
  - clean bower and npm cache in dist task
  ([38be7640](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/38be7640dea9e3dbda21a2526c6814f953ed627f))
  - move CSS and JS to /js so that relative font path works
  ([bef9a15e](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/bef9a15ea18120da85e9c694abafb421e3134f40))
- **Feedback:**
  - missing controller file
  ([41b74a85](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/41b74a858117489b1ffbf93ed916af824cb8a9d3))
  - use new endpoint
  ([7857e2b2](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/7857e2b2542cabf01baa12511c1372d7e62127fc))
- **Signup:** improved validation
  ([fb9966fa](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/fb9966face09ae4037c5ae0f8d2645e069fba7bc))


## Features

- remove beta invite system
  ([788b8aa5](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/788b8aa503aca65b20819a730531b2b7b9062b07))
- **Login:**
  - new browser approval - different browser
  ([c3195ad6](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/c3195ad6e3b99830cfb71b4c5eef39a40be2b0fc))
  - new browser approval - assuming user is in the same browser
  ([4ad6e26c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/4ad6e26cd9e91056589e53e97a856d17dbbb8dc5))
- **Release:** use beta version of my-wallet-v3 bower
  ([0d828172](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/0d82817246118dd6d7488388154e341f556fae40))
- **Routes:**
  - show modal after verifying email
  ([d1a8991d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/d1a8991df43236d29dbab783716eecbb3ecf447d))
  - login and verify email routes and endpoint support
  ([ff315a76](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/ff315a76844d6f2ee5c079227bdb5b1230f76c07))
- **Unsubscribe:** unsubscribe route
  ([9ea51ccb](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/9ea51ccb2c74d57bc658f338c62a24ef93eb45a3))


## Refactor

- **Cookies:** replace references to deprecated  with
- **Dependencies:** removed unused npm dependencies. Removed unmaintained E2E tests.
- **Signup:** cleaned up controller and improved tests


## Test

- fixed
- **Mocks:** added MyWalletTokenEndpoints mock



---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problem or suggestion, create an issue.* :) **Thanks** </sub></sup>