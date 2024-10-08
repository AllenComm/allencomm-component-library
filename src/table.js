export default class Table extends HTMLElement {
	static observedAttributes = ['columns', 'filters', 'page', 'page-size', 'rows'];
	#RESERVED_SELECTED = '~~SELECTED~~';

	#allowSelection = false;
	#anchor = null;
	#body = null;
	#filters = null;
	#footerCurrentPage = null;
	#footerNextBtn = null;
	#footerPageInfo = null;
	#footerPageSize = null;
	#footerPrevBtn = null;
	#footerSelectedMulti = null;
	#footerSelectedNumber = null;
	#footerSelectedSingle = null;
	#footerTotalPages = null;
	#footerTotalRows = null;
	#header = null;
	#initialized = false;
	#lastScrollTop = 0;
	#manage = null;
	#menu = null;
	#mouseDown = false;
	#prevHeaderBtnRect = null;
	#resizingColumn = null;
	#rowsUnfiltered = null;
	#scrollableContainer = null;
	#scrollContent = null;

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: grid;
					width: 100%;
				}
				:host([density='cozy']) .cell,
				:host([density='cozy']) #row-footer {
					padding: 24px 16px 24px 6px;
				}
				:host([density='cozy']) .cell.selectable {
					padding: 24px 6px;
				}
				:host([density='cozy']) .row {
					height: 70px;
				}
				:host([density='comfortable']) .cell,
				:host([density='comfortable']) #row-footer {
					padding: 12px 16px 12px 6px;
				}
				:host([density='comfortable']) .cell.selectable {
					padding: 12px 6px;
				}
				:host([density='comfortable']) .row {
					height: 46px;
				}
				:host([density='compact']) .cell,
				:host([density='compact']) #row-footer {
					padding: 6px 16px 6px;
				}
				:host([density='compact']) .cell.selectable {
					padding: 6px 6px;
				}
				:host([density='compact']) .row {
					height: 34px;
				}
				#body {
					position: relative;
				}
				.cell {
					overflow: hidden;
					padding: 6px 16px 6px;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.cell-filter-btn,
				.cell-menu-btn {
					background-color: #dddddd;
					border: none;
					border-radius: 3px;
					cursor: pointer;
					height: 20px;
					position: absolute;
					top: 50%;
					transform: translateY(-50%);
					transition: opacity .2s ease;
					width: 16px;
					z-index: 2;
				}
				.cell-filter-btn {
					flex-shrink: 0;
					margin-left: 5px;
					padding: 0;
				}
				.cell-filter-btn > img {
					width: 100%;
				}
				.cell-menu-btn {
					opacity: 0;
					padding: 0 6px 2px;
					right: 8px;
				}
				.cell-resize-btn {
					border: none;
					border-radius: 2px;
					background-color: #e5e5e5;
					cursor: ew-resize;
					display: inline-block;
					height: 100%;
					opacity: 0;
					padding: 0;
					position: absolute;
					right: 0;
					top: 0;
					transition: all .2s ease;
					width: 5px;
					z-index: 1;
				}
				.cell-resize-btn:hover {
					background-color: #0075ff;
				}
				.cell.selectable {
					align-items: center;
					display: flex;
					justify-content: center;
					overflow: visible;
					position: sticky;
				}
				.cell.selectable * {
					margin: 0;
				}
				.filter {
					display: flex;
				}
				.filter[data-type="string"] .number,
				.filter[data-type="string"] .boolean,
				.filter[data-type="string"] .date,
				.filter[data-type="boolean"] .number,
				.filter[data-type="boolean"] .string,
				.filter[data-type="boolean"] .date,
				.filter[data-type="number"] .string,
				.filter[data-type="number"] .boolean,
				.filter[data-type="number"] .date,
				.filter[data-type="date"] .number,
				.filter[data-type="date"] .string,
				.filter[data-type="date"] .boolean {
					display: none;
				}
				#filters .filter:first-child .filter-and-or {
					visibility: hidden;
				}
				.footer:not(:empty) {
					background-color: white;
					border-top: 1px solid rgba(0, 0, 0, .1);
				}
				.footer-inner {
					align-items: center;
					display: flex;
					flex: 1;
					gap: 5px;
					justify-content: flex-end;
					user-select: none;
					white-space: nowrap;
				}
				.footer-inner:first-child {
					flex: 3;
					justify-content: flex-start;
				}
				.footer-inner.center {
					justify-content: center;
				}
				.header {
					font-weight: bold;
					position: sticky;
					top: 0;
					z-index: 1;
				}
				.header .row {
					background-color: white;
				}
				.header .cell {
					cursor: pointer;
					position: relative;
					text-overflow: clip;
					user-select: none;
				}
				.header .cell.resizing .cell-menu-btn, .header .cell.resizing .cell-resize-btn {
					transition: none;
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
				.header .cell:hover > .cell-menu-btn, .header .cell:hover > .cell-resize-btn {
					opacity: 1;
				}
				#menu {
					left: 0;
					position: absolute;
					top: 0;
					z-index: 1;
				}
				#menu > * {
					background-color: white;
					flex-direction: column;
					display: none;
					opacity: 0;
					pointer-events: none;
					transition: opacity .1s ease;
					white-space: nowrap;
				}
				#menu.visible:not(.manage):not(.filter) #options,
				#menu.visible.manage #manage,
				#menu.visible.filter #filters {
					display: flex;
					gap: 1px;
					opacity: 1;
					pointer-events: all;
				}
				#menu #filters .filter {
					gap: 1px;
				}
				#menu #filters button,
				#menu #options button {
					align-items: flex-start;
					background-color: #dddddd;
					border-radius: 3px;
					border: none;
					color: #000000;
					cursor: pointer;
					display: flex;
					justify-content: center;
					min-width: 120px;
					padding: 4px;
					pointer-events: auto;
					transition: background-color .2s ease;
				}
				#menu #filters button[disabled],
				#menu #options button[disabled] {
					background-color: #eeeeee;
					color: #eeeeee;
					cursor: default;
					pointer-events: none;
				}
				#menu #filters button:hover,
				#menu #options button:hover {
					background-color: #cccccc;
				}
				#menu #filters button:focus-visible,
				#menu #options button:focus-visible {
					border-radius: 3px;
					outline-offset: 2px;
					outline-width: 2px;
					outline-style: solid;
				}
				#menu #filters button.filter-remove-btn {
					min-width: 30px;
				}
				#menu #filters input,
				#menu #filters select {
					background-color: #ffffff;
					border: 1px solid #cccccc;
					border-radius: 3px;
					color: #000000;
				}
				#menu #manage {
					background-color: #dddddd;
					border: 1px solid #dddddd;
					border-radius: 3px;
				}
				#menu #manage > div {
					background-color: #ffffff;
					border-radius: 3px;
					display: flex;
					gap: 5px;
				}
				#menu #manage > div label {
					padding: 0 4px;
				}
				.pages {
					display: flex;
				}
				#prev-page:disabled,
				#next-page:disabled {
					opacity: .2;
				}
				.row {
					border-bottom: 1px solid rgba(0, 0, 0, .1);
					display: inline-flex;
					height: 34px;
					min-width: 100%;
					position: relative;
					width: auto;
					will-change: transform;
				}
				.row:not(#row-header):last-child .cell {
					border-color: transparent;
				}
				.row[aria-selected='true'] {
					background: #D7DFF3;
				}
				#row-footer {
					display: flex;
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
				#row-footer #export-csv {
					border: 1px solid #d46027;
					border-radius: 3px;
				}
				#row-footer #export-csv path {
					fill: #d46027;
				}
				#row-footer button:disabled {
					cursor: default;
					pointer-events: none;
				}
				#scroll-content {
					align-items: flex-start;
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					left: 0;
					min-width: 100%;
					overflow: hidden;
					position: absolute;
					top: 0;
					width: fit-content;
					will-change: transform;
				}
				.table {
					background-color: white;
					border: 1px solid rgba(0, 0, 0, .1);
					display: flex;
					flex-direction: column;
					height: 100%;
					overflow: hidden;
					position: relative;
				}
				.table-scrollable {
					flex: 1 1 auto;
					height: 100%;
					overflow: auto;
					position: relative;
				}
				#total-rows {
					text-align: right;
				}

				@media (max-width: 425px) {
					.cell-menu-btn {
						opacity: 1;
						position: relative;
						top: 0;
						transform: none;
					}
					.header .cell {
						display: flex;
					}
					.header .cell:not(.selectable) {
						justify-content: space-between;
					}
				}
			</style>
			<div class='table' tabindex="-1">
				<div class='table-scrollable'>
					<div class='header'></div>
					<div id='body'>
						<div id="scroll-content"></div>
					</div>
				</div>
				<div class='footer'>
					<div class='row' id='row-footer'>
						<div class='footer-inner'>
							<span id='selected-number' hidden='true'></span>
							<span id='selected-single' hidden='true'>row selected</span>
							<span id='selected-multi' hidden='true'>rows selected</span>
						</div>
						<div class='footer-inner center'>
							<button id='export-csv'>
								<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
									<path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
								</svg>
							</button>
						</div>
						<div class='footer-inner'>
							<div>Rows per page:</div>
							<select id='page-size'>
								<option value='10'>10</option>
								<option value='25'>25</option>
								<option value='50'>50</option>
								<option value='100'>100</option>
								<option value='1000'>1,000</option>
								<option value='10000'>10,000</option>
								<option value='Infinity'>all</option>
							</select>
						</div>
						<div id='total-rows' class='footer-inner'></div>
						<div id='page-info' class='footer-inner'>
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
				<div id='menu'>
					<div id='options'>
						<button id='sort-asc-btn'>Sort ASC</button>
						<button id='sort-desc-btn'>Sort DESC</button>
						<button id='filter-btn'>Filter</button>
						<button id='manage-columns-btn'>Manage Columns</button>
					</div>
					<div id='manage'></div>
					<div id='filters'></div>
				</div>
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
						<option value='not_contain'>does not contain</option>
						<option value='equals'>equals</option>
						<option value='not_equal'>does not equal</option>
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
					<select class='filter-operator date'>
						<option value='contains'>contains</option>
						<option value='not_contain'>does not contain</option>
						<option value='equals'>equals</option>
						<option value='not_equal'>does not equal</option>
						<option value='starts_with'>starts with</option>
						<option value='ends_with'>ends with</option>
						<option value='empty'>is empty</option>
						<option value='not_empty'>is not empty</option>
					</select>
					<input class='filter-input number' type='number'></input>
					<input class='filter-input string' type='text'></input>
					<input class='filter-input date' type='text'></input>
				</filter>
			</template>
		`;
		this.ASC = 'ascending';
		this.DES = 'descending';
		this.NONE = 'none';
		this._columns = null;
		this._filters = null;
		this._multiFilterOperator = 'AND';
		this._page = 0;
		this._pageSize = 100;
		this._rows = null;
		this._uniqueColumn = null;
	}

	get columns() { return this._columns; }
	set columns(newVal) {
		const oldVal = this._columns;
		this._columns = newVal;
		if (newVal?.length && oldVal?.length !== newVal.length) {
			const row = this.getRowHeight();
			const len = newVal.length;
			const total = (len * 21) + (len - 1) + (row * 2);
			this.shadowRoot.host.style.minHeight = `${total}px`;
			this._uniqueColumn = this.getUniqueColumnProperty(newVal);
		}
		this.forceRender();
	}

	get filters() { return this._filters || []; }
	set filters(newVal) {
		const oldVal = this._filters;
		let updatedVal = newVal;
		if (newVal?.length > 0 && newVal.length != oldVal?.length) {
			updatedVal = updatedVal.filter((a) => !!a.column);
			this.page = 0;
		}
		this._filters = updatedVal;
		if (this.#rowsUnfiltered) {
			this.rows = this.#rowsUnfiltered;
		}
	}

	get multiFilterOperator() { return this._multiFilterOperator; }
	set multiFilterOperator(newVal) { this._multiFilterOperator = newVal; }

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
		try {
			this._pageSize = Number(newVal);
		} catch (err) {
			console.error('Setting pageSize to newVal (' + newVal + ') encountered an error:', err);
			return;
		}
		[...this.#footerPageSize?.options || []].forEach((a) => {
			if (Number(a.value) === this._pageSize) {
				this.#footerPageSize.setAttribute('selected', a.id);
			}
		});
		this.page = 0;
		if (this.#scrollContent) {
			this.#scrollContent.style.transform = '';
		}

		this.forceRender();
	}

	get rows() { return this._rows; }
	set rows(newVal) {
		this.#rowsUnfiltered = newVal;
		this.onRowsUpdate(newVal);
	}

	get selected() { return this._rows?.filter(a => a[this.#RESERVED_SELECTED] ) || []; }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (!this.#initialized) return;

		switch (attr) {
			case 'columns':
				this.columns = JSON.parse(newVal) ?? [];
				break;
			case 'filters':
				this.filters = JSON.parse(newVal) ?? [];
				break;
			case 'page':
				this.page = newVal ?? 0;
				break;
			case 'page-size':
				this.pageSize = newVal ?? 0;
				break;
			case 'rows':
				this.rows = JSON.parse(newVal) ?? [];
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
			this.page = Number(page);
		}
		const pageSize = Number(this.getAttribute('page-size'));
		if (pageSize != null && !isNaN(pageSize)) {
			setTimeout(() => { this.pageSize = pageSize > 0 ? pageSize : this._pageSize; });
		}
		this.multiFilterOperator = this.getAttribute('multi-filter-operator')?.toUpperCase() === 'OR' ? 'OR' : 'AND';
		this.#allowSelection = this.getAttribute('allow-selection') === 'true';

		this.#body = this.shadowRoot.querySelector('#body');
		this.#scrollContent = this.shadowRoot.querySelector('#scroll-content');
		this.#menu = this.shadowRoot.querySelector('#menu');
		this.#manage = this.shadowRoot.querySelector('#manage');
		this.#filters = this.shadowRoot.querySelector('#filters');
		this.#footerCurrentPage = this.shadowRoot.querySelector('#current-page');
		this.#footerPageInfo = this.shadowRoot.querySelector('#page-info');
		this.#footerPageSize = this.shadowRoot.querySelector('#page-size');
		this.#footerPrevBtn = this.shadowRoot.querySelector('#prev-page');
		this.#footerNextBtn = this.shadowRoot.querySelector('#next-page');
		this.#footerSelectedMulti = this.shadowRoot.querySelector('#selected-multi');
		this.#footerSelectedNumber = this.shadowRoot.querySelector('#selected-number');
		this.#footerSelectedSingle = this.shadowRoot.querySelector('#selected-single');
		this.#footerTotalPages = this.shadowRoot.querySelector('#total-pages');
		this.#header = this.shadowRoot.querySelector('.header');
		this.#scrollableContainer = this.shadowRoot.querySelector('.table-scrollable');
		this.#footerTotalRows = this.shadowRoot.querySelector('#total-rows');

		this.#footerNextBtn.addEventListener('click', this.setNextPage);
		this.#footerPrevBtn.addEventListener('click', this.setPrevPage);
		this.#footerPageSize.addEventListener('change', this.setPageSize);
		this.#menu.addEventListener('click', (e) => e.stopPropagation());
		this.shadowRoot.querySelector('#manage-columns-btn').addEventListener('click', this.onMenuManageClick);
		this.shadowRoot.querySelector('#export-csv').addEventListener('click', this.exportToCsv);
		this.shadowRoot.querySelector('#sort-asc-btn').addEventListener('click', () => this.sortColumn(this.ASC));
		this.shadowRoot.querySelector('#sort-desc-btn').addEventListener('click', () => this.sortColumn(this.DES));
		this.shadowRoot.querySelector('#filter-btn').addEventListener('click', this.onMenuFilterClick);
		this.#scrollableContainer.addEventListener('scroll', this.onScroll);
		document.addEventListener('click', this.onClickOutside);
		document.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('resize', this.onResize);
		this.#initialized = true;
	}

	disconnectedCallback() {
		document.removeEventListener('click', this.onClickOutside);
		document.removeEventListener('keydown', this.onKeyDown);
		window.addEventListener('resize', this.onResize);
	}

	buildCell = (data, cellIndex, rowIndex, column, rowData) => {
		if (column.hidden) return null;

		const element = document.createElement('div');
		element.classList.add('cell');
		element.classList.add(column.type);
		if (window.screen.width <= 425) {
			element.style.width = `${column.width ? parseFloat(column.width) + 30 : '100'}px`;
		} else {
			element.style.width = `${column.width || '100px'}`;
		}
		if (data != null) {
			element.title = data;
		}
		element.setAttribute('id', `cell-${cellIndex}`);

		const render = column.render;
		element.innerHTML = render ? `<slot name="${rowIndex}-${cellIndex}"></slot>` : data;

		if (render) {
			const el = document.createElement('span');
			el.innerHTML = render(rowData);
			el.firstElementChild.slot = `${rowIndex}-${cellIndex}`;
			this.shadowRoot.host.appendChild(el.firstElementChild);
		}

		return element;
	}

	buildCellHeader = ({ name, width, sort }, index, column) => {
		if (column.hidden) return null;

		const element = document.createElement('div');
		const content = document.createElement('span');
		const resizing = this.#resizingColumn?.id === `cell-${index}`;
		content.textContent = name;
		element.className = `cell sort-${sort || 'none'} ${resizing ? 'resizing' : ''}`;
		const property = typeof column.property === 'function' ? column.name.toLowerCase() : column.property;
		element.setAttribute('data-property', property);
		if (window.screen.width <= 425) {
			element.style.width = `${column.width ? parseFloat(column.width) + 30 : '100'}px`;
		} else {
			element.style.width = `${column.width || '100px'}`;
		}
		element.setAttribute('id', `cell-${index}`);
		element.appendChild(content);
		element.addEventListener('click', () => this.toggleSort(column));

		const hasFilter = this.filters && this.filters.find(a => `${a.column}` === `${column.property}`);
		if (hasFilter) {
			const filterBtn = document.createElement('button');
			filterBtn.className = 'cell-filter-btn';
			filterBtn.innerHTML = `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAbUlEQVQ4y2NgGE5gK8N/PHATpoZDeDUcwNSgwPAWp/I3DHLYHOXJ8Ber8r8Mbrj8UY9VQy1ujzMxbMNQvoWBEV9YCTHcQ1F+j0GQUPAaMXyHK/8O5BEBkuEakoiNRJgGhlENeMARsPIjDMMUAABg/nwFPtIxLAAAAABJRU5ErkJggg=="></img>`
			filterBtn.addEventListener('click', (e) => {
				this.onMenuOpenClick(e, column);
				this.onMenuFilterClick();
			});
			element.appendChild(filterBtn);
		}

		const menuBtn = document.createElement('button');
		menuBtn.className = 'cell-menu-btn';
		menuBtn.textContent = '\u1392';
		menuBtn.addEventListener('click', (e) => this.onMenuOpenClick(e, column));
		element.appendChild(menuBtn);

		const resizeBtn = document.createElement('button');
		resizeBtn.className = 'cell-resize-btn';
		resizeBtn.addEventListener('mousedown', (e) => this.resizeColumnStart(e, element, index));
		resizeBtn.addEventListener('click', (e) => e.stopPropagation());
		element.appendChild(resizeBtn);

		return element;
	}

	buildRow = (row, index, isHeader) => {
		const element = document.createElement('div');
		element.classList.add('row');
		element.id = isHeader ? 'row-header' : `row-${index}`;
		const rowIndex = this._rows.findIndex((a) => this.getDataFromProperty(a, this._uniqueColumn) == this.getDataFromProperty(row, this._uniqueColumn));

		if (this.#allowSelection) {
			const selector = document.createElement('span');
			selector.className = 'cell selectable';
			selector.style.flex = '0 0 35px';

			const inner = document.createElement('input');
			inner.type = 'checkbox';
			inner.checked = row[this.#RESERVED_SELECTED];
			element.ariaSelected = row[this.#RESERVED_SELECTED];

			const handleClick = isHeader ? this.onSelectAllRows : (e) => this.onSelectRow(e, rowIndex);
			inner.addEventListener('click', handleClick);

			selector.append(inner);
			element.append(selector);
		}

		const rowData = isHeader ? Object.values(row) : this.columns.map((a) => this.getDataFromProperty(row, a.property));
		const rowElements = rowData.map((data, i) => isHeader ? this.buildCellHeader(data, i, this.columns[i]) : this.buildCell(data, i, index, this.columns[i], row));
		rowElements.filter(Boolean).forEach(el => element.append(el));

		return element;
	}

	exportToCsv = () => {
		const replacer = (key, value) => value === null ? '' : value;
		const columns = this.columns.map(col => col.name);
		const sortedRows = this.rows.map(row => this.columns.map(col => this.getDataFromProperty(row, col.property) ? this.getDataFromProperty(row, col.property) : ' ' ));
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

	fireChangeEvent = () => {
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	};

	forceRender = () => {
		if (!this.#initialized || !this._rows || !this._columns) return;

		this.updateFooter();
		this.updateMenuManage();
		this.updateMenuFilters();
		this.updateHeader();
		this.onScroll();
	}

	getCurrentRange = () => {
		if (this.pageSize === Infinity) return { min: 0, max: this.rows.length };
		const offset = this.pageSize;
		const min = this.page * offset;
		const max = (this.page + 1) * offset;
		return { min, max };
	}

	getElementPositionRelativeToOtherElement = (elementRect, otherElementRect) => {
		const positionTop = elementRect.top - otherElementRect.top;
		const positionLeft = elementRect.left - otherElementRect.left;
		return { top: positionTop, left: positionLeft };
	}

	getDataFromProperty = (row, prop) => {
		if (typeof prop === 'function') {
			return prop(row) ?? null;
		} else if (row[prop]) {
			return row[prop];
		}
		return null;
	}

	getRowHeight = () => {
		const density = this.getAttribute('density') ?? 'compact';
		switch (density) {
			case 'compact': return 34;
			case 'comfortable': return 46;
			case 'cozy': return 70;
		}
	}

	getScrollableHeight = () => {
		const rowHeight = this.getRowHeight();
		const rowCount = this.pageSize < Infinity && this.rows.length > this.pageSize ? this.pageSize : this.rows.length;
		return rowHeight * (rowCount);
	}

	getTotalPages = () => {
		if (this.rows?.length) {
			return Math.ceil(this.rows.length / this.pageSize);
		}
		return 0;
	}

	getUniqueColumnProperty = (columns) => {
		const ids = ['id', 'itemnumber', 'guid', 'name', 'number'];
		let property = null;
		for (let i = 0; i < columns.length; i++) {
			const a = columns[i];
			for (let j = 0; j < ids.length; j++) {
				const b = ids[j];
				if (a?.name?.toLowerCase().includes(b) || (typeof a.property === 'string' && a.property.toLowerCase().includes(b))) {
					property = a.property;
					break;
				}
			}
			if (property != null) {
				break;
			}
		}
		return property;
	}

	isRowInView = (el) => {
		const rect = el.getBoundingClientRect();
		const containerRect = this.#scrollableContainer.getBoundingClientRect();
		return rect.top >= containerRect.top - 70 && rect.bottom <= containerRect.bottom + 70;
	}

	onClickOutside = (e) => {
		const checkClick = (el) => {
			const isPopupVisible = el.classList.contains('visible');
			const isClickedOutside = !el.contains(e.target);
			if (isPopupVisible && isClickedOutside) {
				el.classList.remove('visible');
			}
		};
		checkClick(this.#menu);
	}

	onKeyDown = (e) => {
		const isCtrlA = e.ctrlKey && e.key === 'a' || e.key === 'A';
		const isFocusedOn = this.shadowRoot.contains(this.shadowRoot.activeElement);
		if (isCtrlA && isFocusedOn && this.#allowSelection) {
			e.preventDefault();
			this.onSelectAllRows();
		}
	}

	onMenuCloseClick = () => {
		this.#menu.classList.remove('filter');
		this.#menu.classList.remove('manage');
		this.#menu.classList.remove('visible');
		this.#menu.style.transform = '';
	}

	onMenuFilterClick = () => {
		this.#menu.classList.remove('manage');
		this.#menu.classList.add('filter');
		this.updateMenuFilters();
		this.updateMenuPosition(this.#prevHeaderBtnRect);
	}

	onMenuManageClick = () => {
		this.#menu.classList.remove('filter');
		this.#menu.classList.add('manage');
		this.updateMenuPosition(this.#prevHeaderBtnRect);
	}

	onMenuOpenClick = (e, col) => {
		e.stopPropagation();
		this.currentColumn = col;
		this.onMenuCloseClick();
		const rect = e.target.getBoundingClientRect();
		this.#prevHeaderBtnRect = rect;
		this.#menu.classList.remove('manage');
		this.#menu.classList.remove('filter');
		this.#menu.classList.add('visible');
		this.updateMenuPosition(rect);
	}

	onResize = () => {
		const isMobile = window.screen.width <= 425;
		const rows = [...this.#header.children, ...this.#scrollContent.children];
		rows.forEach((a, i) => {
			const columns = [...a.children];
			columns.forEach((b, j) => {
				if (j == 0) {
					return;
				}
				const col = this._columns[j-1];
				let newStyle = `${col.width || '100px'}`;
				if (isMobile) {
					newStyle = `${col.width ? parseFloat(col.width) + 30 : '100'}px`;
				}
				if (b.style.width !== newStyle) {
					b.style.width = newStyle;
				}
			});
		});
	}

	onRowsUpdate = (rows) => {
		this._rows = this.rowsFilter(this.rowsSort(rows));
		this.forceRender();
	}

	onScroll = (e) => {
		const scrollTop = this.#scrollableContainer.scrollTop;
		if (e && this.#lastScrollTop === scrollTop) return;

		this.#lastScrollTop = this.#scrollableContainer.scrollTop;
		const { height } = this.#scrollableContainer.getBoundingClientRect();
		const max = Math.max(0, Math.min(this.getScrollableHeight() - height, scrollTop));
		if (this.#body.style.height !== this.getScrollableHeight()) {
			this.#body.style.height = `${this.getScrollableHeight()}px`;
		}
		this.#scrollContent.style.transform = `translateY(${max}px) translateZ(0)`;
		this.updateRows();
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
			'not_contain': (a, b) => a.toLowerCase().indexOf(b.toLowerCase()) <= -1,
			'equals': (a, b) => a.toLowerCase() === b.toLowerCase(),
			'not_equal': (a, b) => a.toLowerCase() !== b.toLowerCase(),
			'starts_with': (a, b) => a.toLowerCase().startsWith(b.toLowerCase()),
			'ends_with': (a, b) => a.toLowerCase().endsWith(b.toLowerCase()),
			'AND': (arr) => arr.every(a => a),
			'OR': (arr) => arr.some(a => a),
			'is_true': (a) => a === true || a === 'true',
			'is_false': (a) => a === false || a === 'false'
		};

		const fitleredRows = rows.filter(row => {
			const results = this.filters.map(({ column, type, operator, value }) => {
				const columnProperty = this.columns.find((a) => {
					if (typeof a.property === 'function') {
						return a.property.toString() === column;
					}
					return a.property === column;
				})?.property;
				let rowValue = this.getDataFromProperty(row, columnProperty);
				if (rowValue === null) {
					return null;
				}
				const result = operators[operator](rowValue, value);
				return result;
			});
			return results.length > 0 && results.some((result) => result != null) ? operators[this.multiFilterOperator](results) : row;
		});
		return fitleredRows;
	}

	rowsSort = (r) => {
		const rows = [...r];
		const colDetails = this.columns.map((col, i) => ({
			sort: col.sort,
			type: this.columns[i].type,
			property: this.columns[i].property,
			sortFunction: this.columns[i].sortFunction,
		})).filter(colDetail => colDetail.sort !== this.NONE && colDetail.sort !== undefined);

		const compare = (a, b) => {
			for (let i = 0; i < colDetails.length; i++) {
				const { type, property, sort, sortFunction } = colDetails[i];
				let aa = this.getDataFromProperty(a, property);
				let bb = this.getDataFromProperty(b, property);
				let result = 0;
				if (typeof sortFunction != 'function') {
					if (aa == null && bb == null) {
						continue;
					} else if (aa == null) {
						return 1;
					} else if (bb == null) {
						return -1;
					}

					if (type === 'number') {
						result = aa - bb;
					} else if (type === 'string') {
						result = aa.localeCompare(bb);
					} else if (type === 'boolean') {
						result = aa === bb ? 0 : (aa ? -1 : 1);
					} else if (type === 'date') {
						result = Date.parse(aa) - Date.parse(bb);
					}
				} else {
					result = sortFunction(a, b);
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

	setNextPage = () => {
		if (this.page + 1 < this.getTotalPages()) {
			const el = this.shadowRoot.querySelector('.table-scrollable');
			const oldScroll = el.scrollLeft;
			this.page = this.page + 1;
			el.scrollTo(oldScroll, 0);
		}
	}

	setPrevPage = () => {
		if (this.page - 1 >= 0) {
			const el = this.shadowRoot.querySelector('.table-scrollable');
			const oldScroll = el.scrollLeft;
			this.page = this.page - 1;
			el.scrollTo(oldScroll, 0);
		}
	}

	setPageSize = (e) => {
		this.pageSize = Number(e.target.value);
		this.fireChangeEvent();
	}

	sortColumn = (dir) => {
		if (this.currentColumn) {
			const property = typeof this.currentColumn.property === 'function' ? this.currentColumn.name.toLowerCase() : this.currentColumn.property;
			const headerCell = this.#header.querySelector(`.row > .cell[data-property="${property}"]`);
			const cells = this.#header.querySelectorAll('.row > .cell:not(.selectable)');

			this.#anchor = null;
			cells.forEach(a => a.className = `cell`);
			this.columns.forEach(a => a.sort = this.NONE);
			this.currentColumn.sort = dir;
			headerCell.classList.add(`sort-${dir}`);
			this.onRowsUpdate([...this._rows]);
			this.onMenuCloseClick();
			this.fireChangeEvent();
		}
	}

	resizeColumnEnd = (e, el, index) => {
		if (this.#resizingColumn !== null) {
			e.stopPropagation();
			e.preventDefault();
			if (this.#resizingColumn.classList.contains('resizing')) {
				this.#resizingColumn.className = this.#resizingColumn.className.replaceAll(' resizing', '');
			}
			this.#resizingColumn = null;
			this.#header.querySelectorAll('.resizing')?.forEach((a, i) => a.className = a.className.replaceAll(' resizing', ''));
			this.fireChangeEvent();
		}
	}

	resizeColumnMove = (e, el, index) => {
		if (this.#resizingColumn === el) {
			e.stopPropagation();
			e.preventDefault();
			const diff = e.x - this.#mouseDown;
			const type = [...el.style.width.matchAll(/([0-9\.]+)(.+)/g)]?.[0]?.[2] || 'px';
			let oldWidth = parseInt(el.style.width);
			if (type !== 'px') {
				oldWidth = el.getBoundingClientRect().width;
			}
			const newWidth = diff !== 0 ? oldWidth + diff : oldWidth;
			el.style.width = `${newWidth}px`;
			this.#mouseDown = event.x;
			if (this.columns[index].width != newWidth) {
				const updatedColumns = [...this.columns];
				updatedColumns[index].width = `${newWidth}px`;
				this.columns = updatedColumns;
			}
		}
	}

	resizeColumnStart = (e, el, index) => {
		if (e.button === 0) {
			e.stopPropagation();
			e.preventDefault();
			this.#resizingColumn = el;
			this.#mouseDown = e.x;
			if (!el.classList.contains(' resizing')) {
				el.className = el.className + ' resizing';
			}
			window.addEventListener('mousemove', (e) => this.resizeColumnMove(e, el, index));
			window.addEventListener('mouseup', (e) => this.resizeColumnEnd(e, el, index));
		} else {
			this.#resizingColumn = null;
		}
	}

	toggleSort = (column) => {
		this.currentColumn = column;
		const sortCycle = { [this.NONE]: this.DES, [this.DES]: this.ASC, [this.ASC]: this.NONE };
		const newSort = sortCycle[column.sort || 'none'];
		this.sortColumn(newSort);
	}

	updateFooter = () => {
		const selectedCount = this.selected.length;
		const totalPages = this.getTotalPages();

		this.#footerCurrentPage.innerText = (this.page + 1).toLocaleString();
		this.#footerPrevBtn.disabled = this.page <= 0;
		this.#footerNextBtn.disabled = this.page + 1 >= totalPages;

		const hidden = selectedCount === 0;
		this.#footerSelectedNumber.innerText = hidden ? '' : selectedCount.toLocaleString();
		this.#footerSelectedNumber.hidden = hidden;
		this.#footerSelectedMulti.hidden = hidden || selectedCount === 1;
		this.#footerSelectedSingle.hidden = hidden || selectedCount !== 1;

		this.#footerPageSize.value = this.pageSize;
		this.#footerTotalRows.innerHTML = `${this.rows.length.toLocaleString()} rows`;
		this.#footerTotalPages.innerText = this.getTotalPages().toLocaleString();
		const isInfinity = this.pageSize === Infinity;
		this.#footerTotalRows.style.display = isInfinity ? 'block' : 'none';
		this.#footerPageInfo.style.display = isInfinity ? 'none' : 'flex';
	}

	updateHeader = () => {
		this.#header.innerHTML = '';
		this.#header.appendChild(this.buildRow(this._columns, -1, true));

		const isAllSelected = this._rows.every(a => a[this.#RESERVED_SELECTED]);
		if (this.#allowSelection) {
			this.#header.querySelector('input').checked = isAllSelected;
		}
	}

	updateMenuFilters = () => {
		this.#filters.innerHTML = '';
		const addBtn = document.createElement('button');
		addBtn.textContent = '+ Add Filter';
		addBtn.addEventListener('click', () => {
			const filters = [...this.filters];
			const col = typeof(this.currentColumn.property) === 'function' ? this.currentColumn.property.toString() : this.currentColumn.property;
			filters.push({ column: col, type: this.currentColumn.type, operator: 'not_empty', value: '' });
			this.filters = filters;
			this.updateMenuPosition(this.#prevHeaderBtnRect);
			this.fireChangeEvent();
		});
		this.#filters.appendChild(addBtn);

		const addFilter = (property, operator, value, index) => {
			if (property === null || property === undefined) {
				console.error("Filter has undefined property.");
				return null;
			}
			const template = this.shadowRoot.querySelector('#filter-template');
			const clone = template.content.cloneNode(true);
			const container = clone.querySelector('.filter');
			let stringProperty = property;
			if (typeof property === 'function') {
				stringProperty = property.toString();
			}
			const column = this.columns.find((a) => {
				let thisProp = a.property;
				if (typeof a.property === 'function') {
					thisProp = a.property.toString();
				}
				return thisProp === stringProperty;
			});
			const filterMulti = clone.querySelector('.filter-and-or');
			const filterProperty = clone.querySelector('.filter-column');
			const filterOperator = clone.querySelector(`.filter-operator.${column.type}`);
			const filterInput = clone.querySelector(`.filter-input.${column.type}`);
			const filterRemove = clone.querySelector('.filter-remove-btn');
			const onFilterUpdate = (e) => {
				const container = e.target.closest('.filter');
				const prop = container.querySelector('.filter-column');
				const col = this.columns.find((a) => {
					if (typeof a.property === 'function') {
						return a.property.toString() === prop.value;
					}
					return a.property === prop.value;
				});
				const filter = {
					column: prop.value,
					type: col.type,
					operator: container.querySelector(`.filter-operator.${col.type}`)?.value ?? '',
					value: container.querySelector(`.filter-input.${col.type}`)?.value  ?? ''
				};
				const filters = [...this.filters];
				filters[index] = filter;
				this.page = 0;
				this.filters = filters;
				this.fireChangeEvent();
			};

			this._columns.forEach(col => {
				const option = document.createElement('option');
				option.textContent = col.name;
				if (typeof col.property === 'function') {
					option.value = col.property.toString();
				} else {
					option.value = col.property;
				}
				filterProperty.appendChild(option);
			});

			filterProperty.value = stringProperty;
			filterMulti.value = this.multiFilterOperator;
			filterOperator.value = operator;
			if (filterInput) {
				filterInput.value = value;
			}
			container.setAttribute('data-type', column.type);

			filterMulti.addEventListener('change', (e) => {
				this.multiFilterOperator = e.target.value;
				onFilterUpdate(e);
			});
			filterProperty.addEventListener('change', onFilterUpdate);
			filterOperator.addEventListener('change', onFilterUpdate);
			if (filterInput) {
				filterInput.addEventListener('change', onFilterUpdate);
			}
			filterRemove.addEventListener('click', () => {
				this.filters = this.filters.filter((a, i) => i !== index);
				this.updateMenuPosition(this.#prevHeaderBtnRect);
				this.fireChangeEvent();
			});

			this.#filters.insertBefore(clone, addBtn);
		};

		this.filters.forEach((filter, index) => {
			if (filter.column && filter.type && filter.operator) {
				addFilter(filter.column, filter.operator, filter.value, index)
			}
		});
	}

	updateMenuManage = () => {
		if (!this.columns) return;

		this.#manage.innerHTML = '';
		const disableLastInput = this.columns.filter(a => !a.hidden).length <= 1;

		this.columns.forEach((col, index) => {
			const wrapper = document.createElement('div');
			const property = typeof col.property === 'function' ? col.name.toLowerCase() : col.property;
			wrapper.innerHTML = `
				<input id='vis-${property}' type='checkbox' ${col.hidden ? '' : 'checked'} ${!col.hidden && disableLastInput ? 'disabled' : ''}>
				<label for='vis-${property}'>${col.name}</label>
			`;
			wrapper.querySelector('input').addEventListener('change', (e) => {
				const columns = [ ...this.columns ];
				columns[index].hidden = !e.target.checked;
				this.columns = columns;
				this.fireChangeEvent();
				this.forceRender();
			});
			this.#manage.appendChild(wrapper);
		});
	}

	updateMenuPosition = (rect) => {
		const { width, height } = rect;
		const tableRect = this.shadowRoot.querySelector('.table').getBoundingClientRect();
		const menuRect = this.#menu.getBoundingClientRect();
		const { left, top } = this.getElementPositionRelativeToOtherElement(rect, tableRect);

		this.#menu.style.top = `${top + height}px`;
		if ((left + width) < menuRect.width) {
			this.#menu.style.left = '0px';
			this.#menu.style.transform = '';
		} else {
			this.#menu.style.left = `${left + width}px`;
			this.#menu.style.transform = 'translateX(-100%)';
		}
	}

	updateRows = () => {
		this.shadowRoot.host.innerHTML = '';
		this.#scrollContent.innerHTML = '';

		const range = this.getCurrentRange();
		const { height } = this.#scrollableContainer.getBoundingClientRect();
		const scrollPos = this.#scrollableContainer.scrollTop;
		const rowHeight = this.getRowHeight();
		const remainder = scrollPos % rowHeight;
		const isRowViewable = (index) => {
			const rowPos = index * rowHeight;
			const inView = rowPos + rowHeight < scrollPos + height && rowPos + rowHeight > scrollPos;
			return inView;
		};
		const visibleRows = this._rows.slice(range.min, range.max).filter((row, index) => isRowViewable(index));
		const visibleRowIds = visibleRows.map((row, index) => `row-${range.min + index}`);
		const currentRowIds = Array.from(this.#scrollContent.children).map(el => el.id);
		const rowsToRemove = currentRowIds.filter(id => !visibleRowIds.includes(id));

		rowsToRemove.forEach(id => this.shadowRoot.getElementById(id)?.remove());
		visibleRows.forEach((row, index) => {
			if (!currentRowIds.includes(`row-${range.min + index}`)) {
				const el = this.buildRow(row, range.min + index, false);
				el.style.transform = `translateY(-${remainder}px) translateZ(0)`;
				this.#scrollContent.appendChild(el);
			}
		});
	}
}

customElements.define('ac-table', Table);
