import Template from './activity-feed.pug';

class Controller {

  constructor ($scope, $injector, $stateParams) {
    this.title = 'Activity Feed';
    this.scenarioLinks =
    [
      { title: 'Scenario 1', description: 'This should display one activity.', href: 'activity-feed({scenarioId:1})' },
      { title: 'Scenario 2', description: 'This should display two activities.', href: 'activity-feed({scenarioId:2})' },
      { title: 'Scenario 3', description: 'This should display a bitcoin activity.', href: 'activity-feed({scenarioId:3})' }
    ];

    let activity1 = {
      icon: 'ti-settings',
      title: 'LOG',
      time: 1495622716370,
      labelClass: 'get account settings',
      message: 'Get account settings',
      type: 4
    };

    let activity2 = {
      icon: 'ti-settings',
      title: 'LOG',
      time: 1495466201270,
      labelClass: 'viewed login page',
      message: 'Viewed login page',
      type: 4
    };

    let activity3 = {
      icon: 'icon-tx',
      title: 'TRANSACTION',
      time: 1493900060888,
      labelClass: 'viewed login page',
      message: 'Viewed login page',
      type: 0,
      amount: 1
    };

    let MockedActivity = $injector.get('Activity');

    switch ($stateParams.scenarioId) {
      case '1':
        {
          MockedActivity.activities = [activity1];
        }
        break;
      case '2':
        {
          MockedActivity.activities = [activity1, activity2];
        }
        break;
      case '3':
        {
          MockedActivity.activities = [activity3];
        }
        break;
    }
  }
}

export default {
  controller: Controller,
  template: Template
};
