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
	}

	get #allowSelection() { return this._allowSelection; }
	set #allowSelection(newVal) { this._allowSelection = newVal; }

	get #anchor() { return this._anchor; }
	set #anchor(newVal) { this._anchor = newVal; }

	get #body() { return this.shadowRoot.querySelector('.body'); }

	get columns() { return this._columns; }
	set columns(newVal) {
		try {
			this._columns = JSON.parse(newVal);
			if (this._columns?.length > 0) {
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
				case 'columns':
					this.columns = newVal;
					break;
				case 'page':
					this.page = newVal;
					break;
				case 'page-size':
					this.pageSize = newVal;
					break;
				case 'rows':
					if (this.columns?.length > 0) {
						this.rows = JSON.parse(newVal);
					}
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
		this.columns = this.getAttribute('columns');
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
		if (!this.#initialized) {
			return;
		}

		this.updateTotalPages();
		this.updateFooter();
		const range = this.getCurrentRange();
		this.rows.forEach((a, i) => {
			this.shadowRoot.getElementById(`row-${i}`)?.remove();
			if (i >= range.min && i < range.max) {
				const el = this.buildRow(a, i, false);
				this.updateElement(el);
				this.#body.appendChild(el);
			}
		});
	}

	getColumnSize = (index) => this.columns[index].size || '1';
	getColumnType = (index) => this.columns[index].type || 'string';

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
			console.log('shiftKey');
			// TODO Selecting self + ascending doesn't seem to deselect all other
			// items
			let anchor = -1;
			if (this.#anchor == null) {
				anchor = this.selected[this.selected.length - 1];
				this.#anchor = anchor;
			} else {
				anchor = this.#anchor;
			}

			const ascending = current < anchor;
			let furthest = this.#furthest;
			if (this.#furthest == null || (ascending && current < furthest) || (!ascending && current > furthest)) {
				furthest = current;
				this.#furthest = current;
			}

			if (!isNaN(current) && !isNaN(anchor) && !isNaN(furthest)) {
				console.log('ascending', ascending);
				console.log('current', current);
				console.log('anchor', anchor);
				console.log('furthest', furthest);
				this.rows.forEach((a, i) => {
					const inCurrentRange = (ascending && i <= anchor && i >= current) || (!ascending && i >= anchor && i <= current);
					const inFurthestRange = (ascending && i <= anchor && i >= furthest) || (!ascending && i >= anchor && i <= furthest);
					if (inCurrentRange) {
						if (this.selected.indexOf(i) == -1) {
							this.selected.push(i);
							this.updateFooter();
						}
					} else if (inFurthestRange && this.selected.indexOf(i) != -1) {
						this.selected.splice(this.selected.indexOf(i), 1);
						this.updateFooter();
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
				this.updateFooter();
				this.#anchor = current;
			} else if (this.selected.indexOf(current) > -1) {
				this.selected.splice(this.selected.indexOf(current), 1);
				this.updateFooter();
				this.#anchor = null;
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
		if (parseInt(this.#footerCurrentPage.innerText) != this.page + 1) {
			this.#footerCurrentPage.innerText = this.page + 1;
		}
		if (this.page > 0 && this.#footerPrevBtn.hasAttribute('disabled')) {
			this.#footerPrevBtn.removeAttribute('disabled');
		} else {
			this.#footerPrevBtn.setAttribute('disabled', true);
		}
		if (this.page + 1 >= this.getTotalPages() && !this.#footerNextBtn.hasAttribute('disabled')) {
			this.#footerNextBtn.setAttribute('disabled', true);
		} else {
			this.#footerNextBtn.removeAttribute('disabled');
		}
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
