angular
  .module('didYouKnow', [])
  .factory('DidYouKnow', DidYouKnow);

function DidYouKnow() {
  const service = {
    dyks: [
      {
        id: 1,
        title: 'DYK_CUSTOM_FEES_TITLE',
        type: 'FEATURE',
        text: 'DYK_CUSTOM_FEES',
        icon: 'ti-signal',
        linkText: '',
        link: ''
      }, {
        id: 2,
        title: 'DYK_RECOVERY_TITLE',
        type: 'FEATURE',
        text: 'DYK_RECOVERY',
        icon: 'ti-lock',
        linkText: 'SECURITY',
        link: '/#/settings/security'
      }, {
        id: 3,
        title: 'DYK_TX_FEES_TITLE',
        type: 'EDUCATIONAL',
        text: 'DYK_TX_FEES',
        icon: 'ti-thought',
        linkText: '',
        link: ''
      }, {
        id: 4,
        title: 'DYK_FEEDBACK_TITLE',
        type: 'FEATURE',
        text: 'DYK_FEEDBACK',
        icon: 'ti-announcement',
        linkText: 'GIVE_FEEDBACK',
        link: '/#/feedback'
      }, {
        id: 5,
        title: 'DYK_BTC_VALUE_TITLE',
        type: 'EDUCATIONAL',
        text: 'DYK_BTC_VALUE',
        icon: 'ti-stats-up',
        linkText: '',
        link: ''
      }
    ]
  };
  return service;
}
