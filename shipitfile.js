var timers = require('timers');

var current = '~/HD-Wallet/current';
var serverInfo = '~/HD-Wallet/server-info';
var myWallet = current + '/assets/js/my-wallet';

var commands = {
  cloneMyWallet: "ssh-agent bash -c 'ssh-add ~/.ssh/github_rsa; git clone git@github.com:blockchain/My-Wallet-HD.git " + myWallet + "'",
  npmInstall: "ssh-agent bash -c 'ssh-add ~/.ssh/github_rsa; cd " + current + " && npm install'",
  startForever: 'forever start -c ' + current + '/node_modules/coffee-script/bin/coffee ' + current + '/server.coffee'
};

module.exports = function (shipit) {
	require('shipit-deploy')(shipit);

  shipit.initConfig({
  	default: {
      workspace: '/tmp/github-monitor',
      deployTo: '~/HD-Wallet',
      repositoryUrl: 'https://github.com/blockchain/My-Wallet-HD-Frontend.git',
      ignores: ['.git', 'node_modules'],
      keepReleases: 3,
      shallowClone: true,
      branch: 'shipit-staging',
      key: '~/.ssh/dev_rsa'
    },
    staging: {
      servers: 'justin@10.0.0.2'
    }
  });

  // Event listeners

  shipit.on('cleaned', function() {
    shipit.start('install-my-wallet');
  });

  // Tasks

  shipit.task('install-my-wallet', function () {
    shipit.remote('rm -rf ' + myWallet)
    .then(function() {
      return shipit.remote(commands.cloneMyWallet);
    })
    .then(function() {
      return shipit.remote('cd ' + myWallet + ' && npm install');
    })
    .then(function() {
      return shipit.remote('cd ' + myWallet + ' && grunt build');
    })
    .then(function() {
      shipit.start('install-frontend');
    });
  });

  shipit.task('install-frontend', function () {
    shipit.remote(commands.npmInstall)
    .then(function() {
      timers.setTimeout(function() {
        shipit.start('restore-server-info');
      }, 8000);
      return shipit.remote('cd ' + current + ' && grunt');
    });
  });

  shipit.task('restore-server-info', function() {
    shipit.remote('cp ' + serverInfo + '/betakeys.MDF ' + current + '/betakeys.MDF')
    .then(shipit.remote('cp ' + serverInfo + '/.env ' + current + '/.env'))
    .then(function() {
      shipit.start('restart');
    });
  });

  shipit.task('restart', function() {
      shipit.remote('forever stopall')
      .then(function() {
        return shipit.remote(commands.startForever);
      })
      .then(function() {
        shipit.log('DONE: Safe to exit');
      });
  });

};