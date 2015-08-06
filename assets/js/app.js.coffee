"use strict"

window.theFormatter = (val) ->
  return "Nonsense"

# App Module
modules = [
  "walletFilters"
  "walletServices"
  "securityCenter"
  "didYouKnow"
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
  "bcTranslateStaticFilesLoader"
  # "ui.bootstrap-slider" // Mining fee picker is not used a.t.m.
  "angular-inview"
  "passwordEntropy"
  "internationalPhoneNumber"
  "webcam"
  "angularCharts"
  # TODO: have grunt generate the list of partials and templates
  "partials/account-form.jade"
  "partials/alerts.jade"
  "partials/claim.jade"
  "partials/home.jade"
  "partials/support.jade"
  "partials/feedback.jade"
  "partials/first-login-modal.jade"
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
  "partials/privacy-policy.jade"
  "partials/terms-of-service.jade"
  "partials/security-center.jade"
  "partials/settings/accounts.jade"
  "partials/settings/addresses.jade"
  "partials/settings/address.jade"
  "partials/settings/hd_address.jade"
  "partials/settings/advanced.jade"
  "partials/settings/change-password.jade"
  "partials/settings/import-address.jade"
  "partials/settings/mobile.jade"
  "partials/settings/my-details.jade"
  "partials/settings/set-second-password.jade"
  "partials/settings/settings.jade"
  "partials/settings/show-private-key.jade"
  "partials/settings/wallet-recovery.jade"
  "partials/settings/wallet.jade"
  "partials/settings/two-factor.jade"
  "partials/confirm-recovery-phrase-modal.jade"
  "partials/wallet.jade"
  "templates/activity-feed.jade"
  "templates/amount.jade"
  "templates/fiat-or-btc.jade"
  "templates/virtual-keyboard.jade"
  "templates/currency-picker.jade"
  "templates/language-picker.jade"
  "templates/network-fee-picker.jade"
  "templates/helper-button.jade"
  "templates/helper-popover.jade"
  "templates/did-you-know.jade"
  "templates/contextual-message.jade"
  "templates/completed-level.jade"
  "templates/completed-level-tooltip.jade"
  "templates/transaction-description.jade"
  "templates/transaction-note.jade"
  "templates/transaction-status.jade"
  "templates/confirm-recovery-phrase.jade"
  "templates/configure-second-password.jade"
  "templates/tor.jade"
  "templates/api-access.jade"
  "templates/ip-whitelist-restrict.jade"
  "templates/bc-async-input.jade"
  "templates/verify-email.jade"
  "templates/resend-email-confirmation.jade"
  "templates/adverts.jade"
  "templates/btc-picker.jade"
  "templates/configure-mobile-number.jade"
  "templates/verify-mobile-number.jade"
  "templates/transclude.jade"
  "templates/label-origin.jade"
  # 'angular-ladda'
]

walletApp = angular.module("walletApp", modules)

walletApp.config ($numeraljsConfigProvider, $modalProvider, uiSelectConfig) ->
  $numeraljsConfigProvider.setFormat('btc', '0,0.00 BTC')

  uiSelectConfig.theme = 'bootstrap'

# Danger! Use for debugging only:
# walletApp.config ($sceProvider) ->
#   $sceProvider.enabled(false);

walletApp.run ($rootScope, $modal, $cookies) ->
  $rootScope.$safeApply = (scope=$rootScope) ->
    scope.$apply() unless scope.$$phase || $rootScope.$$phase

  $rootScope.$on "showNotification", (_, notification) ->
    $modal.open(
      templateUrl: "partials/modal-notification.jade"
      controller: "ModalNotificationCtrl"
      windowClass: "notification-modal"
      resolve: { notification: -> notification }
    )

  # Listens for activity updates and saves them to the 'activity' cookie
  # param type: translation string to express the type of activity
  # param msg: message to be displayed for activity, can take translation
  #   strings as well as angular bindings (even w/ filters)
  #   example: "SENT {{20000|convert}}" will render to "Sent 0.0002 BTC"
  $rootScope.$on "saveActivityUpdate", (_, type, msg) ->
    # Build new activity object
    newActivity = { type: type, msg: msg, t: Date.now(), icon: 'ti-layout-list-post' }
    newActivity.icon = 'ti-settings' if type == 'SETTINGS'
    newActivity.icon = 'ti-lock' if type == 'SECURITY'
    newActivity.icon = 'ti-wallet' if type == 'MY_ACCOUNTS'
    # Replace the old cookie, adding new activity to it
    activityObj = ($cookies.getObject('activity') || [])
    activityObj.unshift(newActivity)
    activityObj.pop() if activityObj.length > 10
    options = { expires: new Date(1448341200000) }
    $cookies.putObject('activity', activityObj, options)
    # Update the currect activity list
    $rootScope.$broadcast('updateActivityList')
