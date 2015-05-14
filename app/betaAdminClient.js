var waiting = false;

var sortedElem = 'rowid';
var sort = 'rowid';
var order = 'A';

var editing;

var tableElem = $('<table></table>')
	.attr('id', 'key-table')
	.addClass('table table-hover table-condensed')
	.append($('<tr></tr>')
		.append($('<th>id </th>').attr('id', 'rowid').css({'cursor':'pointer'}))
		.append($('<th>Key </th>').attr('id', 'key').css({'cursor':'pointer'}))
		.append($('<th>Name </th>').attr('id', 'name').css({'cursor':'pointer'}))
		.append($('<th>Email </th>').attr('id', 'email').css({'cursor':'pointer'}))
		.append($('<th>Last Seen </th>').attr('id', 'lastseen').css({'cursor':'pointer'}))
		.append($('<th>Guid </th>').attr('id', 'guid').css({'cursor':'pointer'}))
		.append($('<th>Status </th>').attr('id', 'activated').css({'cursor':'pointer'}))
		.append($('<th>Edit </th>'))
		.append($('<th>Revoke </th>')));

var rowElem = $('<tr></tr>')
	.append($('<td></td>')
		.append($('<a>edit</a>').attr('onclick', 'showEditModal(this)').css('cursor', 'pointer').data('toggle', 'modal').data('target', '#key-modal')))
	.append($('<td></td>')
		.append($('<a>revoke</a>').attr('onclick', 'revokeKey(this)').css('cursor', 'pointer')));

function changeSort(col) {
	if (sort === col) changeOrder();
	else {
		sort = col;
		order = 'A';
	}
	getSortedKeys(sort, order);
}

function changeOrder() {
	if (order === 'A') order = 'Z';
	else if (order === 'Z') order = 'A';
	else order = 'A';
}

function search(event) {
	event.preventDefault();
	var search = $('#search-input').val();
	var searchCategory = $('#search-dropdown').val();
	var filter = {};
	filter[searchCategory] = search;
	if (search !== '') getSortedKeys(sort, order, filter);
	else getSortedKeys(sort, order, {});
}

function setIsWaiting(flag) { waiting = flag; }

function wait() {
	if (waiting) return true;
	else setIsWaiting(true);
	return false;
}

function getRootUrl() {
	return '/admin/api/';
}

function convertDate(dateObj) {
	return dateObj.getHours() + ':' + dateObj.getMinutes() + ',\t' + dateObj.getMonth() + '/' + dateObj.getDate() + '/' + dateObj.getFullYear();
}

function createRow(id, key, name, email, lastSeen, guid, status) {
	return rowElem.clone().data('id', id).data('key', key).data('email', email || '')
		.prepend($('<td></td>').html('<i>' + status + '</i>'))
		.prepend($('<td></td>').text(guid))
		.prepend($('<td></td>').text(lastSeen))
		.prepend($('<td></td>').text(email))
		.prepend($('<td></td>').text(name))
		.prepend($('<td></td>').text(key))
		.prepend($('<td></td>').text(id));
}

function isActivated (tf) {
	return (tf) ? 'Activated' : 'Pending';
}

function generateTable(tableData, callback) {
	var tableDiv = $('.table-div'),
		table = tableElem.clone();
	for (i in tableData) {
		var rowData = tableData[i];
		var lastSeen = 'Never';
		if (rowData.lastseen) lastSeen = new Date(rowData.lastseen);
		createRow(rowData.rowid, rowData.key, rowData.name, rowData.email, lastSeen, rowData.guid, isActivated(rowData.activated)).appendTo(table);
	}
	$('#key-table').detach().remove();
	tableDiv.append(table);
	setIsWaiting(false);
	if (callback) callback();
}

function successCallback(err) {
	if (err) console.log(err);
	setIsWaiting(false);
	getSortedKeys(sort, order);
}

function errorCallback(err) {
	console.log(err);
	setIsWaiting(false);
}

function callAjax(endpoint, data, success) {
	$.ajax({
		url: getRootUrl() + endpoint,
		data: data,
		success: success || successCallback,
		error: errorCallback
	});
}

function getAllKeys() {
	if (wait()) return;
	$.getJSON(getRootUrl() + 'get-all-keys', generateTable);
}

function getSortedKeys(sort, order, filter) {
	if (wait()) return;
	filter = filter || {};
	callAjax('get-sorted-keys', {sort:sort,order:order,filter:filter}, function(data) {
		generateTable(JSON.parse(data), insertSortIcon);
	});
}

function insertSortIcon() {
	if (sortedElem) {
		var selector = '#' + sortedElem;
		if (order === 'A') $('<span></span>').addClass('glyphicon glyphicon-menu-down').appendTo(selector);
		else $('<span></span>').addClass('glyphicon glyphicon-menu-up').appendTo(selector);
	}
}

function assignKey(event) {
	event.preventDefault();
	if (wait()) return;
	var name = $('#name-input').val(),
		email = $('#email-input').val(), 
		guid = $.trim($('#guid-input').val());
  
	if (!email || email == "") {
		alert("Email required");
		return;
	}
	 
	if (!name || name == "") {
		alert("Name required");
		return;
	}
	
	callAjax('assign-key', {name:name,email:email,guid: guid});
	$('#key-modal').modal('toggle');
	$('#key-form')[0].reset();
}

function revokeKey(elem) {
	if (wait()) return;
	var id = ($(elem).parent().parent().data('id'));
	callAjax('delete-key', {rowid:id});
}

function updateKey(event) {
	event.preventDefault();
	if (wait()) return;
	var key = $('#edit-key-input').val();
	var name = $('#edit-name-input').val();
	var email = $('#edit-email-input').val();
	var guid = $.trim($('#edit-guid-input').val());
	var update = {};
	if (name !== '') update.name = name;
	if (email !== '') update.email = email;
	if (guid !== '') update.guid = guid;
	update.activated = true;
	callAjax('update-key', {
		selection: {key:key},
		update: update
	});
	$('#edit-modal').modal('toggle');
}

function activateKey(event) {
	event.preventDefault();
	if (wait()) return;
	var email = $('#activate-email-input').val();
	var name = $('#activate-name-input').val();
	var update = {};
	if (email !== '') update.email = email;
	if (name !== '') update.name = name;
	update.activated = true;
	callAjax('activate-key', {
		selection: {rowid:editing.data('id')},
		update: update
	});
	$('#activate-modal').modal('toggle');
}

function showEditModal(elem) {
	editing = $(elem).parent().parent();
	$ ('#edit-form')[0].reset();
	$ ('#activate-form')[0].reset();
	if (editing.data('key')) $('#edit-modal').modal('show');
	else $('#activate-modal').modal('show');
}

function getRequestPercent() {
	$.getJSON('/percent_requested', function(data) {
		$('.progress-bar').css('width', data.width + '%').text(data.width + '%');
	});
}

function updateCapturePage(event) {
	event.preventDefault();
	var percent = $('#capture-percent-input').val();
	if (percent === '') return;
	$.get(getRootUrl() + 'set-percent-requested', {
		percent: percent
	}).done(getRequestPercent);
	$('#capture-modal').modal('toggle');
	$('#capture-percent-input').val('');
}

$(document).ready(function() {
	$('#search-form').on('submit', search);
	$('#key-form').on('submit', assignKey);
	$('#key-modal').on('shown.bs.modal', function () {
	  $('#name-input').focus();
	});
	$('#edit-form').on('submit', updateKey);
	$('#edit-modal').on('shown.bs.modal', function () {
	  $('#edit-name-input').focus();
	});
	$('#edit-modal').on('show.bs.modal', function (event) {
	  $(this).find('#edit-key-input').val(editing.data('key'));
	});
	$('#activate-form').on('submit', activateKey);
	$('#activate-modal').on('shown.bs.modal', function () {
	  $('#activate-name-input').focus();
	});
	$('#activate-modal').on('show.bs.modal', function (event) {
	  $(this).find('#activate-email-input').val(editing.data('email'));
	});
	$('#capture-form').on('submit', updateCapturePage);
	$('#capture-modal').on('shown.bs.modal', function () {
	  $('#capture-percent-input').focus();
	});
	getSortedKeys(sort, order);
	getRequestPercent();
});

$(document).on('click', 'th', function() {
	sortedElem = $(this).attr('id');
	if (sortedElem !== undefined) changeSort(sortedElem);
});