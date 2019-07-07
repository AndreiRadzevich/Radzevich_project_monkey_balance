var ajaxHandlerScript = "http://fe.it-academy.by/AjaxStringStorage2.php";
var updatePassword;
var stringName = 'RADZEVICH_PROJECT1';
//AJAX
// restoreInfo();

function restoreInfo() {
	$.ajax(
		{
			url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
			data: { f: 'READ', n: stringName },
			success: readReady, error: errorHandler,
		}
	);
}

function readReady(callresult) {
	if (callresult.error != undefined)
		alert(callresult.error);
	else if (callresult.result != "") {
		words = JSON.parse(callresult.result);
	}
}

function updateAJAX(data) {
	$.ajax({
		url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
		data: { f: 'UPDATE', n: stringName, v: JSON.stringify(data), p: updatePassword },
		success: updateReady, error: errorHandler
	}
	);
}

function storeInfo() {
	updatePassword = Math.random();
	$.ajax({
		url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
		data: { f: 'LOCKGET', n: stringName, p: updatePassword },
		success: updateReady, error: errorHandler
	}
	);
}

function updateReady(callresult) {
	if (callresult.error != undefined)
		alert(callresult.error);
}

function errorHandler(jqXHR, statusStr, errorStr) {
	alert(statusStr + ' ' + errorStr);
}

// storeInfo();
// updateAJAX(myJSON);

//добавление своей новой строки
function insertAjaxRadzevich() {
	$.ajax({
		url: ajaxHandlerScript,
		type: 'POST',
		data: {
			f: 'INSERT',
			n: stringName,
			v: "{}"
		},
		success: UpdateReady,
		error: ErrorHandler
	});
};
var ErrorHandler = function (jqXHR, StatusStr, ErrorStr) {
	alert(StatusStr + ' ' + ErrorStr);
}
var UpdateReady = function (ResultH) {
	if (ResultH.error != undefined)
		alert(ResultH.error);
}
// insertAjaxRadzevich();