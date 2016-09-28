angular
  .module('didYouKnow', [])
  .factory('DidYouKnow', DidYouKnow);

function DidYouKnow () {
  const getRandInRange = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  const dyks = [
    {
      id: 1,
      title: 'DYK_CUSTOM_FEES_TITLE',
      type: 'FEATURE',
      text: 'DYK_CUSTOM_FEES',
      icon: 'ti-signal'
    }, {
      id: 2,
      title: 'DYK_RECOVERY_TITLE',
      type: 'FEATURE',
      text: 'DYK_RECOVERY',
      icon: 'ti-lock',
      linkText: 'SECURITY_CENTER',
      state: 'wallet.common.security-center'
    }, {
      id: 3,
      title: 'DYK_TX_FEES_TITLE',
      type: 'EDUCATIONAL',
      text: 'DYK_TX_FEES',
      icon: 'ti-thought'
    }, {
      id: 4,
      title: 'DYK_BTC_VALUE_TITLE',
      type: 'EDUCATIONAL',
      text: 'DYK_BTC_VALUE',
      icon: 'ti-stats-up'
    }, {
      id: 5,
      title: 'DYK_TOP_SECURITY_TIPS_TITLE',
      type: 'EDUCATIONAL',
      text: 'DYK_TOP_SECURITY_TIPS',
      icon: 'ti-lock',
      linkText: 'SECURITY_CENTER',
      state: 'wallet.common.security-center'
    }, {
      id: 6,
      title: 'WALLET_ID_EXPLANATION_TITLE',
      type: 'EDUCATIONAL',
      text: 'WALLET_ID_EXPLANATION',
      icon: 'ti-id-badge'
    }, {
      id: 7,
      title: 'DYK_MOBILE_TITLE',
      type: 'FEATURE',
      text: 'DYK_MOBILE',
      icon: 'ti-mobile',
      linkText: 'PAIRING_CODE',
      state: 'wallet.common.settings.info'
    }, {
      id: 8,
      title: 'DYK_HOW_IT_WORKS_TITLE',
      type: 'EDUCATIONAL',
      text: 'DYK_HOW_IT_WORKS',
      icon: 'ti-cloud-up'
    }, {
      id: 9,
      title: 'DYK_HD_PRIVACY_TITLE',
      type: 'EDUCATIONAL',
      text: 'DYK_HD_PRIVACY',
      icon: 'ti-check'
    }, {
      id: 10,
      title: 'DYK_DYNAMIC_FEES_TITLE',
      type: 'FEATURE',
      text: 'DYK_DYNAMIC_FEES',
      icon: 'ti-check'
    }, {
      id: 11,
      title: 'DYK_OPEN_SOURCE_TITLE',
      type: 'EDUCATIONAL',
      text: 'DYK_OPEN_SOURCE',
      icon: 'ti-github'
    }
  ];

  const survey = {
    id: 5,
    title: 'SEND_FEEDBACK',
    type: 'SURVEY',
    text: 'DYK_FEEDBACK_VALUE',
    icon: 'ti-announcement',
    linkText: 'SHARE_FEEDBACK',
    external: true,
    state: 'https://blockchain.co1.qualtrics.com/SE/?SID=SV_0PMH4ruxU5krOmh'
  };

  const service = {
    getAll: () => dyks, // Only used for tests
    getRandom: () => dyks[getRandInRange(0, dyks.length - 1)],
    getSurvey: () => survey
  };
  return service;
}
