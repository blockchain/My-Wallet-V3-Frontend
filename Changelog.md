__Blockchain HD Frontend__

_Recent changes_

#   (2015-08-20)



---

## Bug Fixes

- **Send:** pasted watch only address sticks
  ([017735b5](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/017735b5a059c665ee893185641363daa4ea13e4))
- **UI:**
  - simplify navbar logo/menu CSS
  ([5098145b](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/5098145bac3fe58c1de4a5b614e0df303189cd95))
  - rm .form-group class from directive
  ([94bb3a6c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/94bb3a6cef9c4ef7e8f210bb427a499d41b5496b))
- **bc-async-input:** cancel after submit no longer undoes the previous change
  ([4d38ad77](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/4d38ad77f20e6f2cae32b1fc002b6aba61d253cd))
- **contextualMessage:** add missing 0 to balance check
  ([120e947b](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/120e947b1b13ae97ce6f3fd24ec5bbc188a0858a))
- **responsiveUI:**
  - use flex on header, position fix body viewport
  ([ff635ec6](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/ff635ec6882715cdf3ba3a6932f870ceeb427b73))
  - go with a less is more approach on mobile, add some spacing to tx-addrs on tablet sized resolutions
  ([d0621e31](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/d0621e3168cad0138be09f669de55c4682435c6f))
- **send:** to label displays correctly depending on the destinations
  ([c53ad049](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/c53ad049eb337e0f242257c29d2b1210e19dcb99))
- **verify-mobile-number:**
  - link for resending verification code
  ([4b9e8d14](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/4b9e8d14727339c0a585d0560d4d4ec86cc8e6bb))
  - reset verification code and error message on completion
  ([17e047fc](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/17e047fc1db68d9c3a18524fe23cb27f7d9f3eb1))


## Features

- **browser:** drop support for Safari 3, 4 & 5
  ([97c26809](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/97c2680916b84735e461e9412eaefafa095c09f2))


## Refactor

- delete unused navigation_ctrl methods
- **TopCtrl:** simplified reference to Wallet.total
- **UI:**
  - align cols to baseline in home, less clunky first-time modal
  - update note ux, center modals, redo send confirm screen, update ladda spinner
- **signin:** move out of modals for sign up, get rid of registration ctrl & test
- **signup:**
  - more cleanup inside signup markup + css, rm reference to registration ctrl
  - move register html into signup, controller refactored, delete unused css


## Chore

- **changelog:**
  - add to grunt dist task
  - configured git-changelog



---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problem or suggestion, create an issue.* :) **Thanks** </sub></sup>