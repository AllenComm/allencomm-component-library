export default class Table extends HTMLElement {
	// Depends on:
	// 		ac-button
	// 		ac-select
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
				ac-select {
					flex-basis: 140px;
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
					gap: 5px;
				}
				.header:not(:empty) {
					border-bottom: 1px solid black;
				}
				.pages {
					display: flex;
				}
				.row {
					display: flex;
				}
				.row[aria-selected='true'] {
					background: #EBEFF9;
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
				#row-footer ac-button {
					border: none;
					display: flex;
					place-self: center;
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
							<ac-button id='prev-page' style='border: none; padding: 0;'>
								<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
									<path d="M561-240 320-481l241-241 43 43-198 198 198 198-43 43Z"/>
								</svg>
							</ac-button>
							<div id='current-page'>0</div>
							of
							<div id='total-pages'>0</div>
							<ac-button id='next-page' style='border: none; padding: 0;'>
								<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
									<path d="m375-240-43-43 198-198-198-198 43-43 241 241-241 241Z"/>
								</svg>
							</ac-button>
						</div>
						<ac-select anchor='bottom' id='page-size'>
							<span style='font-size: 11px; place-self: center;'>Rows per page:</span>
							<ac-option>10</ac-option>
							<ac-option>25</ac-option>
							<ac-option>50</ac-option>
							<ac-option>100</ac-option>
						</ac-select>
					</div>
				</div>
			</div>
		`;
		this._allowSelection = false;
		this._columnDefs = null;
		this._initialized = false;
		this._page = 0;
		this._pageSize = 0;
		this._rows = null;
		this._selected = [];
		this._TOTAL_FAKE = 200;
	}

	get #allowSelection() { return this._allowSelection; }
	set #allowSelection(newVal) { this._allowSelection = newVal; }

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

	get #header() { return this.shadowRoot.querySelector('.header'); }

	get #initialized() { return this._initialized; }
	set #initialized(newVal) { this._initialized = newVal; }

	get page() { return this._page; }
	set page(newVal) {
		if (newVal != this._page) {
			this._page = newVal;
			this.shadowRoot.querySelector('#current-page').innerText = newVal + 1;
			const currentTotal = parseInt(this.shadowRoot.querySelector('#total-pages').innerText);
			if (currentTotal != this.getTotalPages()) {
				this.shadowRoot.querySelector('#total-pages').innerText = this.getTotalPages();
			}
			this.updateRender();
		}
	}

	get pageSize() { return this._pageSize; }
	set pageSize(newVal) {
		if (newVal != this._pageSize) {
			this._pageSize = newVal;
			const currentTotal = parseInt(this.shadowRoot.querySelector('#total-pages').innerText);
			if (currentTotal != this.getTotalPages()) {
				this.shadowRoot.querySelector('#total-pages').innerText = this.getTotalPages();
			}
			const topEl = [...this.#body.childNodes][0] || {};
			const topIndex = parseInt(topEl?.id?.match(/\d+/));
			if (topEl && !isNaN(topIndex)) {
				if (topIndex < this.getCurrentRange().min) {
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
				} else if (topIndex > this.getCurrentRange().max) {
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
			this.updateRender();
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
				this.updateRender();
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
		if (allowSelection != null) this.#allowSelection = allowSelection;
		this.columnDefs = this.getAttribute('column-defs');
		const rows = this.getAttribute('rows');
		if (rows != null) {
			this.rows = rows;
		} else {
			this.rows = this.generateFakeData();
		}
		const page = this.getAttribute('page');
		if (page != null) this.page = parseInt(this.getAttribute('page'));
		const pageSize = parseInt(this.getAttribute('page-size'));
		if (pageSize != null) {
			this.pageSize = parseInt(this.getAttribute('page-size'));
			const el = this.shadowRoot.querySelector('ac-select');
			const options = el?.options || [];
			options.forEach((a) => {
				const val = parseInt(a.innerHTML);
				if (val === pageSize) {
					el.setAttribute('selected', a.id);
				}
			});
		}
		this.shadowRoot.querySelector('#current-page').innerText = this.page + 1;
		this.shadowRoot.querySelector('#total-pages').innerText = this.getTotalPages();
		this.shadowRoot.querySelector('#next-page').addEventListener('click', this.setNextPage);
		if (this.page + 1 >= this.getTotalPages()) {
			this.shadowRoot.querySelector('#next-page').setAttribute('disabled', true);
		}
		this.shadowRoot.querySelector('#prev-page').addEventListener('click', this.setPrevPage);
		if (this.page == 0) {
			this.shadowRoot.querySelector('#prev-page').setAttribute('disabled', true);
		}
		this.shadowRoot.querySelector('#page-size').addEventListener('change', this.setPageSize);
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
			if (isHeader) {
				inner.style.pointerEvents = 'none';
				inner.style.visibility = 'hidden';
			}

			element.appendChild(selector);
			element.addEventListener('click', this.onRowSelect);
		}

		arr.map((a, i) => element.appendChild(this.buildCell(a, i, isHeader)));
		return element;
	}

	getColumnSize = (index) => this.columnDefs[index].size || '1';
	getColumnType = (index) => this.columnDefs[index].type || 'string';
	
	getCurrentRange = () => {
		const offset = this.pageSize;
		const min = this.page * offset;
		const max = (this.page + 1) * offset;
		return { min, max };
	}

	getTotalPages = () => {
		return Math.ceil(this.rows.length / this.pageSize);
	}

	onRowSelect = (e) => {
		const getRow = (el) => {
			if (el.classList.contains('row')) {
				return el;
			} else {
				return getRow(el.parentElement);
			}
		}
		const row = getRow(e.target);
		const selected = row.getAttribute('aria-selected');
		const bool = selected === 'true' || selected === true;
		row.setAttribute('aria-selected', !bool)
		const selector = [...row.children].find((a) => a.classList.contains('selectable'));
		[...selector.children][0].checked = !bool;
		const index = parseInt(row?.id?.match(/\d+/));
		if (!isNaN(index)) this.selected.push(index);
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

	setPageSize = (e) => this.pageSize = e.target.textValue;

	updateRender = () => {
		this.rows.forEach((a, i) => {
			this.shadowRoot.getElementById(`row-${i}`)?.remove();
			if (i >= this.getCurrentRange().min && i < this.getCurrentRange().max) {
				this.#body.appendChild(this.buildRow(a, i, false));
			}
		});
	}

	generateFakeData = () => {
		const fake = [];
		for (let i = 0; i < this._TOTAL_FAKE; i++) {
			const newObj = { id: i, name: 'Lorem Ipsum', company: 'AllenComm' };
			fake.push(newObj);
		}
		return JSON.stringify(fake);
	}
}

customElements.define('ac-table', Table);
