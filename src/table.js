// TODO:
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
					display: flex;
					flex: 1;
					padding: 5px;
				}
				.cell:not(:first-child) {
					border-left: 1px solid black;
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
				.header {
					font-weight: bold;
				}
				.header:not(:empty) {
					border-bottom: 1px solid black;
				}
				.header .cell {
					position: relative;
				}
				.header .cell[class*="sort"] {
					justify-content: space-between;
				}
				.header .cell.sort-none:after {
					content: '';
				}
				.header .cell.sort-ascending > span:after {
					content: '\\2191';
				}
				.header .cell.sort-descending > span:after {
					content: '\\2193';
				}
				.header .cell > button {
					position: absolute;
					right: 0;
					top: 50%;
					transform: translateY(-50%);
				}
				.pages {
					display: flex;
				}
				.popup {
					background-color: white;
					display: none;
					flex-direction: column;
					left: 0;
					position: absolute;
					top: 32px;
					transform: translateX(-100%);
				}
				.popup.visible {
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
					border: 1px solid black;
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
								<option value='10'>10</option>
								<option value='25'>25</option>
								<option value='50'>50</option>
								<option value='100'>100</option>
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
				<div id='popup' class='popup'>
					<button id='sort-asc-btn'>Sort ASC</button>
					<button id='sort-desc-btn'>Sort DESC</button>
					<button id='filter-btn'>Filter</button>
					<button id='manage-columns-btn'>Manage Columns</button>
				</div>
				<div id='visibility-popup' class='popup'></div>
				<div id='filter-popup' class='popup'></div>
			</div>
		`;
		this.ASC = 'ascending';
		this.DES = 'descending';
		this.NONE = 'none';
		this._allowSelection = true;
		this._anchor = null;
		this._columns = null;
		this._initialized = false;
		this._page = 0;
		this._pageSize = 10;
		this._rows = null;
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

	get #popup() { return this.shadowRoot.querySelector('#popup'); }
	get #visibilityPopup() { return this.shadowRoot.querySelector('#visibility-popup'); }
	get #filterPopup() { return this.shadowRoot.querySelector('#filter-popup'); }
	get #footerCurrentPage() { return this.shadowRoot.querySelector('#current-page'); }
	get #footerPageSize() { return this.shadowRoot.querySelector('#page-size'); }
	get #footerPrevBtn() { return this.shadowRoot.querySelector('#prev-page'); }
	get #footerNextBtn() { return this.shadowRoot.querySelector('#next-page'); }
	get #footerSelectedMulti() { return this.shadowRoot.querySelector('#selected-multi'); }
	get #footerSelectedNumber() { return this.shadowRoot.querySelector('#selected-number'); }
	get #footerSelectedSingle() { return this.shadowRoot.querySelector('#selected-single'); }
	get #footerTotalPages() { return this.shadowRoot.querySelector('#total-pages'); }

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
		if (newVal === this._pageSize) return;
		this._pageSize = newVal;
		const el = this.shadowRoot.querySelector('select');
		[...el?.options || []].forEach((a) => {
			if (parseInt(a.innerHTML) === this._pageSize) {
				el.setAttribute('selected', a.id);
			}
		});

		const topEl = [...this.#body.childNodes][0] || {};
		const topIndex = parseInt(topEl?.id?.match(/\d+/));
		if (!topEl || isNaN(topIndex)) return;
		const range = this.getCurrentRange();

		if (topIndex < range.min || topIndex > range.max) {
			const findPage = (page) => {
				const border = topIndex < range.min ? page * newVal : (page + 1) * newVal;
				return topIndex < border ? findPage(topIndex < range.min ? page - 1 : page + 1) : page;
			}
			this.page = findPage(this.page);
		}
		this.forceRender();
	}

	get rows() { return this._rows; }
	set rows(newVal) {
		try {
			this._rows = newVal;
			if (this._rows?.length > 0) {
				this._rows = this.rowsFilter(this.rowsSort(this._rows));
				this.#body.innerHTML = '';
				this.forceRender();
			}
		} catch(err) {
			this._rows = [];
			console.error(err);
		}
	}

	get selected() { return this._rows?.filter(a => a._selected ) || []; }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (!this.#initialized) return;

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
		this.#popup.addEventListener('click', (e) => e.stopPropagation());
		this.#visibilityPopup.addEventListener('click', (e) => e.stopPropagation());
		this.shadowRoot.querySelector('#manage-columns-btn').addEventListener('click', this.onManageColumnsClick);
		this.shadowRoot.querySelector('#sort-asc-btn').addEventListener('click', () => this.sortColumn(this.ASC));
		this.shadowRoot.querySelector('#sort-desc-btn').addEventListener('click', () => this.sortColumn(this.DES));
		document.addEventListener('click', this.onClickOutside);
		this.updateFooter();
		this.#initialized = true;
	}

	disconnectedCallback() {
		document.removeEventListener('click', this.onClickOutside);
	}

	buildCell = (data, cellIndex, rowIndex, column) => {
		if (column.hidden) return null;

		const element = document.createElement('div');
		element.classList.add('cell');
		element.classList.add(column.type);
		element.style.flex = column.flex || '1 1 100%';

		element.setAttribute('id', `cell-${cellIndex}`);
		const render = column.render;
		element.innerHTML = render ? `<slot name="${rowIndex}-${cellIndex}"></slot>` : data;

		if (render) {
			const el = document.createElement('span');
			el.innerHTML = render(data);
			el.firstElementChild.slot = `${rowIndex}-${cellIndex}`;
			this.shadowRoot.host.appendChild(el.firstElementChild);
		}

		return element;
	}

	buildCellHeader = ({ display, flex, sort, type }, index, column) => {
		if (column.hidden) return null;

		const element = document.createElement('div');
		const content = document.createElement('span');
		content.textContent = display;
		element.className = `cell sort-${sort}`;
		element.setAttribute('data-property', column.property);
		element.style.flex = flex;
		element.setAttribute('id', `cell-${index}`);
		element.appendChild(content);
		element.addEventListener('click', () => this.toggleSort(column));
		const button = document.createElement('button');
		button.textContent = '\u1392';
		button.addEventListener('click', (e) => this.onSelectHeaderButton(e, column));
		element.appendChild(button);
		return element;
	}
	
	buildRow = (row, index, isHeader) => {
		const element = document.createElement('div');
		element.classList.add('row');
		element.id = isHeader ? 'row-header' : `row-${index}`;

		if (this.#allowSelection) {
			const selector = document.createElement('span');
			selector.className = 'cell selectable';
			selector.style.flex = '0 0 20px';

			const inner = document.createElement('input');
			inner.type = 'checkbox';
			inner.checked = row._selected;
			element.ariaSelected = row._selected;

			selector.append(inner);
			element.append(selector);

			if (!isHeader) {
				element.addEventListener('click', (e) => this.onSelectRow(e, index));
			} else {
				inner.addEventListener('click', this.onSelectAllRows);
			}
		}
		
		const rowData = isHeader ? Object.values(row) : this.columns.map((a) => row[a?.property] ?? null);
		const rowElements = rowData.map((data, i) => isHeader ? this.buildCellHeader(data, i, this.columns[i]) : this.buildCell(data, i, index, this.columns[i]));
		rowElements.filter(Boolean).forEach(el => element.append(el));

		return element;
	}

	forceRender = () => {
		if (!this.#initialized) return;

		this.updateTotalPages();
		this.updateFooter();
		this.updateVisibilityPopup();
		this.shadowRoot.host.innerHTML = '';
		const isAllSelected = this._rows.every(a => a._selected);
		this.#header.querySelector('input').checked = isAllSelected;
		const range = this.getCurrentRange();
		this._rows.forEach((row, index) => {
			this.shadowRoot.getElementById(`row-${index}`)?.remove();
			if (index >= range.min && index < range.max) {
				const el = this.buildRow(row, index, false);
				this.#body.appendChild(el);
			}
		});
	}

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

	onClickOutside = (e) => {
		const checkClick = (el) => {
			const isPopupVisible = el.classList.contains('visible');
			const isClickedOutside = !el.contains(e.target);
			if (isPopupVisible && isClickedOutside) {
				el.classList.remove('visible');
			}
		};
		checkClick(this.#popup);
		checkClick(this.#visibilityPopup);
	}

	onManageColumnsClick = (e) => {
		this.#popup.classList.remove('visible');
		this.#visibilityPopup.classList.add('visible');
	}

	onSelectHeaderButton = (e, col) => {
		e.stopPropagation();
		this.currentColumn = col;
		this.hidePopups();
		const rect = e.target.getBoundingClientRect();
		this.#popup.style.left = `${rect.left + rect.width}px`;
		this.#popup.style.top = `${rect.top + rect.height}px`;
		this.#visibilityPopup.style.left = `${rect.left + rect.width}px`;
		this.#visibilityPopup.style.top = `${rect.top + rect.height}px`;
		this.#popup.classList.add('visible');
	}
	
	onSelectAllRows = () => {
		const isAllSelected = this._rows.every(a => a._selected);
		this._rows.forEach(a => a._selected = !isAllSelected);
		this.forceRender();
		this.fireChangeEvent();
	}
	
	onSelectRow = (e, index) => {
		if (e.shiftKey) {
			const createRange = (start, end) => Array.from({length: end - start + 1}, (v, k) => k + start);
			const selections = createRange(this.#anchor > index ? index : this.#anchor, this.#anchor > index ? this.#anchor : index);
			selections.forEach(i => this._rows[i]._selected = true);
		} else {
			const row = this._rows[index];
			this.#anchor = index;
			row._selected = !row._selected;
		}
		this.forceRender();
		this.fireChangeEvent();
	}

	hidePopups = () =>	this.shadowRoot.querySelectorAll('.popup.visible').forEach(el => el.classList.remove('visible'));
	
	rowsSort = (r) => {
		const rows = [...r];
		this.columns.map((col) => col.sort).forEach((sort, i) => {
			if (sort == this.NONE) return;

			const { type, property } = this.columns[i];
			rows.sort((a, b) => {
				const aa = a[property]; 
				const bb = b[property];
				if (aa == null && bb == null) return 0;
				if (aa == null || bb == null) return aa == null ? -1 : 1;

				let result = 0;
				if (type === 'number') {
					result = aa < bb ? -1 : 1;
				} else if (type === 'string') {
					result = aa.toLowerCase().localeCompare(bb.toLowerCase());
				}
				return sort == this.DES ? result : -result;
			});
		});
		return rows;
	}

	rowsFilter = (rows) => {
		return rows;
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
	
	sortColumn = (dir) => {
		if (this.currentColumn) {
			const headerCell = this.#header.querySelector(`.row > .cell[data-property="${this.currentColumn.property}"]`);
			const cells = this.#header.querySelectorAll('.row > .cell:not(.selectable)');
			
			this.#anchor = null;
			cells.forEach(a => a.className = `cell`);
			this.columns.forEach(a => a.sort = this.NONE);
			this.currentColumn.sort = dir;
			headerCell.classList.add(`sort-${dir}`);
			this.rows = [...this._rows];
			this.fireChangeEvent();
			this.hidePopups();
		}
	}

	toggleSort = (column) => {
		this.currentColumn = column;
		const sortCycle = { [this.NONE]: this.DES, [this.DES]: this.ASC, [this.ASC]: this.NONE };
		const newSort = sortCycle[column.sort];
		this.sortColumn(newSort);
	}

	updateFilterPopup = (e, type) => {
		e.stopPropagation();
		this.#filterPopup.innerHTML = '';
		console.log(type);
	}

	updateVisibilityPopup = () => {
		this.#visibilityPopup.innerHTML = '';
		const disableLastInput = this.columns.filter(a => !a.hidden).length <= 1;

		this.columns.forEach((col, index) => {
			const wrapper = document.createElement('div');
			wrapper.innerHTML = `
				<input id='vis-${col.property}' type='checkbox' ${col.hidden ? '' : 'checked'} ${!col.hidden && disableLastInput ? 'disabled' : ''}>
				<label for='vis-${col.property}'>${col.display}</label>
			`;
			wrapper.querySelector('input').addEventListener('change', (e) => {
				const columns = [ ...this.columns ];
				columns[index].hidden = !e.target.checked;
				this.columns = columns;
				this.forceRender();
			});
			this.#visibilityPopup.appendChild(wrapper);
		});
	}
	
	updateFooter = () => {
		const selectedCount = this.selected.length;
		const totalPages = this.getTotalPages();

		this.#footerCurrentPage.innerText = this.page + 1;
		this.#footerPrevBtn.disabled = this.page <= 0;
		this.#footerNextBtn.disabled = this.page + 1 >= totalPages;

		const hidden = selectedCount === 0;
		this.#footerSelectedNumber.innerText = hidden ? '' : selectedCount;
		this.#footerSelectedNumber.hidden = hidden;
		this.#footerSelectedMulti.hidden = hidden || selectedCount === 1;
		this.#footerSelectedSingle.hidden = hidden || selectedCount !== 1;

		this.#footerPageSize.value = this.pageSize;
	}

	updateTotalPages = () => {
		const currentTotal = parseInt(this.#footerTotalPages.innerText);
		if (currentTotal != this.getTotalPages()) {
			this.#footerTotalPages.innerText = this.getTotalPages();
		}
	}

	fireChangeEvent = () => {
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-table', Table);
