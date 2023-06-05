export default class Table extends HTMLElement {
	static observedAttributes = ['column-defs', 'page', 'page-size', 'rows'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: block;
					width: 100%;
				}
				:host([allow-selection='true']) .row:not(#row-header):not(#row-footer), input {
					cursor: pointer;
				}
				.body {
					display: flex;
					flex-direction: column;
				}
				.cell {
					border-left: 1px solid black;
					display: flex;
					flex: 1;
					padding: 5px;
				}
				.cell:last-child {
					border-right: 1px solid black;
				}
				.footer:not(:empty) {
					border-top: 1px solid black;
				}
				.footer-inner {
					display: flex;
					flex: 1;
					gap: 5px;
					justify-content: flex-end;
					user-select: none;
				}
				.footer-inner:first-child {
					flex: 3;
					justify-content: flex-start;
				}
				.header:not(:empty) {
					border-bottom: 1px solid black;
				}
				.pages {
					display: flex;
				}
				.row {
					display: flex;
					user-select: none;
				}
				.row[aria-selected='true'] {
					background: #D7DFF3;
				}
				.row + .row {
					border-top: 1px solid black;
				}
				#row-footer {
					border-left: 1px solid black;
					border-right: 1px solid black;
					justify-content: space-between;
					padding: 5px;
					place-items: center;
				}
				#row-footer button {
					background: none;
					border: none;
					cursor: pointer;
					display: flex;
					place-self: center;
				}
				#row-footer button:disabled {
					cursor: default;
					pointer-events: none;
				}
				.table {
					border-bottom: 1px solid black;
					border-top: 1px solid black;
				}
			</style>
			<div class='table'>
				<div class='header'></div>
				<div class='body'></div>
				<div class='footer'>
					<div class='row' id='row-footer'>
						<div class='footer-inner'>
							<span id='selected-number' hidden='true'></span>
							<span id='selected-single' hidden='true'>row selected</span>
							<span id='selected-multi' hidden='true'>rows selected</span>
						</div>
						<div class='footer-inner'>
							<span style='font-size: 11px; place-self: center;'>Rows per page:</span>
							<select id='page-size'>
								<option>10</option>
								<option>25</option>
								<option>50</option>
								<option>100</option>
							</select>
						</div>
						<div class='footer-inner'>
							<div id='current-page'>0</div>
							of
							<div id='total-pages'>0</div>
							<button id='prev-page' style='border: none; padding: 0;'>
								<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
									<path d="M561-240 320-481l241-241 43 43-198 198 198 198-43 43Z"/>
								</svg>
							</button>
							<button id='next-page' style='border: none; padding: 0;'>
								<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
									<path d="m375-240-43-43 198-198-198-198 43-43 241 241-241 241Z"/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		`;
		this._allowSelection = true;
		this._anchor = null;
		this._columnDefs = null;
		this._initialized = false;
		this._page = 0;
		this._pageSize = 0;
		this._rows = null;
		this._selected = [];
		this._TOTAL_GENERATED = 140;
	}

	get #allowSelection() { return this._allowSelection; }
	set #allowSelection(newVal) { this._allowSelection = newVal; }

	get #anchor() { return this._anchor; }
	set #anchor(newVal) { this._anchor = newVal; }

	get #body() { return this.shadowRoot.querySelector('.body'); }

	get columnDefs() { return this._columnDefs; }
	set columnDefs(newVal) {
		try {
			this._columnDefs = JSON.parse(newVal);
			if (this._columnDefs?.length > 0) {
				this.#header.appendChild(this.buildRow(this._columnDefs, -1, true));
			}
		} catch(err) {
			this._columnDefs = [];
			console.error(err);
		}
	}

	get #footerCurrentPage() { return this.shadowRoot.querySelector('#current-page'); }
	get #footerPageSize() { return this.shadowRoot.querySelector('#page-size'); }
	get #footerPrevBtn() { return this.shadowRoot.querySelector('#prev-page'); }
	get #footerNextBtn() { return this.shadowRoot.querySelector('#next-page'); }
	get #footerTotalPages() { return this.shadowRoot.querySelector('#total-pages'); }
	get #header() { return this.shadowRoot.querySelector('.header'); }

	get #initialized() { return this._initialized; }
	set #initialized(newVal) { this._initialized = newVal; }

	get page() { return this._page; }
	set page(newVal) {
		if (newVal != this._page) {
			this._page = newVal;
			this.#footerCurrentPage.innerText = newVal + 1;
			const currentTotal = parseInt(this.#footerTotalPages.innerText);
			if (currentTotal != this.getTotalPages()) {
				this.#footerTotalPages.innerText = this.getTotalPages();
			}
			if (this._page > 0) {
				this.#footerPrevBtn.removeAttribute('disabled');
			} else {
				this.#footerPrevBtn.setAttribute('disabled', true);
			}
			if (this._page + 1 >= this.getTotalPages()) {
				this.#footerNextBtn.setAttribute('disabled', true);
			} else {
				this.#footerNextBtn.removeAttribute('disabled');
			}
			this.forceRender();
		}
	}

	get pageSize() { return this._pageSize; }
	set pageSize(newVal) {
		if (newVal != this._pageSize) {
			this._pageSize = newVal;
			const currentTotal = parseInt(this.#footerTotalPages.innerText);
			if (currentTotal != this.getTotalPages()) {
				this.#footerTotalPages.innerText = this.getTotalPages();
			}
			const topEl = [...this.#body.childNodes][0] || {};
			const topIndex = parseInt(topEl?.id?.match(/\d+/));
			if (topEl && !isNaN(topIndex)) {
				const range = this.getCurrentRange();
				if (topIndex < range.min) {
					const findPage = (page) => {
						const offset = newVal;
						const min = page * offset;
						if (topIndex < min) {
							return findPage(page - 1)
						} else {
							return page;
						}
					}
					const newPage = findPage(this.page);
					this.page = newPage;
				} else if (topIndex > range.max) {
					const findPage = (page) => {
						const offset = newVal;
						const max = (page + 1) * offset;
						if (topIndex >= max) {
							return findPage(page + 1)
						} else {
							return page;
						}
					}
					const newPage = findPage(this.page);
					this.page = newPage;
				}
			}
			this.forceRender();
		}
	}

	get rows() { return this._rows; }
	set rows(newVal) {
		try {
			this._rows = JSON.parse(newVal);
			if (this._rows?.length > 0) {
				if (this.#body.children.length > 0) {
					[...this.#body.children].forEach((a) => a.remove());
				}
				this.forceRender();
			}
		} catch(err) {
			this._rows = [];
			console.error(err);
		}
	}

	get selected() { return this._selected; }
	set selected(newVal) { this._selected = newVal; }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (this.#initialized) {
			switch(attr) {
				case 'column-defs':
					this.columnDefs = newVal;
					break;
				case 'page':
					this.page = newVal;
					break;
				case 'page-size':
					this.pageSize = newVal;
					break;
				case 'rows':
					if (this.columnDefs?.length > 0) {
						this.rows = newVal;
					}
					break;
			}
		}
	}

	connectedCallback() {
		const allowSelection = this.getAttribute('allow-selection');
		if (allowSelection != null) {
			this.#allowSelection = allowSelection;
		} else {
			this.setAttribute('allow-selection', true);
		}
		this.columnDefs = this.getAttribute('column-defs');
		const rows = this.getAttribute('rows');
		if (rows != null) {
			this.rows = rows;
		} else {
			this.rows = this.generateFakeData();
		}
		if (this.getAttribute('page')) this.page = parseInt(this.getAttribute('page'));
		const pageSize = parseInt(this.getAttribute('page-size'));
		if (pageSize != null) {
			this.pageSize = pageSize;
			const el = this.shadowRoot.querySelector('select');
			const options = el?.options || [];
			[...options].forEach((a) => {
				const val = parseInt(a.innerHTML);
				if (val === pageSize) {
					el.setAttribute('selected', a.id);
				}
			});
		}
		this.#footerCurrentPage.innerText = this.page + 1;
		this.#footerTotalPages.innerText = this.getTotalPages();
		this.#footerNextBtn.addEventListener('click', this.setNextPage);
		if (this.page >= this.getTotalPages()) {
			this.#footerNextBtn.setAttribute('disabled', true);
		}
		this.#footerPrevBtn.addEventListener('click', this.setPrevPage);
		if (this.page == 0) {
			this.#footerPrevBtn.setAttribute('disabled', true);
		}
		this.#footerPageSize.addEventListener('change', this.setPageSize);
		this.#initialized = true;
	}

	buildCell = (row, index, isHeader) => {
		const element = document.createElement('div');
		let content = document.createTextNode(row);
		if (isHeader) {
			content = document.createTextNode(`${row.name}`);
		}
		element.classList.add('cell');
		if (isHeader) {
			element.style.flex = row.size;
		} else {
			element.classList.add(this.getColumnType(index));
			element.style.flex = this.getColumnSize(index);
		}
		element.setAttribute('id', `cell-${index}`);
		element.appendChild(content);
		return element;
	}

	buildRow = (row, index, isHeader) => {
		const arr = Object.values(row);
		const element = document.createElement('div');
		element.classList.add('row');
		if (isHeader) {
			element.setAttribute('id', 'row-header');
		} else {
			element.setAttribute('id', `row-${index}`);
		}

		if (this.#allowSelection) {
			const selector = document.createElement('span');
			selector.classList.add('cell');
			selector.classList.add('selectable');
			selector.style.flex = '0 0 20px';

			const inner = document.createElement('input');
			inner.setAttribute('type', 'checkbox');
			selector.appendChild(inner);
			element.appendChild(selector);
			if (isHeader) {
				inner.addEventListener('click', this.onSelectAllRows);
			} else {
				element.addEventListener('click', this.onSelectRow);
			}
		}

		arr.map((a, i) => element.appendChild(this.buildCell(a, i, isHeader)));
		return element;
	}

	forceRender = () => {
		this.rows.forEach((a, i) => {
			this.shadowRoot.getElementById(`row-${i}`)?.remove();
			const range = this.getCurrentRange();
			if (i >= range.min && i < range.max) {
				const el = this.buildRow(a, i, false);
				this.updateElement(el);
				this.#body.appendChild(el);
			}
		});
	}

	getColumnSize = (index) => this.columnDefs[index].size || '1';
	getColumnType = (index) => this.columnDefs[index].type || 'string';
	
	getCurrentRange = () => {
		const offset = this.pageSize;
		const min = this.page * offset;
		const max = (this.page + 1) * offset;
		return { min, max };
	}

	getTotalPages = () => Math.ceil(this.rows.length / this.pageSize);

	onSelectAllRows = () => {
		if (this.selected.length === this.rows.length) {
			this.selected = [];
		} else {
			this.selected = this.rows.map((a, i) => i);
		}
		[...this.#body.children].forEach((a) => this.updateElement(a));
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}

	onSelectRow = (e) => {
		const getRow = (el) => {
			if (el.classList.contains('row')) {
				return el;
			} else {
				return getRow(el.parentElement);
			}
		}
		const row = getRow(e.target);
		const cur = parseInt(row.id.match(/\d+/));
		if (e.shiftKey) {
			let other = -1;
			if (this.#anchor == null) {
				other = this.selected[this.selected.length - 1];
				this.#anchor = other;
			} else {
				other = this.#anchor;
			}

			if (!isNaN(cur) && !isNaN(other)) {
				const up = cur < other;
				this.rows.forEach((a, i) => {
					const inRange = (up && i <= other && i >= cur) || (!up && i >= other && i <= cur);
					if (inRange && this.selected.indexOf(i) == -1) {
						this.selected.push(i);
					}

					const el = this.shadowRoot.querySelector(`#row-${i}`);
					if (el) {
						this.updateElement(el);
					}
				});
			}
		} else {
			this.#anchor = null;

			if (this.selected.indexOf(cur) == -1) {
				this.selected.push(cur);
			} else if (this.selected.indexOf(cur) > -1) {
				this.selected.splice(this.selected.indexOf(cur), 1);
			}

			[...this.#body.children].forEach((a) => this.updateElement(a));
		}

		if (this.selected.length === this.rows.length) {
			this.#header.querySelector('input').checked = true;
		} else {
			this.#header.querySelector('input').checked = false;
		}
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}

	setNextPage = () => {
		if (this.page + 1 < this.getTotalPages()) {
			this.page = this.page + 1;
		}
	}

	setPrevPage = () => {
		if (this.page - 1 >= 0) {
			this.page = this.page - 1;
		}
	}

	setPageSize = (e) => this.pageSize = parseInt(e.target.value);

	setSelected = (el, override) => {
		const selected = el.getAttribute('aria-selected');
		let bool = false;

		if (override) {
			bool = override;
		} else {
			bool = !(selected === 'true' || selected === true);
		}

		const index = parseInt(el?.id?.match(/\d+/));
		if (!isNaN(index)) {
			const isSelected = this.selected.indexOf(index) > -1;
			if (isSelected && !bool) {
				this.selected.splice(this.selected.indexOf(index), 1);
			} else if (!isSelected && bool) {
				this.selected.push(index);
			}
		}
		this.updateElement(el);
	}

	updateElement = (el) => {
		const i = parseInt(el.id.match(/\d+/));
		const selector = [...el.children].find((a) => a.classList.contains('selectable'));
		const input = [...selector.children][0];
		if (this.selected.indexOf(i) > -1) {
			el.setAttribute('aria-selected', true);
			input.checked = true;
		} else {
			el.setAttribute('aria-selected', false);
			input.checked = false;
		}
	}

	generateFakeData = () => {
		const fake = [];
		for (let i = 0; i < this._TOTAL_GENERATED; i++) {
			const newObj = { id: i, name: 'Lorem Ipsum', company: 'AllenComm' };
			fake.push(newObj);
		}
		return JSON.stringify(fake);
	}
}

customElements.define('ac-table', Table);
