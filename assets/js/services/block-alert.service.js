/* eslint-disable semi */
angular
  .module('walletApp')
  .factory('blockAlert', blockAlert)

function blockAlert () {
  const service = {}

  let localized = (en) => ({ en })

  service.pre = {
    type: 'warning',
    header: localized('Upcoming service interruption warning'),
    sections: [
      {
        title: localized('Preparing for the Bitcoin Hard Fork:'),
        body: localized('Segwit2x (BTC1) will take place roughly around mid-Novemeber or block height 494784.')
      },
      {
        title: localized('What you need to know:'),
        body: localized('Your funds will be safe, however once the fork starts all bitcoin transactions will be on hold. Not send, buy & sell or exchange will be possible until the fork resumes.')
      }
    ],
    action: {
      title: localized('Visit our blog post with all the information'),
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
    header: localized('Service restored'),
    sections: [
      {
        title: localized('What you need to know:'),
        body: localized('This is the status of the service at the moment [to be written at the time]')
      },
      {
        title: localized('What to do next:'),
        body: localized('Are we working on ways to get the legacy coins out?')
      }
    ]
  }

  return service
}
