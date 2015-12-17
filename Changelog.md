__Blockchain HD Frontend__

_Recent changes_

#   (2015-12-17)



---

## Bug Fixes

- **Alerts:** better error message for second password removal error
  ([08c75902](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/08c759021987dcc4a807ab27d6fa302a79b714e4))
- **HelpText:** corrected transaltion string for confirm modal fee helper text
  ([8360ceac](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/8360ceac53e5f36c97a297d1ed402ddf384026b9))
- **Recovery:** fix flashing buttons during step transitions
  ([ec8a9424](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/ec8a9424c5a10fa3fffdf886937317ce3630eafe))
- **Send:** prevent helper text from saying less than 0 funds are available
  ([5403f461](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/5403f4612dc0a57be6a6ec1a3f559872878e32f5))
- **Translations:** do not fail on load, load 'en' by default, change 'zh-cn' to 'zh_CN'
  ([33b3e526](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/33b3e5262523df2ae8c6e7355cb55ccda7c30fce))


## Refactor

- **BcAsyncInput:** coffee to es6
- **BtcPicker:** coffee to es6
- **Cleanup:** remove orphaned code country-data and browserify
- **CompletedLevel:** coffee to es6
- **ConfigureMobile:** coffee to es6
- **ConfigureSecondPassword:** coffee to es6
- **ConfirmRecoveryPhrase:** coffee to es6
- **CurrencyPicker:** coffee to es6
- **DYK:** coffee to es6
- **Directives:** use arrow notation, remove some return statements
- **Fiat:** coffee to es6
- **FiatOrBtc:** coffee to es6
- **FocusWhen:** coffee to es6


## Test

- **Coverage:** report coverage via Coveralls


## Chore

- **Github:** show test coverage badge



---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problem or suggestion, create an issue.* :) **Thanks** </sub></sup>