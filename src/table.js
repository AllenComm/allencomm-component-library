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
				.header:not(:empty) {
					border-bottom: 1px solid black;
				}
				.row {
					display: flex;
				}
				.row + .row {
					border-top: 1px solid black;
				}
				.table {
					border-bottom: 1px solid black;
					border-top: 1px solid black;
				}
			</style>
			<div class='table'>
				<div class='header'></div>
				<div class='body'></div>
				<div class='footer'></div>
			</div>
		`;
		this._columnDefs = null;
		this._initialized = false;
		this._page = 0;
		this._pageSize = 100;
		this._rows = null;
		this._selected = null;
		this._TOTAL = 100000;
	}

	get #body() { return this.shadowRoot.querySelector('.body'); }

	get columnDefs() { return this._columnDefs; }
	set columnDefs(newVal) {
		try {
			this._columnDefs = JSON.parse(newVal);
			if (this._columnDefs?.length > 0) {
				const row = this.buildRowHeader(this._columnDefs);
				this.#header.appendChild(row);
			}
		} catch(err) {
			this._columnDefs = [];
			console.error(err);
		}
	}

	get #footer() { return this.shadowRoot.querySelector('.footer'); }

	get #header() { return this.shadowRoot.querySelector('.header'); }

	get #initialized() { return this._initialized; }
	set #initialized(newVal) { this._initialized = newVal; }

	get page() { return this._page; }
	set page(newVal) {
		if (newVal != this._page) {
			this._page = newVal;
			this.updateRender();
		}
	}

	get pageSize() { return this._pageSize; }
	set pageSize(newVal) {
		if (newVal != this._pageSize) {
			this._pageSize = newVal;
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
		this.columnDefs = this.getAttribute('column-defs');
		const rows = this.getAttribute('rows');
		if (rows != null) {
			this.rows = rows;
		} else {
			this.rows = this.generateFakeData();
		}
		this.#initialized = true;
	}

	buildCell = (rows, index) => {
		const element = document.createElement('div');
		const content = document.createTextNode(`${rows}`);
		element.classList.add('cell');
		element.classList.add(this.getColumnType(index));
		element.style.flex = this.getColumnSize(index);
		element.setAttribute('id', `cell-${index}`);
		element.appendChild(content);
		return element;
	}

	buildCellHeader = (rows, index) => {
		const element = document.createElement('div');
		const content = document.createTextNode(`${rows.name}`);
		element.classList.add('cell');
		element.style.flex = rows.size;
		element.setAttribute('id', `cell-${index}`);
		element.appendChild(content);
		return element;
	}

	buildRow = (rows, index) => {
		const arr = Object.values(rows);
		const element = document.createElement('div');
		element.classList.add('row');
		element.setAttribute('id', `row-${index}`);

		const selectableCell = document.createElement('span');
		selectableCell.classList.add('cell');
		selectableCell.classList.add('selectable');
		selectableCell.style.flex = '0 0 20px';
		element.appendChild(selectableCell);

		arr.map((a, i) => element.appendChild(this.buildCell(a, i)) );
		return element;
	}

	buildRowHeader = (rows) => {
		const element = document.createElement('div');
		element.classList.add('row');
		element.setAttribute('id', `row-header`);

		const selectableCell = document.createElement('span');
		selectableCell.classList.add('cell');
		selectableCell.classList.add('selectable');
		selectableCell.style.flex = '0 0 20px';
		element.appendChild(selectableCell);

		rows.map((a, i) => element.appendChild(this.buildCellHeader(a, i)));
		return element;
	}

	getColumnSize = (index) => this.columnDefs[index].size || '1';
	getColumnType = (index) => this.columnDefs[index].type || 'string';
	
	getCurrentRange = () => {
		const offset = this.pageSize;
		const min = (this.page) * offset;
		const max = (this.page + 1) * offset;
		return { min, max };
	}

	handleChange = (e) => {
		e.stopPropagation();
		// const target = e.target;
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}

	updateRender = () => {
		this.rows.forEach((a, i) => {
			if (i >= this.getCurrentRange().min && i < this.getCurrentRange().max) {
				this.#body.appendChild(this.buildRow(a, i));
			} else {
				this.shadowRoot.getElementById(`row-${i}`)?.remove();
			}
		});
	}

	generateFakeData = () => {
		const fake = [];
		for (let i = 0; i < this._TOTAL; i++) {
			const newObj = { id: i, name: 'Jon', company: 'based.net' };
			fake.push(newObj);
		}
		return JSON.stringify(fake);
	}
}

customElements.define('ac-table', Table);
