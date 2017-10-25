/* eslint-disable semi */
angular
  .module('walletApp')
  .factory('blockAlert', blockAlert)

function blockAlert () {
  const service = {}

  let localized = (en) => ({ en })

  service.pre = {
    type: 'warning',
    header: localized('ALERT: Upcoming Service Interruption'),
    sections: [
      {
        title: localized('The Segwit2x (BTC1) hard fork will take place at block 494784 (on or about November 16th).'),
        body: localized('Your funds will be safe throughout the fork but, in an effort to keep user funds safe, we will be temporarily suspending send, buy, sell and exchange functionality until the network stabilizes. Ether functionality will remain intact.')
      }
    ],
    action: {
      title: localized('For more details on the fork and how it impacts our users, read our blog post here.'),
      link: 'https://blog.blockchain.com/'
    }
  }

  service.during = {
    type: 'danger',
    header: localized('Ongoing service interruption'),
    sections: [
      {
        title: localized('Bitcoin Hard Fork:'),
        body: localized('Segwit2x (BTC1) Started on XX November 2017')
      },
      {
        title: localized('What you need to know:'),
        body: localized('Your funds are safe, all bitcoin transactions are on hold. Not send, buy & sell or exchange is possible until the fork resumes.')
      },
      {
        title: localized('Why is your balance 0?'),
        body: localized('Due to the volume of transaction happening in the blockchain at this time, it’s very difficult to show and accurate price for your bitcoin holdings.')
      },
      {
        title: localized('What to do next?'),
        body: localized('We are working hard to resume business as usual as soon as all the dust has settle. Please remain patient while the consensus is taking place.')
      }
    ],
    action: {
      title: localized('Visit our blog post with more the information'),
      link: 'https://blog.blockchain.com/'
    }
  }

  service.after = {
    type: 'info',
    header: localized('And we\'re back!'),
    sections: [
      {
        title: localized('The bitcoin community has now reached a consensus.'),
        body: localized('This is the status of the service at the moment [to be written at the time]. Bitcoin price will be a bit unstable over the next few days. You don’t need to do anything. We will let you know if any kind of action is required from your side.')
      }
    ]
  }

  return service
}
