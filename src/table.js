// TODO:
// 	hide/show columns
// 		columns need to support hidden by default
// 		hide/show each column as a checkbox
// 		menu to manage columns
// 			can be built later
// 		need at least one column visible
// 	sorting
// 		track sorting via columns
// 		'descending' or 'ascending' or none
// 	filtering
// 		array of filters
// 		each column has a filter array + sort info
export default class Table extends HTMLElement {
	static observedAttributes = ['columns', 'page', 'page-size', 'rows'];

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
		this._columns = null;
		this._furthest = null;
		this._initialized = false;
		this._page = 0;
		this._pageSize = 10;
		this._rows = null;
		this._selected = [];
		this._visibleRows = null; // FYI: visible rows != rows rendered on page
	}

	get #allowSelection() { return this._allowSelection; }
	set #allowSelection(newVal) { this._allowSelection = newVal; }

	get #anchor() { return this._anchor; }
	set #anchor(newVal) { this._anchor = newVal; }

	get #body() { return this.shadowRoot.querySelector('.body'); }

	get columns() { return this._columns; }
	set columns(newVal) {
		try {
			this._columns = newVal;
			if (this._columns?.length > 0) {
				this.#header.innerHTML = '';
				this.#header.appendChild(this.buildRow(this._columns, -1, true));
			}
		} catch(err) {
			this._columns = [];
			console.error(err);
		}
	}

	get #footerCurrentPage() { return this.shadowRoot.querySelector('#current-page'); }
	get #footerPageSize() { return this.shadowRoot.querySelector('#page-size'); }
	get #footerPrevBtn() { return this.shadowRoot.querySelector('#prev-page'); }
	get #footerNextBtn() { return this.shadowRoot.querySelector('#next-page'); }
	get #footerSelectedMulti() { return this.shadowRoot.querySelector('#selected-multi'); }
	get #footerSelectedNumber() { return this.shadowRoot.querySelector('#selected-number'); }
	get #footerSelectedSingle() { return this.shadowRoot.querySelector('#selected-single'); }
	get #footerTotalPages() { return this.shadowRoot.querySelector('#total-pages'); }

	get #furthest() { return this._furthest; }
	set #furthest(newVal) { this._furthest = newVal; }

	get #header() { return this.shadowRoot.querySelector('.header'); }

	get #initialized() { return this._initialized; }
	set #initialized(newVal) { this._initialized = newVal; }

	get page() { return this._page; }
	set page(newVal) {
		if (newVal != this._page) {
			this._page = newVal;
			this.#footerCurrentPage.innerText = newVal + 1;
			this.forceRender();
		}
	}

	get pageSize() { return this._pageSize; }
	set pageSize(newVal) {
		if (newVal != this._pageSize) {
			this._pageSize = newVal;
			const el = this.shadowRoot.querySelector('select');
			const options = el?.options || [];
			[...options].forEach((a) => {
				const val = parseInt(a.innerHTML);
				if (val === this._pageSize) {
					el.setAttribute('selected', a.id);
				}
			});

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
			this._rows = newVal;
			if (this._rows?.length > 0) {
				this.visibleRows = this.rowsFilter(this.rowsSort(this._rows));
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

	get visibleRows() { return this._visibleRows; }
	set visibleRows(newVal) { this._visibleRows = newVal; }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (this.#initialized) {
			switch(attr) {
				case 'columns':
					this.columns = JSON.parse(newVal);
					break;
				case 'page':
					this.page = newVal;
					break;
				case 'page-size':
					this.pageSize = newVal;
					break;
				case 'rows':
					this.rows = JSON.parse(newVal);
					break;
			}
		}
	}

	connectedCallback() {
		const allowSelection = this.getAttribute('allow-selection');
		const page = this.getAttribute('page');
		const pageSize = parseInt(this.getAttribute('page-size'));
		if (allowSelection != null) {
			this.#allowSelection = allowSelection;
		} else {
			this.setAttribute('allow-selection', true);
		}
		const columns = this.getAttribute('columns');
		this.columns = columns ? JSON.parse(columns) : null;
		if (page != null && !isNaN(page)) {
			this.page = parseInt(page);
		}
		if (pageSize != null && !isNaN(pageSize)) {
			this.pageSize = pageSize;
		}
		this.#footerNextBtn.addEventListener('click', this.setNextPage);
		this.#footerPrevBtn.addEventListener('click', this.setPrevPage);
		this.#footerPageSize.addEventListener('change', this.setPageSize);
		this.updateFooter();
		this.#initialized = true;
	}

	buildCell = (data, cellIndex, rowIndex) => {
		const element = document.createElement('div');
		element.classList.add('cell');
		element.classList.add(this.getColumnType(cellIndex));
		element.style.flex = this.getColumnSize(cellIndex);
		element.setAttribute('id', `cell-${cellIndex}`);
		const render = this.getColumnRender(cellIndex);
		element.innerHTML = render ? `<slot name="${rowIndex}-${cellIndex}"></slot>` : data;

		if (render) {
			const el = document.createElement('span');
			el.slot = `${rowIndex}-${cellIndex}`;
			el.innerHTML = render(data);
			this.shadowRoot.host.appendChild(el);
		}

		return element;
	}

	buildCellHeader = ({ name, flex }, index) => {
		const element = document.createElement('div');
		const content = document.createTextNode(`${name}`);
		element.classList.add('cell');
		element.style.flex = flex;
		element.setAttribute('id', `cell-${index}`);
		element.appendChild(content);
		return element;
	}

	buildRow = (row, index, isHeader) => {
		const rowData = Object.values(row);
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

		rowData.map((a, i) => element.appendChild(isHeader ? this.buildCellHeader(a, i, index) : this.buildCell(a, i, index)));
		return element;
	}

	forceRender = () => {
		if (!this.#initialized) {
			return;
		}

		this.updateTotalPages();
		this.updateFooter();
		const range = this.getCurrentRange();
		this.visibleRows.forEach((a, i) => {
			this.shadowRoot.getElementById(`row-${i}`)?.remove();
			if (i >= range.min && i < range.max) {
				const el = this.buildRow(a, i, false);
				this.updateElement(el);
				this.#body.appendChild(el);
			}
		});
	}

	getColumn = (index) => this.columns[index];
	getColumnRender = (index) => this.getColumn(index).render;
	getColumnFlex = (index) => this.getColumn(index).flex || '1';
	getColumnType = (index) => this.getColumn(index).type || 'string';

	getCurrentRange = () => {
		const offset = this.pageSize;
		const min = this.page * offset;
		const max = (this.page + 1) * offset;
		return { min, max };
	}

	getTotalPages = () => {
		if (this.rows?.length) {
			return Math.ceil(this.rows.length / this.pageSize);
		}
		return 0;
	}

	onSelectAllRows = () => {
		if (this.selected.length === this.rows.length) {
			this.selected = [];
			this.#header.querySelector('input').checked = false;
		} else {
			this.selected = this.rows.map((a, i) => i);
			this.#header.querySelector('input').checked = true;
		}
		[...this.#body.children].forEach((a) => this.updateElement(a));
		this.updateFooter();
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}

	onSelectRow = (e) => {
		const inRange = (i, x, y) => {
			let min = x;
			let max = y;
			if (min > max) {
				min = y;
				max = x;
			}
			return i >= min && i <= max;
		}

		const getRow = (el) => {
			if (el.classList.contains('row')) {
				return el;
			} else {
				return getRow(el.parentElement);
			}
		}
		const row = getRow(e.target);
		const current = parseInt(row.id.match(/\d+/));
		if (e.shiftKey) {
			const anchor = this.#anchor;
			let furthest = this.#furthest;
			if (((furthest == null || furthest < current) && current > anchor) || ((furthest == null || furthest > current) && current < anchor)) {
				furthest = current;
				this.#furthest = current;
			}

			if (!isNaN(current) && !isNaN(anchor) && !isNaN(furthest)) {
				this.rows.forEach((a, i) => {
					const inCurrentRange = inRange(i, anchor, current);
					const inFurthestRange  = inRange(i, furthest, current);
					if (inCurrentRange) {
						if (this.selected.indexOf(i) == -1) {
							this.selected.push(i);
						}
					} else if (inFurthestRange && this.selected.indexOf(i) != -1) {
						this.selected.splice(this.selected.indexOf(i), 1);
					}

					const el = this.shadowRoot.querySelector(`#row-${i}`);
					if (el) {
						this.updateElement(el);
					}
				});
			}
		} else {
			if (this.selected.indexOf(current) == -1) {
				this.selected.push(current);
			} else if (this.selected.indexOf(current) > -1) {
				this.selected.splice(this.selected.indexOf(current), 1);
			}
			this.#anchor = current;
			this.#furthest = null;
			[...this.#body.children].forEach((a) => this.updateElement(a));
		}

		if (this.selected.length === this.rows.length) {
			this.#header.querySelector('input').checked = true;
		} else {
			this.#header.querySelector('input').checked = false;
		}
		this.updateFooter();
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}

	rowsSort = (arr) => {
		return arr;
	}

	rowsFilter = (arr) => {
		return arr;
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

	updateFooter = () => {
		this.#footerCurrentPage.innerText = this.page + 1;
		this.#footerPrevBtn.disabled = this.page <= 0;
		this.#footerNextBtn.disabled = this.page + 1 >= this.getTotalPages();
		if (this.selected.length > 0) {
			this.#footerSelectedNumber.innerText = this.selected.length;
			this.#footerSelectedNumber.removeAttribute('hidden');
			if (this.selected.length > 1) {
				this.#footerSelectedMulti.removeAttribute('hidden');
				this.#footerSelectedSingle.setAttribute('hidden', true);
			} else {
				this.#footerSelectedSingle.removeAttribute('hidden');
				this.#footerSelectedMulti.setAttribute('hidden', true);
			}
		} else {
			this.#footerSelectedMulti.setAttribute('hidden', true);
			this.#footerSelectedNumber.setAttribute('hidden', true);
			this.#footerSelectedSingle.setAttribute('hidden', true);
		}
	}

	updateTotalPages = () => {
		const currentTotal = parseInt(this.#footerTotalPages.innerText);
		if (currentTotal != this.getTotalPages()) {
			this.#footerTotalPages.innerText = this.getTotalPages();
		}
	}
}

customElements.define('ac-table', Table);
