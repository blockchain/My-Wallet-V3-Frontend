"use strict"

window.theFormatter = (val) ->
  return "Nonsense"

# App Module 
walletApp = angular.module("walletApp", [
  "walletFilters"
  "walletServices"
  "securityCenter"
  "ui.router"
  "ui.bootstrap"
  "ngCookies"
  "myWalletServices"
  "ui.select"
  "ngAudio"
  "ngSanitize"
  "ja.qr"
  "webcam"
  "LocalStorageModule"
  "ngNumeraljs"
  "pascalprecht.translate"
  "ui.bootstrap-slider"
  # TODO: have grunt generate the list of partials and templates
  "partials/account-form.jade"
  "partials/accounts-navigation.jade"
  "partials/alerts.jade"
  "partials/claim.jade"
  "partials/dashboard.jade"
  "partials/login.jade"
  "partials/navigation.jade"
  "partials/open-link.jade"
  "partials/request.jade"
  "partials/second-password.jade"
  "partials/send.jade"
  "partials/signup.jade"
  "partials/top.jade"
  "partials/transaction.jade"
  "partials/transactions.jade"
  "partials/upgrade.jade"
  "partials/settings/accounts.jade"
  "partials/settings/addresses.jade"
  "partials/settings/address.jade"
  "partials/settings/advanced.jade"
  "partials/settings/change-password.jade"
  "partials/settings/import-address.jade"
  "partials/settings/mobile.jade"
  "partials/settings/my-details.jade"
  "partials/settings/navigation.jade"
  "partials/settings/security-center.jade"
  "partials/settings/set-second-password.jade"
  "partials/settings/settings.jade"
  "partials/settings/wallet-recovery.jade"
  "partials/settings/wallet.jade"  
  "partials/confirm-recovery-phrase-modal.jade"  
  "templates/amount.jade"
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
  "templates/bc-qr-reader.jade"
  # 'angular-ladda'
])

walletApp.config (uiSelectConfig) ->
  uiSelectConfig.theme = 'bootstrap'
  
walletApp.config ($numeraljsConfigProvider) ->
  $numeraljsConfigProvider.setFormat('btc', '0,0.00 BTC')
  
# Danger! Use for debugging only:
# walletApp.config ($sceProvider) ->
#   $sceProvider.enabled(false);