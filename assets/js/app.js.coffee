"use strict"

# App Module 
walletApp = angular.module("walletApp", [
  "walletFilters"
  "walletServices"
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
])

walletApp.config (uiSelectConfig) ->
  uiSelectConfig.theme = 'bootstrap'
  
walletApp.config ($numeraljsConfigProvider) ->
  $numeraljsConfigProvider.setFormat('btc', '0,0.00 BTC')