__Blockchain HD Frontend__

_Recent changes_

#   (2015-10-08)



---

## Bug Fixes

- **Accounts:** show default account
  ([3b305a7d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/3b305a7d7a92e377da29c9f0220fbae79ddeec09))
- **Address:**
  - show back arrow on imported address page
  ([94801fa4](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/94801fa4e40abe05f6fdf5d0832bf4612cb3ca05))
  - no longer allow sweep imported address to archived account
  ([e72a2772](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/e72a2772f31cc6f825ee9e47e8890d273925f75f))
  - use current receive index for new address
  ([26eac016](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/26eac0162ae5cd2dbbf3d5c13d21efa9c8cd867d))
- **Addresses:** show either fiat or btc but not both in Address view
  ([39fc0f80](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/39fc0f80515099dab98028d832cde85c21176777))
- **BIP38:** warn user that this may take a while
  ([54c70aac](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/54c70aac11289442d4c3ad91d0b45c1d35b7bdd2))
- **CSP:**
  - switch to ui-select fork to avoid unsafe-inline
  ([b366db87](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/b366db8709559e7cb5950a6d20b002d3dc841f52))
  - frame-src is depricated, setting child-src to non
  ([aebd8d45](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/aebd8d45e4756b25715f5c4883970032b8914b55))
  - added media-src: blob: for Chrome 45.
  ([f465acd9](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/f465acd9415484232de88ad625fcd47068253fc6))
- **Chrome:** prevent overflow of 'Verify on bc.i'
  ([7f213b20](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/7f213b201cbddbb54b31658923f342e532270bba))
- **IE:** take out overflow hidden from body, use normal doc flow to layout stuff
  ([d8d9b4f3](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/d8d9b4f34dc892dff91650abfdbc099f21bc6432))
- **Import:**
  - QR scan didn't work
  ([f3a3305f](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/f3a3305fbec0b63f1a4be73455ea1fc83d8d5b0e))
  - only ask 2nd password once for BIP38
  ([404958b5](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/404958b546e035ceb17aa76e409f4dec5351f308))
- **PBKDF2:** close field after entering 2nd pwd
  ([931450fb](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/931450fb5bb7b8ffe2b2224ca77ba3123f109da1))
- **Receive:** redeem from email/sms
  ([dd8857d7](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/dd8857d76bb5c709f392a674913ad0663adcee39))
- **Send:**
  - remove error messages on reset
  ([ab671f1f](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/ab671f1f53bab93a365efdda38ae87d1b207c3d4))
  - press enter does the right thing
  ([4ddbffee](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/4ddbffee818d1546868ab644cdff1df903b8eeb3))
  - hide 'External' before user is typing.
  ([2a5f6eff](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/2a5f6effad125527a6f8531d646408ab11db8ac1))
  - pasted watch only address sticks
  ([017735b5](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/017735b5a059c665ee893185641363daa4ea13e4))
- **Send/Receive:** show placeholder 0
  ([25bec560](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/25bec56049212134e97286998c5fa92afafbc7d0))
- **Settings:** check that mobile number actually changed
  ([30d72c9a](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/30d72c9ae5c2beff25ebac84b08d49bddec2474b))
- **Transaction:** Don't show historical value for the first hour to prevent confusion.
  ([2fe2e0b9](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/2fe2e0b92081bdfe3c76ee14311b799e1282d6ff))
- **Transactions:** support displaying txs with multiple to accounts
  ([b9cfd11c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/b9cfd11cd23bf4e84c248cae3080870228b11e17))
- **UI:**
  - don't wrap on login button, hide hand icon on small devices
  ([c46f62eb](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/c46f62ebe739db80dd45c79fb70d6964ecf22637))
  - use CSS to override dynamic class name rendering in AF
  ([a6bd2dcd](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/a6bd2dcd81716e1178ebe1fe392be45d9c25c6de))
  - align two-step icons to bottom
  ([445084aa](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/445084aa39ff4f30025b1873a173999d2549a2fc))
  - refactor back button using icon instead of png
  ([42bd9b2e](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/42bd9b2e09c0bc0d15d1aad6eba22ff20a33e4c5))
  - take out auto centering for IE
  ([38558928](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/38558928bbc34fec444358a5716b5be028f46043))
  - qr scanner should flow below in Send modal
  ([dc811b3a](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/dc811b3a4335cce2615955a1f42b6c31b42fcd9c))
  - give setting views breathing room at bottom
  ([dfaa96d8](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/dfaa96d80e7eb935f50acf0bea94ce8ee545a4e6))
  - receive modal input widths auto sizing issues
  ([a6123cf7](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/a6123cf7602a660a51b0a19218175bc8797ec84e))
  - hide input spinners on -webkit, change class name on bc-async-input (padding only necessary)
  ([e9f1a11c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/e9f1a11cff5046992c02aa45621598e1b06581ed))
  - normalize search fields so they match transactions screen, make sure buttons don't break
  ([aed74541](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/aed745416be573cffbb2e0853235ced0ab129122))
  - use some creative css to make sure sections don't overlap across various screen sizes in the home page
  ([0958dd07](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/0958dd0753f50ac0cf12bbd5ac12ee6c5aa5d540))
  - move alerts in app to top right, fix authorization success msg, fix helper text widths on smaller screens, give max-height to advanced send modals
  ([d7f6e623](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/d7f6e623937415ca61e3b77e352d4bd395597b9f))
  - remove auto margin so that IE can flex correctly
  ([0931d56b](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/0931d56b1173fbc40caa774743b8223d23150987))
  - simplify navbar logo/menu CSS
  ([5098145b](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/5098145bac3fe58c1de4a5b614e0df303189cd95))
  - rm .form-group class from directive
  ([94bb3a6c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/94bb3a6cef9c4ef7e8f210bb427a499d41b5496b))
- **addresses:**
  - outdent span from icon
  ([e48a1dd6](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/e48a1dd68ad10edbd7e57d89dd4d1cccc539be6d))
  - prevent user from generating HD address after upgrade before sync is complete
  ([86e8cd8c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/86e8cd8c17ecfd05d28bfe0f19f9d507ad984587))
- **admin:**
  - add scroll class to admin html element
  ([d3ae1333](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/d3ae13331cc24f6d4ae05b50d7c3643aa5d56130))
  - show results of activating in modal
  ([d81ebb1d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/d81ebb1d3cc2309fcea44eba479f345ffc3db8b8))
- **alerts:**
  - specify alert clearing context in second password modal
  ([fff1110d](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/fff1110da90fd1ab1d62baefa1b17d4621936767))
  - allow specifying a context for clearing alerts
  ([cf0f8d0b](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/cf0f8d0bff11351e1c1934a2505bd939a99fb12d))
  - Modals have their own alert contexts
  ([1f12b51b](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/1f12b51b67c05114ffcf71bf73421a7c4fc03b63))
- **balance:** do not include watch only in legacy address balance
  ([54ac52bb](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/54ac52bbcb36f5719622919cc39772c6c5104f2d))
- **balances:** show address plus account balance when index is not given
  ([db0899f1](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/db0899f13e6aaefd8938b4014753c10163e6e14b))
- **bc-async-input:** cancel after submit no longer undoes the previous change
  ([4d38ad77](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/4d38ad77f20e6f2cae32b1fc002b6aba61d253cd))
- **claim:** add missing return
  ([dbb2834c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/dbb2834c92114e4cefc3591cccc895170135c297))
- **contextualMessage:** add missing 0 to balance check
  ([120e947b](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/120e947b1b13ae97ce6f3fd24ec5bbc188a0858a))
- **copy:** swap out from/to
  ([2b7d728b](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/2b7d728b4c4b197201e712cb4e252b0291ee5f1b))
- **dyk:** translate strings in view rather than in service
  ([db5f06c3](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/db5f06c3d10557b4a5054dc24cbf71ff7452e3d0))
- **empty-state:** remove unnecessary check which was causing it not to appear correctly
  ([b654f796](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/b654f796729aea088e359399b398d4bec4b4a1eb))
- **feedback:** validation, highlight required fields
  ([b010f20c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/b010f20c29562c15124519357970ef7ccccb654d))
- **home:** show imported address balance in accounts table
  ([4c6a3cba](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/4c6a3cba2ed4f0ac13f59e190b7a98de4a28ad0f))
- **import:** set busy to false on needsBipPassphrase
  ([ee3a5611](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/ee3a5611d24475d9a1d4a69d7b2b4a1e75f36bf0))
- **index:** fix typo
  ([1067b2b1](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/1067b2b175fff3f9baa64a853970c2daeeb9b2cf))
- **inline-styles:** remove inline style from directive template
  ([a6367f29](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/a6367f29ceb031fff409b9a45c923d46cd86ff46))
- **mobile-safari:** change header css so icons align nicely, remove unnecessary padding and margin + old css
  ([0a6d1b04](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/0a6d1b04a18677a1c3210a0f733f536eb927e223))
- **mock:** typo in payment mock
  ([26ff983a](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/26ff983af6f81b520266c929e98eed87c99cc9f7))
- **performance:** remove unneeded one-way binds
  ([13b0b98c](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/13b0b98c9e3e294bbe87b6eff71a8b8ab3b8bcbd))
- **recovery:** set working to false on error
  ([2e32e2e2](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/2e32e2e236a96e5518b1d42f60bc8cd48235db8a))
- **responsiveUI:**
  - use flex on header, position fix body viewport
  ([ff635ec6](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/ff635ec6882715cdf3ba3a6932f870ceeb427b73))
  - go with a less is more approach on mobile, add some spacing to tx-addrs on tablet sized resolutions
  ([d0621e31](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/d0621e3168cad0138be09f669de55c4682435c6f))
- **secondPasswordCtrl:** Change second password cancel message
  ([768c2c92](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/768c2c92f34cc7d8fb7a7e8738ce4efc8762c32e))
- **send:**
  - map destinations properly
  ([7e45432f](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/7e45432f545250db882eb61993250408ef32091a))
  - only buildTx when necessary, check for build errors when going to confirmation step
  ([784f7caa](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/784f7caa9dfaab882bd1f34b9e82ac03fc592a9a))
  - set private note correctly
  ([ad5250fa](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/ad5250fa4e27f3ad870959a1cc276bc337533f77))
  - make sure all fields are set and rebuild payment before trying to send
  ([84ca8dae](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/84ca8dae66e52d3723180fece9ca93ef751fcb66))
  - force payment fee when changing to advanced send
  ([b6378ab5](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/b6378ab573d1bbf80e84363ac73f0ed6bd827623))
  - take custom fee into account when validating amount
  ([77327c5e](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/77327c5e7cea647b4702d5465f7eb3a43e481d6b))
  - from field label stays static when fee changes
  ([182578fc](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/182578fce5d7472e33c64baecd45cb597d1022e9))
  - to label displays correctly depending on the destinations
  ([c53ad049](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/c53ad049eb337e0f242257c29d2b1210e19dcb99))
- **sendCtrl:**
  - check and make sure no destinations are null
  ([58eb4ce6](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/58eb4ce63aa1af2a167dc6a8e47da2df53edae92))
  - update payment when usd value changes or address is pasted
  ([56cd7c19](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/56cd7c19772a01fba33191f30ef67d267ba11005))
  - set to and amount in case of payment request
  ([b90e069a](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/b90e069a29fcff3f7cce4ae980d6582ac78c2ad9))
  - allow saving public note
  ([6d61aef7](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/6d61aef7c6eb57854b12667f8cbf92cd556f4e89))
  - fixes ui-select dropdown after pasting
  ([62b01308](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/62b013080ce1caba1caf303c9019efe348a983a6))
- **tasks:** include core correctly when building for dist
  ([e297018e](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/e297018e6a33e1b4af17410ba82b9304913bcf98))
- **transactions-feed:** watch the account index and fetch more tx's for that account, update test suite with mocked up MyWallet
  ([5ede55fa](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/5ede55fa3bf2d9879c94decf61abea2105a3044e))
- **translateMock:** Add .instant to mock
  ([b609f186](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/b609f18690afe9097631547f51410a0fb0726d5e))
- **upgrade:** Insist on 2nd password more clearly. Show spinner.
  ([8f0e7acb](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/8f0e7acb014477c6294535018b01140b0925108f))
- **verify-mobile-number:**
  - link for resending verification code
  ([4b9e8d14](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/4b9e8d14727339c0a585d0560d4d4ec86cc8e6bb))
  - reset verification code and error message on completion
  ([17e047fc](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/17e047fc1db68d9c3a18524fe23cb27f7d9f3eb1))


## Features

- **<noscript>:** Tell user to enable JavaScript
  ([4e5b06f0](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/4e5b06f0feb570e2e5a4dd0554db58a589748d4a))
- **Accounts:** reveal account xpub
  ([114e5d1f](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/114e5d1fd60073659f52145096625ed645d1a1d7))
- **Home:**
  - comment out legacy addresses for now, minor ui tweaks
  ([bf8d96ee](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/bf8d96ee6e8e41dcf9f7a45efb5e194bc87ecd99))
  - show legacy only if there's value, fix test
  ([969467f1](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/969467f1178d336d02529a9e3c3626de8d50c4c2))
  - add tabular account balance data, rm related tests
  ([8df1e934](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/8df1e934f30e8b93acc19936ee6978ac66cdd6fd))
- **UI:**
  - inline to rows in modals, right align labels
  ([1723c432](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/1723c432979d23dd1d5c1a53900d317c7ba54779))
  - make wallet navigation on mobile take up entire height of screen, shift toggle menu to right hand side
  ([a6c369a0](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/a6c369a0f4a2174855db21bf9161142d5bcae64a))
- **Xpub:** display warning to user before revealing Xpub
  ([cced1ffd](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/cced1ffdf9822c91ff451932f3b3f6f2f6b63097))
- **browser:** drop support for Safari 3, 4 & 5
  ([97c26809](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/97c2680916b84735e461e9412eaefafa095c09f2))
- **design:**
  - add @media query for better responsive behavior in scrolling & left menu
  ([7cb3ee44](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/7cb3ee448f26f6181463386895c9368211f0f617))
  - add "be your own bank"/branding
  ([b855be43](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/b855be430d86b6443bb098bf21e050efc7f9607d))
- **ladda-spinner:** remove gif, use a pure CSS3 spinner instead
  ([ecabaad2](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/ecabaad2c0e71a738d00c0845ca49bc4137e4356))
- **no script:** cross browser CSS to center the msg
  ([7d9fcd5a](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/7d9fcd5ad7c6b57581bcc43124fab4a4132ea664))
- **payment:** create wrapper for wallet-payment.js
  ([529f9ed4](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/529f9ed4cf1e751f20c8c253af4ca3574509789b))
- **recovery:** Recover funds markup and controller
  ([4693eee7](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/4693eee7f74d89118d3b02cae34a32bf16aea612))
- **security-center:** set default score > 0 for new wallet creation
  ([a4cc21d9](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/a4cc21d9d61311a83ede809f093e5a60c5731372))
- **send:** allow sending to multiple accounts
  ([289d2ad2](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/289d2ad24d729d99adee6f24fdf8326589966504))
- **signup:** remove email verification step
  ([32df37c9](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/32df37c9f6fa7b115beba0489f6fa7dd2db8e058))
- **walletRecovery:** add styles, ux, & references to new files
  ([d0cb2b0a](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/d0cb2b0a1daf5a2b1c2bbffd424a40e1b46761ff))
- **xpub:** touch up modal UI
  ([8f038d43](https://github.com/blockchain/My-Wallet-HD-Frontend/commit/8f038d4319140325514d4fe9b0a333b15a6cb06b))


## Refactor

- delete unused navigation_ctrl methods
- **CSP:** unsafe-inline CSS
- **CSS:** remove unnecessary modal-open css
- **Charts:** remove references of angular-charts and its dependencies
- **DidYouKnow:** move tests to pending until better translateFilter is created to test directive
- **Performance:** remove unused Bootstrap CSS modules
- **QR:** bump QR reader version
- **SecondPassword:** add bc-modal css class to center modal
- **TopCtrl:** simplified reference to Wallet.total
- **UI:**
  - remove unused CSP css
  - use utility classes, normalize typography
  - remove unused PNG's, delete unused CSS and references to it
  - normalize all settings UI to have labels if it's enable/disabled, remove references to old bootstrap buttons, deletes unused css
  - left align typography in receive modal & home page, reduce line-height
  - audit hex values and replace them with scss variable names, cleanup old css along the way
  - remove unused bootstrap references, add padding to textarea in send modal
  - align cols to baseline in home, less clunky first-time modal
  - update note ux, center modals, redo send confirm screen, update ladda spinner
- **advancedSettings:** Clean up validation functions, make sure fee-per-kb cannot exceed 0.01 btc
- **app:**
  - replace remaining walletApp uses
  - use angular module lookup rather than global app variable
- **claim:** clean redeem function code
- **controllers:**
  - rename controller files
  - use proper controller conventions
- **importAddress:** replace wallet-spender with payment.js
- **karma:**
  - only look for controllers in the controller directory
  - remove coffee controllers from files
- **layout:** use a more conventional positioning method
- **performance:** one-way data bind when we can
- **send:** remove tx.customFee, only use tx.fee
- **sendCtrl:** implement payment.js module
- **signin:** move out of modals for sign up, get rid of registration ctrl & test
- **signup:**
  - more cleanup inside signup markup + css, rm reference to registration ctrl
  - move register html into signup, controller refactored, delete unused css
- **templates:** move all templates into a single module
- **wrappers:**
  - remove use strict statements
  - move core module up in karma conf
  - move myWallet wrappers into core module


## Chore

- delete unused jade file
- **CSP:** provide script hash for browser detection
- **README:**
  - clarify that this is not the same wallet as blockchain.info
  - change HD references to V3
- **Travis:** fix NodeJS version at 0.12
- **Whitelist:** update angular-ui-router
- **accounts.controller:** rename controller
- **addressCtrl:** rename to address.controller
- **app:**
  - remove walletApp global variable
  - use correct reference to Spender
- **app.module:** remove nonsense function
- **changelog:**
  - add to grunt dist task
  - configured git-changelog
- **cleaning:** remove commented out code
- **css:** bring in Bootstrap modal CSS into app so we have more control
- **did-you-know:** add test coverage to the directive, rm un-necessary translate filter in jade file
- **es6:**
  - convert wallet_navigation controller
  - convert upgrade controller
  - convert transaction controller
  - convert reveal_xpub controller
  - convert recoverFunds controller
  - convert claim_modal controller
  - point script srcs in index to new settings controller names
  - wallet_settings_ctrl to es6
  - two_factor_ctrl to es6
  - convert show_private_key_ctrl to es6
  - convert settings_ctrl to es6
  - convert set_second_password_ctrl to es6
  - convert recovery_ctrl to es6
  - convert my_details_ctrl to es6
  - convert mobile_ctrl to es6
  - convert hd_address_ctrl to es6
  - convert change_password_ctrl to es6
  - convert advanced_ctrl to es6
  - convert addresses_ctrl to es6
  - convert addressImport controller to es6
  - convert address_ctrl.js to es6
  - convert accounts_ctrl to es6
  - Send Controller
  - fixed and converted function returns in ConfirmRecoverPhraseCtrl
  - fixed return statements in modalInstance resolve segments
  - converted FirstTimeCtrl
  - converted SecondPasswordCtrl
  - converted LoginCtrl
  - converted SignupCtrl
  - converted ModalNotificationCtrl
  - converted NavigationCtrl
  - converted OpenLinkCtrl
  - converted SecurityCenterCtrl
  - converted AppCtrl
  - converted FeedbackCtrl
  - converted ConfirmRecoverPhraseCtrl
  - converted ClaimCtrl
  - converted AccountFormCtrl
  - Added support and converted some controllers
  - converted TopCtrl
- **grunt:** reuse build task and remove debug tasks
- **header:** make dropdown explicitly have a background color
- **home:** remove unnecessary code
- **homeCtrl:** make es6 code more concise
- **mocks:** BlockchainApi service mock
- **readme:** remove Spender part of README
- **sendCtrl:** Remove unused scope functions
- **spender:** remove MyWalletSpender from frontend
- **test:** use payment mock in claim spec
- **walletRecovery:** hide wallet recovery option



---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problem or suggestion, create an issue.* :) **Thanks** </sub></sup>