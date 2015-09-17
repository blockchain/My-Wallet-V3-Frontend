angular.module("didYouKnow", []).factory "DidYouKnow", () ->

  service = {
    dyks: [
      {
        id: 1
        title: 'DYK1_TITLE'
        type: 'FEATURE'
        text: 'DYK1'
        icon: 'ti-signal'
        linkText: ''
        link: ''
      },
      {
        id: 2
        title: 'DYK2_TITLE'
        type: 'FEATURE'
        text: 'DYK2'
        icon: 'ti-lock'
        linkText: 'WALLET_RECOVERY'
        link: '/#/settings/wallet-recovery'
      },
      {
        id: 3
        title: 'DYK3_TITLE'
        type: 'EDUCATIONAL'
        text: 'DYK3'
        icon: 'ti-thought'
        linkText: ''
        link: ''
      },
      {
        id: 4
        title: 'DYK4_TITLE'
        type: 'FEATURE'
        text: 'DYK4'
        icon: 'ti-announcement'
        linkText: 'GIVE_FEEDBACK'
        link: '/#/feedback'
      },
      {
        id: 5
        title: 'DYK5_TITLE'
        type: 'EDUCATIONAL'
        text: 'DYK5'
        icon: 'ti-stats-up'
        linkText: ''
        link: ''
      }
    ]
  }

  return service
