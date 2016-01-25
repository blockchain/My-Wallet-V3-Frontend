__Blockchain HD Frontend__

_Recent changes_

#   (2016-01-25)



---

## Bug Fixes

- **Accounts:** delete extra table header in spendable addresses
  ([2f364c9d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/2f364c9d52652dd94c407ac825ec1f3a4f96895c))
- **Alerts:**
  - call displaySentBitcoin instead of receive
  ([e7ed97a4](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/e7ed97a46e2728d18d7ca6163831f14e9ccdda11))
  - missing comma
  ([8a8aa9c7](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/8a8aa9c7c1efdbfd0f7901d047319f61f58ff179))
- **Captcha:** cookie is now set by server, captcha won't work in local dev
  ([944c9c68](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/944c9c68cb1ef0b1356a3eee555866eb387edbfc))
- **Feedback:** show error message if submit fails
  ([886f6544](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/886f6544ea53e4cc5ffafdce127d0bfdae2374a7))
- **IE:** don't repeat warning
  ([47634563](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/476345639487e9056fc4ac55c163206cdc1221fb))
- **Locales:** change UID to Wallet ID
  ([58182f31](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/58182f31f018f3bcc3d3464f95850becfa5dcbb4))
- **Login:** use localized string and don't repeat check email message
  ([62efa9f9](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/62efa9f976ec5336ea8d87faf8f7701df959e386))
- **Translations:** support Chinese both as browser language and as custom setting
  ([35b56beb](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/35b56bebd531e682cdfe8e16e9bf97405bd2fb01))
- **WalletUpgrade:**
  - deleted line in home scss
  ([1ff1e701](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/1ff1e701464fb049e19353522cd17085d6d5f520))
  - take the upgrade dialogue out of signup controller since it was there for development only
  ([8d9af710](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/8d9af71098c64d4d61c8f3a769d6afcc515ef891))
- **bcAsyncInput:** add safeApply to isoscope root object
  ([65b08919](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/65b08919f583923abc93504b9bd352af5b73b973))
- **signup:** reset password confirmation when new password is edited
  ([2b9cf7ed](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/2b9cf7ed1e72d406bbcff37b6f592c9af13d65e1))


## Features

- **WalletUpgrade:**
  - add dummy desktop app border to preview images
  ([79c070a5](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/79c070a5fa60480acfd80d99cd8ce576c986b949))
  - take out pause on hover and just let the slider slide
  ([388c98f2](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/388c98f2aea7680dba3ddc8304c82d12012daa5b))
  - separate the new features into slides and add icons
  ([e842da95](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/e842da95476cad27904f15ad6449394c0b2374ad))
  - use a uib slider for more friendly upgrade dialogue
  ([6f14c527](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/6f14c5275b41a301255e5d4b97f707912e41634d))


## Refactor

- **DeCoffee:**
  - convert is-valid directive to es6
  - convert is-not-equal directive to es6
  - convert ip-whitelist-restrict directive to es6
  - convert helper-button directive to es6
  - convert contextual-messaging directive to es6
- **HdAddress:** change name to include 'directive'
- **ImportedAddress:** change name to include 'directive'
- **IsNotNull:** remove unused directive: is-not-null
- **IsValidAmount:** get rid of unused directive: is-valid-amount
- **IsValidAsync:** get rid of unused directive: is-valid-async


## Test

- **FeedbackCtrl:**
  - fixed broken test and added more
  - add tests
- **FiatDirective:** set isoScope.fiat for all cases, to please Travis
- **FirstTimeCtrl:** add tests
- **SendCtrl:** test for an alert call instead of modal open
- **bcAsyncInput:**
  - add tests for cancel and save
  - set spy before calling save()


## Chore

- **Changelog:** 1.3.1



---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problem or suggestion, create an issue.* :) **Thanks** </sub></sup>