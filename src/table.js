// TODO:
//   Adding filters is inefficient...
//   Sorting is inefficient when there are 1000 rows...

export default class Table extends HTMLElement {
	static observedAttributes = ['columns', 'filters', 'page', 'page-size', 'rows'];

	#allowSelection = false;
	#anchor = null;
	#initialized = false;
	#multiFilterOperator = 'AND'; 
	#prevHeaderBtnRect = null;
	#rowsUnfiltered = null;
	#RESERVED_SELECTED = '~~SELECTED~~';

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
				:host([density='cozy']) .cell,
				:host([density='cozy']) #row-footer {
					padding: 24px 6px;
				}
				:host([density='comfortable']) .cell,
				:host([density='comfortable']) #row-footer {
					padding: 12px 6px
				}
				:host([density='compact']) .cell,
				:host([density='compact']) #row-footer {
					padding: 6px;
				}
				.body {
					display: flex;
					flex-direction: column;
				}
				.cell {
					border-bottom: 1px solid rgba(0, 0, 0, .1);
					flex: 1 0 100px;
					overflow: hidden;
					padding: 6px;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.cell-filter-btn {
					flex-shrink: 0;
					margin-left: 5px;
					padding: 0;
					width: 16px;
				}
				.cell-filter-btn > img {
					width: 100%;
				}
				.cell-menu-btn {
					opacity: 0;
					position: absolute;
					right: 0;
					top: 50%;
					transform: translateY(-50%);
					transition: opacity .2s ease;
				}
				.cell.selectable {
					align-items: center;
					display: flex;
					justify-content: center;
					overflow: visible;
				}
				.cell.selectable * {
					margin: 0;
				}
				.filter {
					display: flex;
				}
				.filter[data-type="string"] .number,
				.filter[data-type="string"] .boolean {
					display: none;
				}
				.filter[data-type="boolean"] .number,
				.filter[data-type="boolean"] .string {
					display: none;
				}
				.filter[data-type="number"] .string,
				.filter[data-type="number"] .boolean {
					display: none;
				}
				#filter-popup .filter:first-child .filter-and-or {
					visibility: hidden;
				}
				.footer:not(:empty) {
					background-color: white;
					border-top: 1px solid rgba(0, 0, 0, .1);
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
					position: sticky;
					top: 0;
				}
				.header .cell {
					background-color: white;
					cursor: pointer;
					overflow: hidden;
					position: relative;
					text-overflow: clip;
					user-select: none;
				}
				.header .cell:not(:first-child) {
					border-left: 1px solid transparent;
				}
				.header:hover .cell:not(:first-child) {
					border-color: rgba(0, 0, 0, .1);
				}
				.header .cell.sort-ascending > span:after {
					content: '\\1F815';
					margin-left: 5px;
				}
				.header .cell.sort-descending > span:after {
					content: '\\1F817';
					margin-left: 5px;
				}
				.header .cell:hover > .cell-menu-btn {
					opacity: 1;
				}
				.pages {
					display: flex;
				}
				#prev-page:disabled,
				#next-page:disabled {
					opacity: .2;
				}
				.popup {
					background-color: white;
					display: flex;
					flex-direction: column;
					left: 0;
					opacity: 0;
					pointer-events: none;
					position: absolute;
					top: 32px;
					transform: translateX(-100%);
					transition: opacity .1s ease;
					white-space: nowrap;
				}
				.popup.visible {
					opacity: 1;
					pointer-events: all;
				}
				.row {
					display: flex;
				}
				.row[aria-selected='true'] .cell {
					background: #D7DFF3;
				}
				#row-footer {
					justify-content: space-between;
					place-items: center;
					padding: 6px;
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
					border: 1px solid rgba(0, 0, 0, .1);
					display: flex;
					flex-direction: column;
					height: 100%;
					position: relative;
				}
				.table-scrollable {
					flex: 1 1 auto;
					overflow: auto;
				}
			</style>
			<div class='table'>
				<div class='table-scrollable'>
					<div class='header'></div>
					<div class='body'></div>
				</div>
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
								<option value='1000'>1000</option>
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
					<button id='export-csv'>Export To CSV</button>
				</div>
				<div id='visibility-popup' class='popup'></div>
				<div id='filter-popup' class='popup'></div>
			</div>
			<template id='filter-template'>
				<div class='filter'>
					<button class='filter-remove-btn'>X</button>
					<select class='filter-and-or'>
						<option value='AND'>AND</option>
						<option value='OR'>OR</option>
					</select>
					<select class='filter-column'></select>
					<select class='filter-operator number'>
						<option value='='>=</option>
						<option value='!='>!=</option>
						<option value='>'>&gt;</option>
						<option value='>='>&gt;=</option>
						<option value='<'>&lt;</option>
						<option value='<='>&lt;=</option>
						<option value='empty'>is empty</option>
						<option value='not_empty'>is not empty</option>
					</select>
					<select class='filter-operator string'>
						<option value='contains'>contains</option>
						<option value='equals'>equals</option>
						<option value='starts_with'>starts with</option>
						<option value='ends_with'>ends with</option>
						<option value='empty'>is empty</option>
						<option value='not_empty'>is not empty</option>
					</select>
					<select class='filter-operator boolean'>
						<option value='is_true'>is true</option>
						<option value='is_false'>is false</option>
						<option value='empty'>is empty</option>
						<option value='not_empty'>is not empty</option>
					</select>
					<input class='filter-input number' type='number'></input>
					<input class='filter-input string' type='text'></input>
				</filter>
			</template>
		`;
		this.ASC = 'ascending';
		this.DES = 'descending';
		this.NONE = 'none';
		this._columns = null;
		this._page = 0;
		this._pageSize = 10;
		this._rows = null;
		this._filters = null;
	}

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
		this.#rowsUnfiltered = newVal;
		this.onRowsUpdate(newVal);
	}

	onRowsUpdate = (rows) => {
		console.time('sort and filter');
		this._rows = this.rowsFilter(this.rowsSort(rows));
		console.timeEnd('sort and filter');
		console.time('render');
		this.forceRender();
		console.timeEnd('render');
	}

	get columns() { return this._columns; }
	set columns(newVal) {
		this._columns = newVal;
		this.forceRender();
	}

	get filters() { return this._filters || []; }
	set filters(newVal) {
		this._filters = newVal;
		if (this.#rowsUnfiltered) {
			this.rows = this.#rowsUnfiltered;
		}
	}

	get #body() { return this.shadowRoot.querySelector('.body'); }
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
	get selected() { return this._rows?.filter(a => a[this.#RESERVED_SELECTED] ) || []; }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (!this.#initialized) return;

		switch(attr) {
			case 'columns':
				this.columns = JSON.parse(newVal);
				break;
			case 'filters':
				this.filters = JSON.parse(newVal);
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
		const columns = this.getAttribute('columns');
		this.columns = columns ? JSON.parse(columns) : null;
		const filters = this.getAttribute('filters');
		this.filters = filters ? JSON.parse(filters) : null;
		const page = this.getAttribute('page');
		if (page != null && !isNaN(page)) {
			this.page = parseInt(page);
		}
		const pageSize = parseInt(this.getAttribute('page-size'));
		if (pageSize != null && !isNaN(pageSize)) {
			this.pageSize = pageSize;
		}
		this.#allowSelection = this.getAttribute('allow-selection') === 'true';
		this.#multiFilterOperator = this.getAttribute('multi-filter-operator')?.toUpperCase() === 'OR' ? 'OR' : 'AND';
		
		this.#footerNextBtn.addEventListener('click', this.setNextPage);
		this.#footerPrevBtn.addEventListener('click', this.setPrevPage);
		this.#footerPageSize.addEventListener('change', this.setPageSize);
		this.#popup.addEventListener('click', (e) => e.stopPropagation());
		this.#visibilityPopup.addEventListener('click', (e) => e.stopPropagation());
		this.#filterPopup.addEventListener('click', (e) => e.stopPropagation());
		this.shadowRoot.querySelector('#manage-columns-btn').addEventListener('click', this.onManageColumnsClick);
		this.shadowRoot.querySelector('#export-csv').addEventListener('click', this.exportToCsv);
		this.shadowRoot.querySelector('#sort-asc-btn').addEventListener('click', () => this.sortColumn(this.ASC));
		this.shadowRoot.querySelector('#sort-desc-btn').addEventListener('click', () => this.sortColumn(this.DES));
		this.shadowRoot.querySelector('#filter-btn').addEventListener('click', this.onFilterClick);
		document.addEventListener('click', this.onClickOutside);
		this.#initialized = true;
		this.forceRender();
	}

	disconnectedCallback() {
		document.removeEventListener('click', this.onClickOutside);
	}

	buildCell = (data, cellIndex, rowIndex, column) => {
		if (column.hidden) return null;

		const element = document.createElement('div');
		element.classList.add('cell');
		element.classList.add(column.type);
		element.style.flex = `0 0 ${column.width}`;
		element.style.whiteSpace = column.wrap ? 'normal' : null;
		element.title = data;
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

	buildCellHeader = ({ name, width, sort }, index, column) => {
		if (column.hidden) return null;

		const element = document.createElement('div');
		const content = document.createElement('span');
		content.textContent = name;
		element.className = `cell sort-${sort || 'none'}`;
		element.setAttribute('data-property', column.property);
		element.style.flex = `0 0 ${width}`;
		element.setAttribute('id', `cell-${index}`);
		element.appendChild(content);
		element.addEventListener('click', () => this.toggleSort(column));

		const hasFilter = this.filters && this.filters.find(a => a.column === column.property);
		if (hasFilter) {
			const filterBtn = document.createElement('button');
			filterBtn.className = 'cell-filter-btn';
			filterBtn.innerHTML = `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAbUlEQVQ4y2NgGE5gK8N/PHATpoZDeDUcwNSgwPAWp/I3DHLYHOXJ8Ber8r8Mbrj8UY9VQy1ujzMxbMNQvoWBEV9YCTHcQ1F+j0GQUPAaMXyHK/8O5BEBkuEakoiNRJgGhlENeMARsPIjDMMUAABg/nwFPtIxLAAAAABJRU5ErkJggg=="></img>`
			filterBtn.addEventListener('click', (e) => { 
				this.onSelectHeaderButton(e, column);
				this.onFilterClick();
			});
			element.appendChild(filterBtn);
		}

		const menuBtn = document.createElement('button');
		menuBtn.className = 'cell-menu-btn';
		menuBtn.textContent = '\u1392';
		menuBtn.addEventListener('click', (e) => this.onSelectHeaderButton(e, column));
		element.appendChild(menuBtn);

		return element;
	}
	
	buildRow = (row, index, isHeader) => {
		const element = document.createElement('div');
		element.classList.add('row');
		element.id = isHeader ? 'row-header' : `row-${index}`;

		if (this.#allowSelection) {
			const selector = document.createElement('span');
			selector.className = 'cell selectable';
			selector.style.flex = '0 0 30px';

			const inner = document.createElement('input');
			inner.type = 'checkbox';
			inner.checked = row[this.#RESERVED_SELECTED];
			element.ariaSelected = row[this.#RESERVED_SELECTED];

			const handleClick = isHeader ? this.onSelectAllRows : (e) => this.onSelectRow(e, index);
			inner.addEventListener('click', handleClick);

			selector.append(inner);
			element.append(selector);
		}
		
		const rowData = isHeader ? Object.values(row) : this.columns.map((a) => row[a?.property] ?? null);
		const rowElements = rowData.map((data, i) => isHeader ? this.buildCellHeader(data, i, this.columns[i]) : this.buildCell(data, i, index, this.columns[i]));
		rowElements.filter(Boolean).forEach(el => element.append(el));

		return element;
	}

	exportToCsv = () => {
		const replacer = (key, value) => value === null ? '' : value;
		const columns = this.columns.map(col => col.name);
		const sortedRows = this.rows.map(row => this.columns.map(col => row[col.property]));
		const rows = sortedRows.map(row => Object.entries(row).map(([key, value]) => key === this.#RESERVED_SELECTED ? null : typeof value === 'string' ? JSON.stringify(value, replacer) : value ).filter(a => a !== null));
		const data = [columns, ...rows];
		const csvContent = "data:text/csv;charset=utf-8," + data.map(row => row.join(",")).join("\n");
		const link = document.createElement('a');
		link.href = encodeURI(csvContent);
		link.target = '_blank';
		link.download = 'export.csv';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	fireChangeEvent = () => this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));

	forceRender = () => {
		if (!this.#initialized || !this._rows || !this._columns) return;

		this.updateTotalPages();
		this.updateHeader();
		this.updateFooter();
		this.updateVisibilityPopup();
		this.updateFilterPopup();
		this.shadowRoot.host.innerHTML = '';
		this.#body.innerHTML = '';
		const isAllSelected = this._rows.every(a => a[this.#RESERVED_SELECTED]);
		const range = this.getCurrentRange();
		if (this.#allowSelection) {
			this.#header.querySelector('input').checked = isAllSelected;
		}
		this._rows.forEach((row, index) => {
			this.shadowRoot.getElementById(`row-${index}`)?.remove();
			if (index >= range.min && index < range.max) {
				const el = this.buildRow(row, index, false);
				this.#body.appendChild(el);
			}
		});
	}

	getElementPositionRelativeToOtherElement = (elementRect, otherElement) => {
		const otherElementRect = otherElement.getBoundingClientRect();
		const positionTop = elementRect.top - otherElementRect.top;
		const positionLeft = elementRect.left - otherElementRect.left;
		return { top: positionTop, left: positionLeft };
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

	hidePopups = () => {
		this.shadowRoot.querySelectorAll('.popup.visible').forEach(el => el.classList.remove('visible'));
		this.#popup.style.transform = '';
		this.#visibilityPopup.style.transform = '';
		this.#filterPopup.style.transform = '';
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
		checkClick(this.#filterPopup);
	}

	onFilterClick = () => {
		this.#popup.classList.remove('visible');
		this.updateFilterPopup();
		this.#filterPopup.classList.add('visible');
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
		this.#prevHeaderBtnRect = rect;
		this.updatePopupPosition(rect);
		this.#popup.classList.add('visible');
	}
	
	onSelectAllRows = () => {
		const isAllSelected = this._rows.every(a => a[this.#RESERVED_SELECTED]);
		this._rows.forEach(a => a[this.#RESERVED_SELECTED] = !isAllSelected);
		this.forceRender();
		this.fireChangeEvent();
	}
	
	onSelectRow = (e, index) => {
		if (e.shiftKey) {
			const createRange = (start, end) => Array.from({length: end - start + 1}, (v, k) => k + start);
			const selections = createRange(this.#anchor > index ? index : this.#anchor, this.#anchor > index ? this.#anchor : index);
			selections.forEach(i => this._rows[i][this.#RESERVED_SELECTED] = true);
		} else {
			const row = this._rows[index];
			this.#anchor = index;
			row[this.#RESERVED_SELECTED] = !row[this.#RESERVED_SELECTED];
		}
		this.forceRender();
		this.fireChangeEvent();
	}
	
	rowsSort = (r) => {
		const rows = [...r];
		const colDetails = this.columns.map((col, i) => ({
			sort: col.sort,
			type: this.columns[i].type,
			property: this.columns[i].property
		})).filter(colDetail => colDetail.sort !== this.NONE);

		const compare = (a, b) => {
			for (let i = 0; i < colDetails.length; i++) {
				const { type, property, sort } = colDetails[i];
				const aa = a[property];
				const bb = b[property];
				if (aa == null) return -1;
				if (bb == null) return 1;

				let result = 0;
				if (type === 'number') {
					result = aa - bb;
				} else if (type === 'string') {
					if (typeof aa === 'string' && typeof bb === 'string') {
						result = aa.localeCompare(bb);
					}
				} else if (type === 'boolean') {
					result = aa === bb ? 0 : (aa ? -1 : 1);
				}

				if (result !== 0) {
					return sort === this.DES ? result : -result;
				}
			}

			return 0;
		}

		rows.sort(compare);
		return rows;
	}
	
	rowsFilter = (rows) => {
		const operators = {
			'=': (a, b) => Number(a) === Number(b),
			'!=': (a, b) => Number(a) !== Number(b),
			'>': (a, b) => Number(a) > Number(b),
			'>=': (a, b) => Number(a) >= Number(b),
			'<': (a, b) => Number(a) < Number(b),
			'<=': (a, b) => Number(a) <= Number(b),
			'empty': (a) => `${a}`.length === 0,
			'not_empty': (a) => `${a}`.length > 0,
			'contains': (a, b) => a.toLowerCase().indexOf(b.toLowerCase()) >= 0,
			'equals': (a, b) => a.toLowerCase() === b.toLowerCase(),
			'starts_with': (a, b) => a.toLowerCase().startsWith(b.toLowerCase()),
			'ends_with': (a, b) => a.toLowerCase().endsWith(b.toLowerCase()),
			'AND': (arr) => arr.every(a => a),
			'OR': (arr) => arr.some(a => a),
			'is_true': (a) => a === true || a === 'true',
			'is_false': (a) => a === false || a === 'false'
		};
		
		const fitleredRows = rows.filter(row => {
			const results = this.filters.map(({ column, operator, value }) => {
				const result = operators[operator](row[column], value);
				return result;
			});	
			return results.length > 0 ? operators[this.#multiFilterOperator](results) : row;
		});
		return fitleredRows;
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
			this.onRowsUpdate([...this._rows]);
			this.forceRender();
			this.fireChangeEvent();
			this.hidePopups();
		}
	}

	toggleSort = (column) => {
		this.currentColumn = column;
		const sortCycle = { [this.NONE]: this.DES, [this.DES]: this.ASC, [this.ASC]: this.NONE };
		const newSort = sortCycle[column.sort || 'none'];
		this.sortColumn(newSort);
	}

	updateFilterPopup = () => {		
		this.#filterPopup.innerHTML = '';
		const addBtn = document.createElement('button');
		addBtn.textContent = '+ Add Filter';
		addBtn.addEventListener('click', () => {
			const filters = [...this.filters];
			filters.push({ column: this.currentColumn.property, operator: 'not_empty', value: '' });
			this.filters = filters;
			this.updatePopupPosition(this.#prevHeaderBtnRect);
		});
		this.#filterPopup.appendChild(addBtn);

		const addFilter = (property, operator, value, index) => {
			const template = this.shadowRoot.querySelector('#filter-template');
			const clone = template.content.cloneNode(true);
			const container = clone.querySelector('.filter');
			const column = this.columns.find(a => a.property === property);
			const filterMulti = clone.querySelector('.filter-and-or');
			const filterProperty = clone.querySelector('.filter-column');
			const filterOperator = clone.querySelector(`.filter-operator.${column.type}`);
			const filterInput = clone.querySelector(`.filter-input.${column.type}`);
			const filterRemove = clone.querySelector('.filter-remove-btn');
			const onFilterUpdate = (e) => {
				const container = e.target.closest('.filter');
				const prop = container.querySelector('.filter-column');
				const col = this.columns.find(a => a.property === prop.value);
				const filter = { column: prop.value, operator: container.querySelector(`.filter-operator.${col.type}`).value, value: container.querySelector(`.filter-input.${col.type}`)?.value  ?? ''};
				const filters = [...this.filters];
				filters[index] = filter;
				this.page = 0;
				this.filters = filters;
			};

			this._columns.forEach(col => {
				const option = document.createElement('option');
				option.textContent = col.name;
				option.value = col.property;
				filterProperty.appendChild(option);
			});
			
			filterProperty.value = property;
			filterMulti.value = this.#multiFilterOperator;
			filterOperator.value = operator;
			if (filterInput) { 
				filterInput.value = value;
			}
			container.setAttribute('data-type', column.type);

			filterMulti.addEventListener('change', (e) => {
				this.#multiFilterOperator = e.target.value; 
				onFilterUpdate(e);
			});
			filterProperty.addEventListener('change', onFilterUpdate);
			filterOperator.addEventListener('change', onFilterUpdate);
			if (filterInput) {
				filterInput.addEventListener('change', onFilterUpdate);
			}
			filterRemove.addEventListener('click', () => {
				this.filters = this.filters.filter((a, i) => i !== index);
				this.updatePopupPosition(this.#prevHeaderBtnRect);
			});

			this.#filterPopup.insertBefore(clone, addBtn);
		};

		this.filters.forEach((filter, index) => addFilter(filter.column, filter.operator, filter.value, index));
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

	updateHeader = () => {
		this.#header.innerHTML = '';
		this.#header.appendChild(this.buildRow(this._columns, -1, true));
	}

	updatePopupPosition = (rect) => {
		const { width, height } = rect;
		const { left, top } = this.getElementPositionRelativeToOtherElement(rect, this.shadowRoot.querySelector('.table'));

		this.#popup.style.left = `${left + width}px`;
		this.#popup.style.top = `${top + height}px`;
		this.#visibilityPopup.style.left = `${left + width}px`;
		this.#visibilityPopup.style.top = `${top + height}px`;
		this.#filterPopup.style.left = `${left + width}px`;
		this.#filterPopup.style.top = `${top + height}px`;

		this.#popup.style.transform = 'translateX(-100%)';
		this.#visibilityPopup.style.transform = 'translateX(-100%)';
		this.#filterPopup.style.transform = 'translateX(-100%)';

		const [ x1, x2, x3 ] = [this.#popup.getBoundingClientRect().left, this.#visibilityPopup.getBoundingClientRect().left, this.#filterPopup.getBoundingClientRect().left];
		this.#popup.style.transform = x1 < 0 ? `translateX(calc(-100% - ${x1}px))` : 'translateX(-100%)';
		this.#visibilityPopup.style.transform = x2 < 0 ? `translateX(calc(-100% - ${x2}px))` : 'translateX(-100%)';
		this.#filterPopup.style.transform = x3 < 0 ? `translateX(calc(-100% - ${x3}px))` : 'translateX(-100%)';
	}

	updateTotalPages = () => {
		const currentTotal = parseInt(this.#footerTotalPages.innerText);
		if (currentTotal != this.getTotalPages()) {
			this.#footerTotalPages.innerText = this.getTotalPages();
		}
	}

	updateVisibilityPopup = () => {
		if (!this.columns) return;

		this.#visibilityPopup.innerHTML = '';
		const disableLastInput = this.columns.filter(a => !a.hidden).length <= 1;

		this.columns.forEach((col, index) => {
			const wrapper = document.createElement('div');
			wrapper.innerHTML = `
				<input id='vis-${col.property}' type='checkbox' ${col.hidden ? '' : 'checked'} ${!col.hidden && disableLastInput ? 'disabled' : ''}>
				<label for='vis-${col.property}'>${col.name}</label>
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
}

customElements.define('ac-table', Table);
