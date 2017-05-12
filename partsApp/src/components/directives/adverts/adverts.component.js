import Template from './adverts.pug';

class Controller {

  constructor ($scope, $injector, $stateParams) {
    this.title = 'Adverts';
    this.scenarioLinks =
    [
      { title: 'Scenario 1', description: 'This should display a single ad.', href: 'adverts({scenarioId:1})' },
      { title: 'Scenario 2', description: 'This should display two ads.', href: 'adverts({scenarioId:2})' }
    ];

    let ad1 = {
      id: 1,
      name: 'Hashnest',
      data: 'data:image/png;base64,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'
    };

    let ad2 = {
      id: 2,
      name: 'Blockchain',
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHwAAAAVCAYAAACE5YosAAAABGdBTUEAALGPC/xhBQAABaxJREFUaAXtmA1olVUYx11bX0rTLMnMvGWhkTVzbWUZTkKlEG4g1spKBUfRIMQkLIpcoVk5hIqKPiiWUEwxS3BF9GFIKSy3QPvQkXNObLWVzo+SbLv9/u/OuZ17eF333o07wfeB357nPM9zPna+3rMNGhRJNAPRDEQz0OsMJBKJs+GMXpOi4CkxA3nZjkKLTN2lUA7joQu2wIq8vLwv0RkLbRZRqcqpuJy2GvDH8S1w/BXY/8BLUOj4rVlHvbdswWraGYu9CCaCxv8z1MImGAfPgpUXaGMbdW7D8YB1oithBDzt+N4nd53K5N+Oegi6oRP/fHxzsedAmKwkp14B8kahNL7rQb9XM2yA9VANl0KYHKaNBWGBfvExsELYAZI22ARbodvwcDYdUXc6uKLJ00QscZ3Ymhj5p8FfXkzFvZCymSnH4QT40oVjNEzxArNNH5We/wrKt3q+DsrDTf6DTqzd+JY7Pt+8w+TcTOBPP2jKxejvTxKTO+hH7fyfZHsNv0HD18DLEGN3zYKbsEugDV5kEMfhAKyGIfj6XehzM42uCmk4hq/M+un/XOz3oMD4jqL3G/sT2rG2cWWsLqDGyoxrpVZYS1HjlByHvZCARsbXgO4XsROQdmNMnq6zu2ArLGIwGlQgGhjxhRTqoAl0LS2GUvxlxHXNZSJl1FMb1/VSaZoT68C+0JTvR2829g1od9PVUNaVrFzXTzEpt9D3mZR0vaYjFeTrM5Jys5ykojZjo4kdo9547Euc3I+wHwH1P8b4dcg0Vn1SbG4n9vOQTp+kZSEMbiFIHrfVsfNhDAyWDx0sELoAakGyHmK2Tpgm7l/pqhcm9kqPEdRnxMoz1kB3QnBi0JMcv2tupxA3Y/avdDfPtcOudBuvx3A/Ae2m7d6u9MHUudg24Gld4/PcuaKsMVtpdWPp2Bld6fQyhUb1UNKpbnE60A6bAd+Qo6spOMmcaD2sdNXpcaRv4tfE7Qmk2GeZSwt2dx/Bft1pUTdD8H1kHDpNrzkxaxZjfMiYplpHlvpNU68ErRsuI2F8v1ChCpK3pWnganQN47vTlHOr6LgOJDPDesY/J4gmEofQehEnhfKTJrYs6fQM4jNMjlU/Yeil3GIdRtsTvtPxN2HfB384Pn1aAsE3EkrgCfgcXNE7wz/hu/Gp72ZwJeyEX0RCq5tkbHvCV3ixNZSrDbq2dStqfBPgUdgIruj9EQjO3J1wetQO3sOO/LSn+/9+MhBd4zpF2qU6df6uXINPclWPCv3p7/DF9DWZTN0qKUJ/E3FMcJxXYquP8x3fTPK0GLrJtoE+Q/vgC3DlV7dg7MdM36tCYr7rMI7e/jLxfy/lHzQUmcY2olfD7/Cx8Vn1mzX6qjN9tO2iw8lMYCmTUW87p6yNoE0wFCrgA3gXXLnbFH5wnX2w7/XqBp8R49MCS/JB177GHTPMRrtylMIG0GM0W+lmPvRp0KLF02ik0sk5SD2NvdT4/NvzBP5aJ79Ppp2YdBt5ikTV0bdYD5RyGEv5MyiE+fzib8Mh7OAfH8TXgRb5OTgAr0BfRWO4x2lEr/MC+tUCa9NpkqzMwxgOrdbhaG2EOPV2O75szC5TSaf8WBYNjKJOU0i9ffjKGZ/+IuoXsQ+etBtj8aaSvAx0hVfBO1ADaxlYyk4ktxj/FtD19RUsJWc/OlTI12LpoWLlR/L1HtCE6IRa2YFxrS2gj5C305bJn4R9ji2jdZ1L1PZlMAT2QAP1utH6hp6H0v8WrOwipvfASByXWye6Ec4CtaW6Ot3fogMhfwlGtSl2EBuBT/8hG218vmomp01O8sahdICGQQvUE9PDNynkFFHQ+CV/E9/eY0Y/B2QGWJB8+A4k7QMyiKjT3M4AC30j6F+20YLnduoHrjcW+9VowQdu/nPeM4s9FPTWiOR0mQEWfPrp8rtGv2c0A9EMnAoz8C+8IvzY7xvL4AAAAABJRU5ErkJggg=='
    };

    let MockedAdverts = $injector.get('Adverts');
    switch ($stateParams.scenarioId) {
      case '1':
        {
          MockedAdverts.ads = [ad1];
        }
        break;
      case '2':
        {
          MockedAdverts.ads = [ad1, ad2];
        }
        break;
    }
  }
}

export default {
  controller: Controller,
  template: Template
};
