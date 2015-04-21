var waiting = false;

var tableElem = $('<table></table>')
	.attr('id', 'key-table')
	.addClass('table table-hover table-condensed')
	.append($('<tr></tr>').html('<th>id</th><th>Key</th><th>Name</th><th>Email</th><th>Last Seen</th><th>Revoke</th>'));

var rowElem = $('<tr></tr>')
	.append($('<td></td>')
		.append($('<a>revoke</a>').attr('onclick', 'revokeKey(this)').css('cursor', 'pointer')));

function setIsWaiting(flag) { waiting = flag; }

function wait() {
	if (waiting) return true;
	else setIsWaiting(true);
	return false;
}

function getRootUrl() {
	return '/betaadmin/';
}

function convertDate(dateObj) {
	return dateObj.getHours() + ':' + dateObj.getMinutes() + ',\t' + dateObj.getMonth() + '/' + dateObj.getDate() + '/' + dateObj.getFullYear();
}

function createRow(id, key, name, email, lastSeen) {
	return rowElem.clone().data('id', id)
		.prepend($('<td></td>').text(lastSeen))
		.prepend($('<td></td>').text(email))
		.prepend($('<td></td>').text(name))
		.prepend($('<td></td>').text(key))
		.prepend($('<td></td>').text(id));
}

function generateTable(tableData) {
	var tableDiv = $('.table-div'),
		table = tableElem.clone();
	for (i in tableData) {
		var rowData = tableData[i];
		var lastSeen = 'Never';
		if (rowData.lastseen) lastSeen = new Date(rowData.lastseen);
		createRow(rowData.id, rowData.key, rowData.name, rowData.email, lastSeen).appendTo(table);
	}
	$('#key-table').detach().remove();
	tableDiv.append(table);
	setIsWaiting(false);
}

function successCallback(err) {
	if (err) console.log(err);
	setIsWaiting(false);
	getAllKeys();
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

function getSortedKeys(sort) {
	if (wait()) return;
	callAjax('get-sorted-keys', {sort:sort}, function(data) {
		generateTable(JSON.parse(data));
	});
}

function assignKey() {
	if (wait()) return;
	var name = $('#name-input').val(),
		email = $('#email-input').val();
	callAjax('assign-key', {name:name,email:email});
}

function revokeKey(elem) {
	if (wait()) return;
	var id = ($(elem).parent().parent().data('id'));
	callAjax('delete-key', {id:id});
}

$(document).ready(function() {
	$('#key-form').on('submit', assignKey);
	$('.sort').on('click', function() {
		var sort = $(this).data('sort');
		getSortedKeys(sort);
	});
	getAllKeys();
});