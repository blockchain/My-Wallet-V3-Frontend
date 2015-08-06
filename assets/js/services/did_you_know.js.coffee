angular.module("didYouKnow", []).factory "DidYouKnow", ($log, $rootScope, $translate) ->

  service = {
    dyks: [
      {
        title: 'You can send Custom Fees?'
        type: 'Feature'
        text: 'When the bitcoin network is experiencing a lot of traffic, you can ensure that your transactions go through by enabling higher fees with our Advanced Send feature. Just click on the Advanced Send toggle in our Send screen to get started!'
        icon: 'ti-signal'
        linkText: ''
        link: ''
      },
      {
        title: 'Passwords are not stored or shared with us?'
        type: 'Feature'
        text: 'This means only you know the password you used for your wallet, but your funds can still be recovered with the 12-word recovery phrase. Find out how and more by visiting our'
        icon: 'ti-lock'
        linkText: 'Security Center'
        link: '/#/security-center'
      },
      {
        title: 'What transaction fees are for?'
        type: 'Educational'
        text: 'Transaction fees are used for sending bitcoins, which are collected by the Bitcoin network of miners. To assure your transaction is confirmed by the network, we automatically include the appropriate fee based on the network standards.'
        icon: 'ti-thought'
        linkText: ''
        link: ''
      },
      {
        title: "We're interested in your feedback?"
        type: 'Feature'
        text: "Our Alpha Wallet depends on you! Send us what you liked, loved, or hated to our team. All of the feedback is collected and reviewed directly by our development team."
        icon: 'ti-announcement'
        linkText: 'Give Us Your Feedback'
        link: '/#/feedback'
      },
      {
        title: "Bitcoin value is constantly changing?"
        type: 'Educational'
        text: "Our wallet balances are reflected in bitcoin, but we do show a dollar estimation based on the current market price. The amount of bitcoins will stay the same regardless of market fluctuations in price."
        icon: 'ti-stats-up'
        linkText: ''
        link: ''
      }
    ]
  }


  return service
