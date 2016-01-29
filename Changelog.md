__Blockchain HD Frontend__

_Recent changes_

#   (2016-01-29)



---

## Bug Fixes

- **2FA:** don't allow phone number change while SMS 2FA is enabled
  ([9bf36310](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/9bf36310924ac381610f3ace924dc778ab40887a))
- **DidYouKnow:** use states instead of paths, cleaned up and added tests
  ([7d498725](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/7d498725ebe7bbe58ff6ced867f579efadaa21d7))
- **SecurityCenter:** email and password hint interaction with bcasync
  ([f8ac727c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/f8ac727c36d0b0e9f9613479c6a6deb5acc08fb7))
- **Upgrade:** don't allow ESC key to close modal
  ([6b4f9caf](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/6b4f9caf8debafb12e58c85f5ca11ca19495053b))
- **activityFeed:** update recent transactions when display currency is toggled
  ([cd9ef576](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/cd9ef5765a34f2f87649dec43d81dce5af7f4f0c))
- **alerts:** use directive to display alerts, fix closing behavior
  ([7cf31d37](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/7cf31d37e9bf9e1d0237b98ae63fbaeb523d0c11))
- **bcAsyncInput:** interaction fix for hiding and showing input fields
  ([640dbb1a](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/640dbb1a4eb53827e6d5ba85ae5e4b5b9d77cffe))
- **changePassword:**
  - do not allow changing to current password
  ([31a2a880](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/31a2a88086263fc49a9588d75797fb9d17d989b0))
  - do not allow user to set email as wallet password
  ([52e6ca0f](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/52e6ca0fb682d9719113ab23002a6cc4f5ba22d3))
- **home:** show imported addresses in balance table even with 0 balance
  ([d6f0eb12](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/d6f0eb12dd09c9e0a621d9f7896fb535bbda2664))
- **note:** trigger update after setting a tx note
  ([dd1359e1](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/dd1359e14077e0d91f6afd7750654d4626d69345))
- **preferences:** add minutes unit to logout time display
  ([b08ebe1b](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/b08ebe1b9a4ae0868e9697bc8ecf3a475f8ace28))
- **security:**
  - escape html where ng-bind-html is used
  ([bca8e00c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/bca8e00c6c0245460fd954f5f53850ce90678bb7))
  - show error when enable ip restrict fails
  ([9b05579f](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/9b05579fe46747af3a546689557ab05a0d81a397))
- **send:**
  - pass payment through error
  ([96e9955d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/96e9955d5a632d8cc1e412b44981907c059e231d))
  - rebuild tx after send failure so that retrying is possible
  ([9bad693f](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/9bad693fbe101f01d01e71e1f8125884cd56c08e))
- **translations:** fix display of translations followed by :
  ([db89bb9d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/db89bb9d74f297d001dcf27cd9cdd576953011fe))


## Features

- **Deploy:** hardcode version and show in console
  ([e9ac4c38](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/e9ac4c38c490b0882bc8c4ff4476adb930d67bc9))
- **Upgrade:** redirect to classic login if refused
  ([5b267792](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/5b26779298415883d802ecbdf83959c386461189))
- **dev:**
  - replace savePassword with autoReload
  ([3cd6513a](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/3cd6513add54ed690a21c2076b3424dcd07ef9ca))
  - automatically login and go to last url when flag is set
  ([794284ec](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/794284ec8d6ccb5e27471633ea744c6460ed7b11))


## Test

- **SecurityCenter:** add tests
- **changePassword:** test for setting password to email / current password



---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problem or suggestion, create an issue.* :) **Thanks** </sub></sup>