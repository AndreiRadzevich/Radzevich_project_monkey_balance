//main start
function ready() {
	var buttOne = document.getElementById('level_1');
	var buttTwo = document.getElementById('level_2');
	var buttThr = document.getElementById('level_3');
	var leftField = document.getElementById('field__left');
	var rightField = document.getElementById('field__right');
	var numContainer = document.getElementById('container-number');
	var banContainer = document.getElementById('container-banana');
	var stick = document.getElementById('stick');
	var stepBanContain = 0;
	var stepNumContain = 0;
	var control = 0;
	buttOne.addEventListener('click', fillField, false);
	buttTwo.addEventListener('click', fillField, false);
	buttThr.addEventListener('click', fillField, false);

	function fillField(EO) {
		EO = EO || window.event;
		var level = parseInt(EO.target.id.substr(-1, 1));

		$.ajax({
			url: ajaxHandlerScript,
			type: 'POST',
			cache: false,
			dataType: 'json',
			data: {
				f: 'READ',
				n: stringName
			},
			success: loadSVG,
			error: errorHandler,
		});

		function loadSVG(data) {
			if (data.error != undefined)
				alert(data.error);
			else if (data.result != "") {
				var arrSVG = JSON.parse(data.result);
			}
			var leftFieldElem = '';
			var rightFieldElem = '';
			for (var i = 1; i <= level * 3; i++) {
				leftFieldElem += arrSVG[i];
				rightFieldElem += arrSVG[0];
			}
			leftField.innerHTML = leftFieldElem;
			rightField.innerHTML = rightFieldElem;
			banContainer.innerHTML = "";
			numContainer.innerHTML = "";
			for (var j = 0; j < 9; j++) {
				if (j < 2) {
					getBox(numContainer);
				}
				getBox(banContainer);
			}

			function getStyleLeft(dragObject, index) {
				dragObject.style.bottom = index;
				if (j == 0 || j == 3 || j == 6) dragObject.style.left = "1vw";
				if (j == 1 || j == 4 || j == 7) dragObject.style.left = "6.5vw";
				if (j == 2 || j == 5 || j == 8) dragObject.style.left = "12vw";
			}

			function getBox(contain) {
				var box = document.createElement('div');
				box.className = 'box';
				box.style.position = 'absolute';
				if (j < 3) {
					getStyleLeft(box, "6vw");
				} else if (3 <= j && j < 6) {
					getStyleLeft(box, "11.5vw");
				} else if (6 <= j && j < 9) {
					getStyleLeft(box, "17vw");
				};
				contain.insertBefore(box, contain.firstChild);
			}
			stepBanContain = 0;
			stepNumContain = 0;
			control = 0;
			numContainer.style.transform = 'translateY(0vw) translateZ(0)';
			banContainer.style.transform = 'translateY(0vw) translateZ(0)';
			stick.style.transform = 'rotate(0deg) translateZ(0)';
		}

		banContainer.addEventListener('mousedown', bananaOutStart, false);
		banContainer.addEventListener('touchstart', bananaOutStart, false);
		numContainer.addEventListener('mousedown', numberOutStart, false);
		numContainer.addEventListener('touchstart', numberOutStart, false);
		rightField.addEventListener('mousedown', bananaStart, false);
		rightField.addEventListener('touchstart', bananaStart, false);
		leftField.addEventListener('mousedown', numberStart, false);
		leftField.addEventListener('touchstart', numberStart, false);
	} //end of loadSVG

	function numberStart(e) { //drag number
		var dragObject = e.target.closest('svg') || e.targetTouches[0].target.closest('svg');
		dragObject.style.cssText += 'position:relative;top: 0; left: 0; z-index:999; width: 5.5vw;height:5.5vw;';
		var dragObjectId = parseInt(dragObject.getAttribute('id').slice(-1));
		var posX = e.pageX; //start posX
		var posY = e.pageY;
		e.preventDefault();
		window.addEventListener('mousemove', numberMove, false);
		window.addEventListener('touchmove', numberMove, false);

		function numberMove(e) {
			e.preventDefault();
			var dx = e.pageX - posX;
			var dy = e.pageY - posY;
			dragObject.style.left = dx + "px";
			dragObject.style.top = dy + "px";
		}
		window.addEventListener('mouseup', numberEnd, false);
		window.addEventListener('touchend', numberEnd, false);
		function numberEnd(e) {
			var elemPosCont = getElementPos(numContainer);
			var banWidthX = elemPosCont.left + numContainer.offsetWidth;
			var banHeightY = elemPosCont.top + numContainer.offsetHeight;
			var container = numContainer.getElementsByTagName('div');
			var point = 0;
			e = e || e.changedTouches[0];
			e.preventDefault();
			window.removeEventListener('mousemove', numberMove, false);
			window.removeEventListener('touchmove', numberMove, false);
			if (dragObject) {
				var posEndX = e.clientX || e.changedTouches[0].clientX;
				var posEndY = e.clientY || e.changedTouches[0].clientY;
				if (posEndY > elemPosCont.top && posEndY < banHeightY && posEndX > elemPosCont.left && posEndX < banWidthX) {
					dragObject.style.position = "static";
					Array.prototype.forEach.call(container, function (testElement) {
						if (!testElement.hasChildNodes()) {
							point++;
							if (point == 1) control += dragObjectId;
							if (control > 9) {
								dragObject.style.left = '';
								dragObject.style.top = '';
								control -= dragObjectId;
							} else {
								testElement.appendChild(dragObject);
								numContainer.style.transform = `translateY(${(stepNumContain + dragObjectId)}vw) translateZ(0)`;
								banContainer.style.transform = `translateY(${(stepBanContain - dragObjectId)}vw) translateZ(0)`;
								stick.style.transform = `rotate(${(-(stepNumContain + dragObjectId)) * 2}deg) translateZ(0)`
							}
						}
					});
					stepNumContain = parseInt(getTranslateY(numContainer));
					stepBanContain = parseInt(getTranslateY(banContainer));
				} else {
					dragObject.style.left = '';
					dragObject.style.top = '';
				}
				dragObject = null;
			}
			window.removeEventListener('mouseup', numberEnd, false);
			window.removeEventListener('touchend', numberEnd, false);
		}
	}

	function numberOutStart(e) { //drag out number
		var dragObject = e.target.closest('svg') || e.targetTouches[0].target.closest('svg');
		var dragObjectId = parseInt(dragObject.getAttribute('id').slice(-1));
		dragObject.style.cssText += 'position:relative; top: 0; left: 0;  z-index:99;';
		var posX = e.pageX; //start posX
		var posY = e.pageY;
		e.preventDefault();
		window.addEventListener('mousemove', moveOut, false);
		window.addEventListener('touchmove', moveOut, false);
		window.addEventListener('mouseup', numberOutEnd, false);
		window.addEventListener('touchend', numberOutEnd, false);
		function numberOutEnd(e) {
			var elemPosCont = getElementPos(leftField);
			var numWidthX = elemPosCont.left + leftField.offsetWidth;
			var numHeightY = elemPosCont.top + leftField.offsetHeight;
			e = e || e.changedTouches[0];
			e.preventDefault();
			window.removeEventListener('mousemove', moveOut, false);
			window.removeEventListener('touchmove', moveOut, false);
			if (dragObject) {
				var posEndX = e.clientX || e.changedTouches[0].clientX;
				var posEndY = e.clientY || e.changedTouches[0].clientY;
				if (posEndY > elemPosCont.top && posEndY < numHeightY && posEndX > elemPosCont.left && posEndX < numWidthX) {
					var container = document.getElementsByClassName('number');
					control -= dragObjectId;
					console.log(control);
					Array.prototype.forEach.call(container, function (testElement) {
						var conteinerClass = parseInt(testElement.getAttribute('class').slice(-1));
						if (conteinerClass == dragObjectId) {
							dragObject.style.position = "static";
							testElement.appendChild(dragObject);
						}
					});
					numContainer.style.transform = `translateY(${(stepNumContain - dragObjectId)}vw) translateZ(0)`;
					banContainer.style.transform = `translateY(${(stepBanContain + dragObjectId)}vw) translateZ(0)`;
					stick.style.transform = `rotate(${(-(stepNumContain - dragObjectId)) * 2}deg) translateZ(0)`;
					stepNumContain = parseInt(getTranslateY(numContainer));
					stepBanContain = parseInt(getTranslateY(banContainer));
				} else {
					dragObject.style.left = '';
					dragObject.style.top = '';
				}
				dragObject = null;
			}
			window.removeEventListener('mouseup', numberOutEnd, false);
			window.removeEventListener('touchend', numberOutEnd, false);
		}
	}

	function bananaStart(e) { //drag banana
		var dragObject = e.target.closest('svg') || e.targetTouches[0].target.closest('svg');
		dragObject.style.cssText += 'position:relative; top: 0; left: 0; z-index:99;';
		var posX = e.pageX; //start posX
		var posY = e.pageY;
		e.preventDefault();
		window.addEventListener('mousemove', bananaMove, false);
		window.addEventListener('touchmove', bananaMove, false);
		function bananaMove(e) {
			e.preventDefault();
			var dx = e.pageX - posX;
			var dy = e.pageY - posY;
			dragObject.style.left = dx + "px";
			dragObject.style.top = dy + "px";
		}
		window.addEventListener('mouseup', bananaEnd, false);
		window.addEventListener('touchend', bananaEnd, false);
		function bananaEnd(e) {
			var elemPosCont = getElementPos(banContainer);
			var banWidthX = elemPosCont.left + banContainer.offsetWidth;
			var banHeightY = elemPosCont.top + banContainer.offsetHeight;
			var container = banContainer.getElementsByTagName('div');
			e = e || e.changedTouches[0];
			e.preventDefault();
			window.removeEventListener('mousemove', bananaMove, false);
			window.removeEventListener('touchmove', bananaMove, false);
			if (dragObject) {
				var posEndX = e.clientX || e.changedTouches[0].clientX;
				var posEndY = e.clientY || e.changedTouches[0].clientY;
				if (posEndY > elemPosCont.top && posEndY < banHeightY && posEndX > elemPosCont.left && posEndX < banWidthX) {
					Array.from(container, function (testElement) {
						if (!testElement.hasChildNodes()) {
							dragObject.style.position = "static";
							testElement.appendChild(dragObject);
						}
					});

					numContainer.style.transform = `translateY(${(stepNumContain - 1)}vw) translateZ(0)`;
					banContainer.style.transform = `translateY(${(stepBanContain + 1)}vw) translateZ(0)`;
					stick.style.transform = `rotate(${((stepBanContain + 1)) * 2}deg) translateZ(0)`;
					stepNumContain = parseInt(getTranslateY(numContainer));
					stepBanContain = parseInt(getTranslateY(banContainer));
				} else {
					dragObject.style.left = '';
					dragObject.style.top = '';
				}
				dragObject = null;
			}
			window.removeEventListener('mouseup', bananaEnd, false);
			window.removeEventListener('touchend', bananaEnd, false);
		}
	}

	function bananaOutStart(e) { //drag out banana
		var dragObject = e.target.closest('svg') || e.targetTouches[0].target.closest('svg');
		dragObject.style.cssText += 'position:relative;top: 0; left: 0;  z-index:99;';
		var posX = e.pageX; //start posX
		var posY = e.pageY;
		e.preventDefault();
		window.addEventListener('mousemove', moveOut, false);
		window.addEventListener('touchmove', moveOut, false);
		window.addEventListener('mouseup', bananaOutEnd, false);
		window.addEventListener('touchend', bananaOutEnd, false);
		function bananaOutEnd(e) {
			var elemPosCont = getElementPos(rightField);
			var banWidthX = elemPosCont.left + rightField.offsetWidth;
			var banHeightY = elemPosCont.top + rightField.offsetHeight;
			var container = document.getElementsByClassName('banana');
			e = e || e.changedTouches[0];
			e.preventDefault();
			window.removeEventListener('mousemove', moveOut, false);
			window.removeEventListener('touchmove', moveOut, false);
			if (dragObject) {
				var posEndX = e.clientX || e.changedTouches[0].clientX;
				var posEndY = e.clientY || e.changedTouches[0].clientY;
				if (posEndY > elemPosCont.top && posEndY < banHeightY && posEndX > elemPosCont.left && posEndX < banWidthX) {
					Array.from(container, function (testElement) {
						if (!testElement.hasChildNodes()) {
							dragObject.style.position = "static";
							testElement.appendChild(dragObject);
						}
					});
					numContainer.style.transform = `translateY(${(stepNumContain + 1)}vw) translateZ(0)`;
					banContainer.style.transform = `translateY(${(stepBanContain - 1)}vw) translateZ(0)`;
					stick.style.transform = `rotate(${((stepBanContain - 1)) * 2}deg) translateZ(0)`;
					stepNumContain = parseInt(getTranslateY(numContainer));
					stepBanContain = parseInt(getTranslateY(banContainer));
				} else {
					dragObject.style.left = '';
					dragObject.style.top = '';
				}
				dragObject = null;
			}
			window.removeEventListener('mouseup', bananaOutEnd, false);
			window.removeEventListener('touchend', bananaOutEnd, false);
		}
	}
//common functions
	function getElementPos(elem) {
		var x = 0;
		var y = 0;
		while (elem) {
			x += elem.offsetLeft;
			y += elem.offsetTop;
			elem = elem.offsetParent;
		}
		return {
			left: x,
			top: y
		}
	}

	function getTranslateY(obj) {
		var style = obj.style,
			transform = style.transform || style.webkitTransform || style.mozTransform;
		if (transform.indexOf("-") !== -1) {
			transform = transform.replace('-', '');
			var zT = transform.match(/translateY\(([0-9]+(px|em|%|ex|ch|rem|vh|vw|vmin|vmax|mm|cm|in|pt|pc))\)/);
			zT[1] = "-" + zT[1];
			return zT[1];
		};
		var zT = transform.match(/translateY\(([0-9]+(px|em|%|ex|ch|rem|vh|vw|vmin|vmax|mm|cm|in|pt|pc))\)/);
		if (!zT) {
			return '0';
		}
		return zT[1] ? zT[1] : '0';
		//Return the value AS STRING (with the unit)
	}
	function moveOut(e) {
		e.preventDefault();
		var dx = e.pageX - posX;
		var dy = e.pageY - posY;
		dragObject.style.left = dx + "px";
		dragObject.style.top = dy + "px";
	}
}