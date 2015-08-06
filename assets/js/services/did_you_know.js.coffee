angular.module("didYouKnow", []).factory "DidYouKnow", ($log, $rootScope, $translate) ->

  service = {
    dyks: [
      {
        title: $translate.instant('DYK1_TITLE')
        type: $translate.instant('FEATURE')
        text: $translate.instant('DYK1')
        icon: 'ti-signal'
        linkText: ''
        link: ''
      },
      {
        title: $translate.instant('DYK2_TITLE')
        type: $translate.instant('FEATURE')
        text: $translate.instant('DYK2')
        icon: 'ti-lock'
        linkText: $translate.instant('WALLET_RECOVERY')
        link: '/#/settings/wallet-recovery'
      },
      {
        title: $translate.instant('DYK3_TITLE')
        type: $translate.instant('EDUCATIONAL')
        text: $translate.instant('DYK3')
        icon: 'ti-thought'
        linkText: ''
        link: ''
      },
      {
        title: $translate.instant('DYK4_TITLE')
        type: $translate.instant('FEATURE')
        text: $translate.instant('DYK4')
        icon: 'ti-announcement'
        linkText: $translate.instant('GIVE_FEEDBACK')
        link: '/#/feedback'
      },
      {
        title: $translate.instant('DYK5_TITLE')
        type: $translate.instant('EDUCATIONAL')
        text: $translate.instant('DYK5')
        icon: 'ti-stats-up'
        linkText: ''
        link: ''
      }
    ]
  }


  return service
