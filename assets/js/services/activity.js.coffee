walletServices.factory 'Activity', ($rootScope, Wallet) ->

  activity  = { activities: [], transactions: [], logs: [], limit: 8 }
  helpers   = {}

  # Helpers
  helpers.getTxMessage = (tx) ->
    return 'TRANSFERRED' if tx.intraWallet
    return if tx.result < 0 then 'SENT' else 'RECEIVED'

  helpers.capitalize = (str) ->
    str[0].toUpperCase() + str.substr(1)

  helpers.timeSort = (x, y) ->
    x.time < y.time

  helpers.hasTime = (x) ->
    x.time? && x.time > 0

  # Methods
  activity.factory = (type, obj) ->
    a = { type: type }
    switch type
      when 0
        a.title   = 'TRANSACTION'
        a.icon    = 'ti-layout-list-post'
        a.time    = obj.txTime * 1000
        a.message = helpers.getTxMessage(obj)
        a.result  = Math.abs(obj.result)
      when 4
        a.title   = 'LOGGING'
        a.icon    = 'ti-settings'
        a.time    = obj.time
        a.message = helpers.capitalize(obj.action)
    return a

  activity.combineAll = () ->
    activity.activities = activity.transactions
      .concat(activity.logs)
      .filter(helpers.hasTime)
      .sort(helpers.timeSort)
      .slice(0, activity.limit)
    $rootScope.$safeApply()

  activity.updateTxActivities = () ->
    activity.transactions = Wallet.transactions
      .slice(0, activity.limit)
      .map activity.factory.bind(null, 0)
    activity.combineAll()

  activity.updateLogActivities = () ->
    Wallet.getActivityLogs (logs) ->
      activity.logs = logs.results
        .slice(0, activity.limit)
        .map activity.factory.bind(null, 4)
      activity.combineAll()

  activity.updateAllActivities = () ->
    activity.updateTxActivities()
    activity.updateLogActivities()

  return activity
