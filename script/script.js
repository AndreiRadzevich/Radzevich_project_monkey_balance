"use strict"

function ready() {
	const leftField = document.getElementById('field__left'); //левое игровое поле с цифрами
	const rightField = document.getElementById('field__right'); //правое игровое поле с бананами
	const numContainer = document.getElementById('container-number'); //левая чаша весов для цифр
	const banContainer = document.getElementById('container-banana'); //правая чаша весов для бананов
	const stick = document.getElementById('stick'); //перекладина весов
	const balance = document.getElementById('back'); // весы
	let control = 0; // для контроля всех добавлений и удалений элементов на весах
	/** Выбор уровня */
	document.getElementById('level_1').addEventListener('click', fillField, false);
	document.getElementById('level_2').addEventListener('click', fillField, false);
	document.getElementById('level_3').addEventListener('click', fillField, false);
	/**
	 * Определяет нажатую кнопку; делает запрос к серверу.
	 * @param e Cобытие 'click', используется для идентификации кнопки.
	 */
	function fillField(e) {
		e = e || window.event;
		let level = parseInt(e.target.id.substr(-1, 1));

		$.ajax({
			url: ajaxHandlerScript,
			type: 'POST',
			cache: false,
			dataType: 'json',
			data: {
				f: 'READ',
				n: stringName
			},
			success: loadSvg,
			error: errorHandler,
		});
		/**
		 * Обрабатывает данные (svg-элементы) с сервера и заполняет поля цифр и бананов
		 * в зависимости от нажатой кнопки (выбранного уровня)
		 * @param response {JSON} данные загруженные с сервера; response.result - массив с svg-элементами
		 */
		function loadSvg(response) {
			/** Содержимое игровых полей */
			var leftFieldElem = '';
			var rightFieldElem = '';
			/** Обнуление состояния чаш и перекладины весов, глаз обезьяны*/
			control = 0;
			numContainer.style.transform = 'translateY(0vw) translateZ(0)';
			banContainer.style.transform = 'translateY(0vw) translateZ(0)';
			stick.style.transform = 'rotate(0deg) translateZ(0)';
			balance.style.background = "url(images/monkey_close.png) center no-repeat";
			balance.style.backgroundSize = "contain";

			if (response.error != undefined) {
				alert(response.error);
			} else if (response.result != "") {
				var arrSvg = JSON.parse(response.result);
			}

			for (let i = 1; i <= level * 3; i++) {
				leftFieldElem += arrSvg[i];
				rightFieldElem += arrSvg[0];
			}

			leftField.innerHTML = leftFieldElem;
			rightField.innerHTML = rightFieldElem;
			banContainer.innerHTML = "";
			numContainer.innerHTML = "";

			for (let j = 0; j < 9; j++) {
				if (j < 2) {
					getBox(j, numContainer);
				}
				getBox(j, banContainer);
			}
		}
	}

	var number = new DragObject(numContainer, banContainer, leftField, balance);
	var banana = new DragObject(banContainer, numContainer, rightField, balance);

	banContainer.addEventListener('mousedown', banana.dragOut, false);
	banContainer.addEventListener('touchstart', banana.dragOut, false);
	numContainer.addEventListener('mousedown', number.dragOut, false);
	numContainer.addEventListener('touchstart', number.dragOut, false);
	rightField.addEventListener('mousedown', banana.dragIn, false);
	rightField.addEventListener('touchstart', banana.dragIn, false);
	leftField.addEventListener('mousedown', number.dragIn, false);
	leftField.addEventListener('touchstart', number.dragIn, false);
	/**
	 * Создает экземпляр DragObject.
	 *
	 * @param {object} boxBalance1 - Контейнер(чаша весов), куда перетаскиваются элементы.
	 * @param {object} boxBalance2 - Вторая чаша весов.
	 * @param {object} boxField - Поле, откуда перетаскиваются элементы.
	 * @param {object} balance - Тело весов, для закрытия открытия глаз.
	 */
	function DragObject(boxBalance1, boxBalance2, boxField, balance) {
		let self = this;
		self.boxBalance1 = boxBalance1;
		self.boxBalance2 = boxBalance2;
		self.boxField = boxField;
		/** для идентификации (цифра или банан) */
		self.ind = boxBalance1.id.slice(-6);
		self.balance = balance;
		let posX;
		let posY;
		/** перетаскиваемый объект */
		let dragObject;
		let dragObjectId;
		/**
		 * Выполняется при нажатии на перетаскиваемый в чашу весов элемент
		 *
		 */
		self.dragIn = function (e) {
			e = e || e.changedTouches[0] || window.event;
			dragObject = e.target.closest('svg');
			e.preventDefault();

			if (dragObject) {
				dragObject.style.cssText += 'position:relative; top:0; left:0; z-index:99;';
				posX = e.pageX;
				posY = e.pageY;

				window.addEventListener('mousemove', self.move, false);
				window.addEventListener('touchmove', self.move, false);
			}

			window.addEventListener('mouseup', self.dropIn, false);
			window.addEventListener('touchend', self.dropIn, false);
		};
		/**
		 * Выполняется при перетаскивании нажатого элемента
		 *
		 */
		self.move = function (e) {
			e.preventDefault();
			let dx = e.pageX - posX;
			let dy = e.pageY - posY;

			dragObject.style.left = dx + "px";
			dragObject.style.top = dy + "px";
		};
		/**
		 * Выполняется при отпускании перетаскиваемого элемента на весы
		 *
		 */
		self.dropIn = function (e) {
			e = e || e.changedTouches[0] || window.event;
			e.preventDefault();
			/** объект с координатами left, top контейнера, куда надо тащить элемент*/
			const elemPosCont = getElementPos(self.boxBalance1);
			const banWidthX = elemPosCont.left + self.boxBalance1.offsetWidth;
			const banHeightY = elemPosCont.top + self.boxBalance1.offsetHeight;
			/** набор контейнеров для вставки перетаскиваемого элемента */
			const container = self.boxBalance1.getElementsByTagName('div');

			window.removeEventListener('mousemove', self.move, false);
			window.removeEventListener('touchmove', self.move, false);

			if (dragObject) {
				let posEndX = e.clientX || e.changedTouches[0].clientX;
				let posEndY = e.clientY || e.changedTouches[0].clientY;

				dragObject.style.position = "static";
				/** если объект затащили в границы соответствующего контейнера проверяются условия  */
				/**  его вставки или он возвращается в первоначальное положение  */
				if (posEndY > elemPosCont.top && posEndY < banHeightY && posEndX >
					elemPosCont.left && posEndX < banWidthX) {
					/**  если тащится банан  */
					if (self.ind === 'banana') {
						Array.from(container, function (testElement, i) {
							if (i === 0) control--;

							if (!testElement.hasChildNodes()) {
								testElement.appendChild(dragObject);
							}
						});
						/**  условие опускания чаш и поворота перекладины весов  */
						if (self.ind === 'banana') {
							self.setTransform(self.boxBalance2, self.boxBalance1);
						} else {
							self.setTransform(self.boxBalance1, self.boxBalance2);
						}
						/**  условие открывания глаз обезьяны */
						self.toggleFace();
						/**  если тащится цифра  */
					} else {
						dragObjectId = parseInt(dragObject.getAttribute('id').slice(-1));

						for (let i = 0; i < container.length; i++) {

							if (!container[i].hasChildNodes()) {
								control += dragObjectId;
								dragObject.style.position = "static";
								container[i].appendChild(dragObject);
								/**  условие опускания чаш и поворота перекладины весов  */
								if (self.ind === 'banana') {
									self.setTransform(self.boxBalance2, self.boxBalance1);
								} else {
									self.setTransform(self.boxBalance1, self.boxBalance2);
								}
								/**  условие открывания глаз обезьяны */
								self.toggleFace();
								break;
							}
						}
					}
					/**  если элемент нельзя добавить */
				} else {
					dragObject.style.left = '';
					dragObject.style.top = '';
				}
				dragObject = null;
			}

			window.removeEventListener('mouseup', self.dropIn, false);
			window.removeEventListener('touchend', self.dropIn, false);
		};
		/**
		 * Выполняется при нажатии на перетаскиваемый из чаши весов элемент
		 *
		 */
		self.dragOut = function (e) {
			e = e || e.changedTouches[0] || window.event;
			e.preventDefault();
			dragObject = e.target.closest('svg');

			if (dragObject) {
				dragObject.style.cssText += 'position:relative; top:0; left:0; z-index:99;';
				posX = e.pageX;
				posY = e.pageY;

				window.addEventListener('mousemove', self.move, false);
				window.addEventListener('touchmove', self.move, false);
				window.addEventListener('mouseup', self.dropOut, false);
				window.addEventListener('touchend', self.dropOut, false);
			}
		};
		/**
		 * Выполняется при отпускании перетаскиваемого элемента вне весов
		 *
		 */
		self.dropOut = function (e) {
			e = e || e.changedTouches[0] || window.event;
			e.preventDefault();
			/** объект с координатами left, top контейнера, куда надо тащить элемент*/
			const elemPosCont = getElementPos(self.boxField);
			const numWidthX = elemPosCont.left + self.boxField.offsetWidth;
			const numHeightY = elemPosCont.top + self.boxField.offsetHeight;

			window.removeEventListener('mousemove', self.move, false);
			window.removeEventListener('touchmove', self.move, false);

			if (dragObject) {
				let posEndX = e.clientX || e.changedTouches[0].clientX;
				let posEndY = e.clientY || e.changedTouches[0].clientY;
				const container = document.getElementsByClassName(self.ind);
				/** если объект затащили в границы соответствующего контейнера проверяются условия  */
				/**  его вставки или он возвращается в первоначальное положение  */
				if (posEndY > elemPosCont.top && posEndY < numHeightY && posEndX >
					elemPosCont.left && posEndX < numWidthX) {
					/**  если тащится банан  */
					if (self.ind === 'banana') {
						Array.from(container, function (testElement, i) {

							if (i === 0) control++;
							if (!testElement.hasChildNodes()) {
								dragObject.style.position = "static";
								testElement.appendChild(dragObject);
							}
						});
						/**  условие опускания чаш и поворота перекладины весов  */
						if (self.ind === 'banana') {
							self.setTransform(self.boxBalance2, self.boxBalance1);
						} else {
							self.setTransform(self.boxBalance1, self.boxBalance2);
						}
						/**  условие открывания глаз обезьяны */
						if ([].some.call(container, (el => !el.hasChildNodes()))) {
							self.toggleFace();
						} else if (control != 0) {
							self.toggleFace();
						}
						/**  если тащится цифра  */
					} else {
						dragObjectId = parseInt(dragObject.getAttribute('id').slice(-1));
						Array.from(container, function (testElement) {
							const containerClass = parseInt(testElement.getAttribute('class').slice(-1));

							if (containerClass === dragObjectId) {
								dragObject.style.position = "static";
								testElement.appendChild(dragObject);
								control -= dragObjectId;
							}
						});
						/**  условие опускания чаш и поворота перекладины весов  */
						if (self.ind === 'banana') {
							self.setTransform(self.boxBalance2, self.boxBalance1);
						} else {
							self.setTransform(self.boxBalance1, self.boxBalance2);
						}
						/**  условие открывания глаз обезьяны */
						if ([].some.call(container, (el => !el.hasChildNodes()))) {
							self.toggleFace();
						} else if (control !== 0) {
							self.toggleFace();
						}
					}
					/**  если элемент нельзя добавить */
				} else {
					dragObject.style.left = '';
					dragObject.style.top = '';
				}
				dragObject = null;
			}

			window.removeEventListener('mouseup', self.dropOut, false);
			window.removeEventListener('touchend', self.dropOut, false);
		};
		/**
		 * Проверяет условие открытия и закрытия глаз
		 *
		 */
		self.toggleFace = function () {
			if (control === 0) {
				self.balance.style.background = "url(images/monkey_open.png) center no-repeat";
				self.balance.style.backgroundSize = "contain";

			} else {
				self.balance.style.background = "url(images/monkey_close.png) center no-repeat";
				self.balance.style.backgroundSize = "contain";
			}
		};
		/**
		 * Поворачивает перекладину весов и изменяет положение чаш весов
		 * @param {object} boxLeft - Левый контейнеров весов.
		 * @param {object} boxRight - Правый контейнеров весов.
		 */
		self.setTransform = function (boxLeft, boxRight) {
			boxLeft.style.transform = `translateY(${( control > 9 ) ? 9 : control}vw) translateZ(0)`;
			boxRight.style.transform = `translateY(${( -control < -9 ) ? -9 : -control}vw) translateZ(0)`;
			stick.style.transform = `rotate(${( -control * 2 < -18 ) ? -18 : -control * 2}deg) translateZ(0)`;
		}
	}
	//Вспомогательные функции
	/**
	 * Находит top, left элемента
	 * @param  elem DOM-елемент
	 * @return Объект с координатами
	 */
	function getElementPos(elem) {
		let x = 0;
		let y = 0;

		while (elem) {
			x += elem.offsetLeft;
			y += elem.offsetTop;
			elem = elem.offsetParent;
		}

		return {
			left: x,
			top: y
		};
	}
	/**
	 * Расставляет элементы (устанавливает bottom и left) в одном ряду игрового поля
	 * @param {number} index Порядковый номер элемента
	 * @param {object} element DOM-елемент
	 * @param {string} pos Первый, второй или третий ряд элементов
	 */
	function getStyleLeft(index, element, pos) {
		element.style.bottom = pos;

		if (index == 0 || index == 3 || index == 6) element.style.left = "1vw";
		if (index == 1 || index == 4 || index == 7) element.style.left = "6.5vw";
		if (index == 2 || index == 5 || index == 8) element.style.left = "12vw";
	}
	/**
	 * Подготавливает и вставляет контейнеры для каждого банана и цифры
	 * @param {number} index Порядковый номер элемента
	 * @param {object} contain Контейнер левой или правой чаши весов
	 */
	function getBox(index, contain) {
		let box = document.createElement('div');
		box.className = 'box';
		box.style.position = 'absolute';

		if (index < 3) {
			getStyleLeft(index, box, "6vw");
		} else if (3 <= index && index < 6) {
			getStyleLeft(index, box, "11.5vw");
		} else if (6 <= index && index < 9) {
			getStyleLeft(index, box, "17vw");
		}

		contain.insertBefore(box, contain.firstChild);
	}
}