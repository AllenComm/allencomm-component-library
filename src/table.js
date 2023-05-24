export default class Table extends HTMLElement {
	static observedAttributes = ['columnDefs', 'data'];

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
				.row[hidden='true'] {
					display: none;
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
		this._data = null;
		this._page = 0;
		this._pageSize = 100;
		this._rows = [];
		this._selected = null;
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

	get data() { return this._data; }
	set data(newVal) {
		try {
			this._data = JSON.parse(newVal);
			if (this._data?.length > 0) {
				if (this.#body.children.length > 0) {
					[...this.#body.children].forEach((a) => a.remove());
				}
				this.data.forEach((a, i) => {
					const el = this.buildRow(a, i);
					this.#body.appendChild(el);
					this.rows.push(el);
				});
				this.updateRender();
			}
		} catch(err) {
			this._data = [];
			console.error(err);
		}

	}

	get #footer() { return this.shadowRoot.querySelector('.footer'); }

	get #header() { return this.shadowRoot.querySelector('.header'); }

	get page() { return this._page; }
	set page(newVal) {
		this._page = newVal;
		this.updateRender();
	}

	get pageSize() { return this._pageSize; }
	set pageSize(newVal) {
		this._pageSize = newVal;
		this.updateRender();
	}

	get rows() { return this._rows; }
	set rows(newArr) { this._rows = newArr; }

	get selected() { return this._selected; }
	set selected(newVal) { this._selected = newVal; }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'columnDefs') {
			this.columnDefs = newVal;
		} else if (attr === 'data' && this.columnDefs?.length > 0) {
			this.data = newVal;
		}
	}

	connectedCallback() {
		this.columnDefs = this.getAttribute('columnDefs');
		// this.data = this.getAttribute('data');
		this.data = this.generateFakeData();
	}

	buildCell = (data, index) => {
		const element = document.createElement('div');
		const content = document.createTextNode(`${data}`);
		element.classList.add('cell');
		element.classList.add(this.getColumnType(index));
		element.style.flex = this.getColumnSize(index);
		element.setAttribute('id', `cell-${index}`);
		element.appendChild(content);
		return element;
	}

	buildCellHeader = (data, index) => {
		const element = document.createElement('div');
		const content = document.createTextNode(`${data.name}`);
		element.classList.add('cell');
		element.style.flex = data.size;
		element.setAttribute('id', `cell-${index}`);
		element.appendChild(content);
		return element;
	}

	buildRow = (data, index) => {
		const arr = Object.values(data);
		const element = document.createElement('div');
		element.classList.add('row');
		element.setAttribute('id', `row-${index}`);
		arr.map((a, i) => element.appendChild(this.buildCell(a, i)) );
		return element;
	}

	buildRowHeader = (data) => {
		const element = document.createElement('div');
		element.classList.add('row');
		element.setAttribute('id', `row-header`);
		data.map((a, i) => element.appendChild(this.buildCellHeader(a, i)));
		return element;
	}

	getColumnSize = (index) => this.columnDefs[index].size || '1';
	getColumnType = (index) => this.columnDefs[index].type || 'string';
	
	getCurrentRange = () => {
		const offset = this.pageSize;
		const min = (this.page) * offset;
		const max = (this.page + 1) * offset;
		console.log(min, max);
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
				a.removeAttribute('hidden');
			} else if (!a.hasAttribute('hidden')) {
				a.setAttribute('hidden', true);
			}
		});
	}

	generateFakeData = () => {
		const fake = [];
		for (let i = 0; i < 10000; i++) {
			const newObj = { id: i, name: 'Jon', company: 'based.net' };
			fake.push(newObj);
		}
		return JSON.stringify(fake);
	}
}

customElements.define('ac-table', Table);
