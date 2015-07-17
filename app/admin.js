var admin = angular.module('AdminInterface', ['ui.bootstrap']);

// Main Controller
admin.controller('AdminCtrl', function ($rootScope, $scope, $http, $modal, InterfaceHelper) {

  $rootScope.percentRequested = 0;

  // Declare scope variables
  $scope.tableData = [];
  $scope.headers = ['rowid', 'key', 'name', 'email', 'lastseen', 'guid', 'status'];
  $scope.filters = ['name', 'email', 'key', 'guid'];
  $scope.search = { text: '', filter: '', sort: 'rowid', order: 'A' };

  // Convert timestamp to readable
  $scope.getDateFromTime = function (time) {
    return (time) ? new Date(time).toDateString() : 'Never';
  };

  $scope.sort = function (header) {
    if ($scope.search.sort === header) {
      $scope.search.order = ($scope.search.order === 'A') ? 'Z' : 'A';
    } else {
      $scope.search.sort = header;
      $scope.search.order = 'A';
    }
    $scope.load();
  };

  // API functions

  $scope.revokeKey = function (id) {
    InterfaceHelper.callApi('/delete-key', { rowid: id })
      .success($scope.load);
  };

  $scope.getPercent = function () {
    $http.get('/percent_requested')
      .success(function(res){ $rootScope.percentRequested = res.width; })
      .error(InterfaceHelper.error);
  };

  $scope.setPercent = function (value) {
    InterfaceHelper.callApi('/set-percent-requested', {percent:value})
      .success($scope.getPercent);
  };

  $scope.getNumWalletsCreated = function () {
    InterfaceHelper.callApi('/wallets-created')
      .success(function (data) {
        $scope.walletCount = data.count
      });
  };

  $scope.retrieveCSV = function () {
    location.assign(InterfaceHelper.getRootUrl() + '/get-csv');
  };

  $scope.load = function () {
    var filter = {};
    filter[$scope.search.filter] = $scope.search.text;
    InterfaceHelper.callApi('/get-sorted-keys', {
      sort: $scope.search.sort,
      order: $scope.search.order,
      filter: filter
    }).success(function (response) {
      $scope.tableData = response.data;
    });
  };

  // Modal opening
  $scope.openModal = function (tmpl, ctrl, entry) {
    $modal.open({
      templateUrl: tmpl,
      controller: ctrl,
      resolve: {
        getPercent: function () { return $scope.getPercent; },
        setPercent: function () { return $scope.setPercent; },
        load: function () { return $scope.load; },
        entry: function () { return entry; }
      }
    });
  };

  // Initial data load
  $scope.load();
  $scope.getNumWalletsCreated();
});

// Modal Controllers
admin.controller('AssignKeyCtrl', function ($scope, $modalInstance, InterfaceHelper, load) {
  $scope.fields = { name: '', email: '', guid: '' };
  $scope.assignKey = function (name, email, guid) {
    if (guid === '') guid = null;
    InterfaceHelper.callApi('/assign-key', {name:name,email:email,guid:guid})
      .success(load);
    $modalInstance.dismiss();
  };
});

admin.controller('CapturePageCtrl', function ($scope, getPercent, setPercent) {
  $scope.setPercent = setPercent;
  getPercent();
});

admin.controller('EditKeyCtrl', function ($scope, $modalInstance, InterfaceHelper, load, entry) {
  $scope.fields = angular.copy(entry);
  $scope.endpoint = ($scope.fields.activated) ? '/update-key' : '/activate-key';
  $scope.submitEdit = function () {
    var selection = { rowid: entry.rowid };
    var update = InterfaceHelper.compareProperties($scope.fields, entry);
    update.activated = true;
    InterfaceHelper.callApi($scope.endpoint, {selection: selection, update: update})
      .success(function () {
        load();
        $modalInstance.dismiss();
      });
  };
});

admin.controller('ActivateKeysCtrl', function ($scope, InterfaceHelper, load) {
  $scope.step = 0;
  $scope.numKeys = 0;
  $scope.numEmails = 0;
  $scope.errors = [];
  $scope.activate = function (min, max) {
    InterfaceHelper.callApi('/activate-all', {min:min||null,max:max||null})
      .success(function (res) {
        load();
        if (typeof res.error === 'object') {
          $scope.errors = res.error;
        }
        if (typeof res.data === 'object') {
          $scope.numKeys = res.data.count;
          $scope.numEmails = res.data.successful;
        }
        $scope.step = 2;
      });
    $scope.step = 1;
  };
});

// Helper Service
admin.factory('InterfaceHelper', function ($http, $httpParamSerializerJQLike) {
  var helper = {};
  var rootUrl = '/admin/api';
  helper.error = function (response) {
    if (!response || !response.error) return;
    console.error(response.error)
  };
  helper.callApi = function (endpoint, data) {
    return $http.get(rootUrl + endpoint, {
      params: data,
      paramSerializer: $httpParamSerializerJQLike
    }).error(helper.error);
  };
  helper.getRootUrl = function () {
    return rootUrl;
  };
  helper.compareProperties = function (o1, o2) {
    var object = {};
    for (p in o1) {
      if (o1[p] !== o2[p]) object[p] = o1[p];
    }
    return object;
  };
  return helper;
});
