"use strict"

window.theFormatter = (val) ->
  return "Nonsense"

# App Module 
modules = [
  "walletFilters"
  "walletServices"
  "securityCenter"
  "adverts"
  "ui.router"
  "ui.bootstrap"
  "ngCookies"
  "ngAnimate"
  
  # TODO get rid of these wrappers and modify the original files to work with injection?
  "myWalletServices" 
  "myWalletStoreServices"
  "myWalletSpenderServices"
  "myBlockchainApiServices"
  "myBlockchainSettingsServices"
  
  "ui.select"
  "ngAudio"
  "ngSanitize"
  "ja.qr"
  "LocalStorageModule"
  "ngNumeraljs"
  "pascalprecht.translate"
  # "ui.bootstrap-slider" // Mining fee picker is not used a.t.m.
  "angular-inview"
  "passwordEntropy"
  "internationalPhoneNumber"
  "webcam"
  # TODO: have grunt generate the list of partials and templates
  "partials/account-form.jade"
  "partials/alerts.jade"
  "partials/claim.jade"
  "partials/dashboard.jade"
  "partials/support.jade"
  "partials/feedback.jade"
  "partials/login.jade"
  "partials/navigation.jade"
  "partials/open-link.jade"
  "partials/request.jade"
  "partials/second-password.jade"
  "partials/send.jade"
  "partials/signup.jade"
  "partials/register.jade"
  "partials/top.jade"
  "partials/transaction.jade"
  "partials/transactions.jade"
  "partials/upgrade.jade"
  "partials/wallet-navigation.jade"
  "partials/common.jade"
  "partials/modal-notification.jade"
  "partials/security-center.jade"
  "partials/settings/accounts.jade"
  "partials/settings/addresses.jade"
  "partials/settings/address.jade"
  "partials/settings/advanced.jade"
  "partials/settings/change-password.jade"
  "partials/settings/import-address.jade"
  "partials/settings/mobile.jade"
  "partials/settings/my-details.jade"
  "partials/settings/navigation.jade"
  "partials/settings/set-second-password.jade"
  "partials/settings/settings.jade"
  "partials/settings/show-private-key.jade"
  "partials/settings/wallet-recovery.jade"
  "partials/settings/wallet.jade"  
  "partials/confirm-recovery-phrase-modal.jade"  
  "partials/wallet.jade"
  "templates/amount.jade"
  "templates/fiat-or-btc.jade"
  "templates/virtual-keyboard.jade"
  "templates/currency-picker.jade"
  "templates/language-picker.jade"
  "templates/network-fee-picker.jade"
  "templates/transaction-description.jade"
  "templates/transaction-note.jade"
  "templates/transaction-status.jade"
  "templates/security-badge.jade"
  "templates/configure-mobile-number.jade"
  "templates/confirm-recovery-phrase.jade"
  "templates/two-factor.jade"
  "templates/configure-second-password.jade"
  "templates/tor.jade"
  "templates/api-access.jade"
  "templates/ip-whitelist-restrict.jade"
  "templates/bc-async-input.jade"
  "templates/verify-email.jade"
  "templates/resend-email-confirmation.jade"
  "templates/adverts.jade"
  "templates/multi-account.jade"
  "templates/btc-picker.jade"
  # 'angular-ladda'
]

walletApp = angular.module("walletApp", modules)

walletApp.config (uiSelectConfig) ->
  uiSelectConfig.theme = 'bootstrap'
  
walletApp.config ($numeraljsConfigProvider) ->
  $numeraljsConfigProvider.setFormat('btc', '0,0.00 BTC')
  
# Danger! Use for debugging only:
# walletApp.config ($sceProvider) ->
#   $sceProvider.enabled(false);
