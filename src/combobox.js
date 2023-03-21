export default class Combobox extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					border-radius: 3px;
					display: block;
					position: relative;
				}
				:host([expanded='true']) ac-listbox {
					display: block;
				}
				ac-listbox {
					position: absolute;
				}
				ac-listbox {
					display: none;
				}
			</style>
			<ac-text-field></ac-text-field>
			<ac-listbox></ac-listbox>
		`;

		this._expanded = false;
		this._listbox = null;
		this._options = [];
		this._selected = -1;
	}

	get selected() { return this._selected; }

	get #expanded() { return this._expanded; }
	get #listbox() { return this.shadowRoot.querySelector('ac-listbox'); }
	get #options() { return this._options; }
	get #textfield() { return this.shadowRoot.querySelector('ac-text-field'); }

	set #expanded(newVal) {
		this._expanded = newVal;
		this.setAttribute('expanded', newVal);
	}
	set #options(arr) { this._options = arr; }
	set #selected(newVal) { this._selected = newVal; }

	connectedCallback() {
		this.childNodes.forEach((a) => {
			if (a.nodeName.toLowerCase() === 'ac-option') {
				this.#options.push(a);
			}
		});
		this.shadowRoot.childNodes.forEach((a) => {
			if (a.nodeName.toLowerCase() === 'ac-listbox') {
				a.addEventListener('change', this.handleSelected);
				a.addEventListener('cancel', this.handleFocusReset);
				this.#options.forEach((b) => a.appendChild(b));
			} else if (a.nodeName.toLowerCase() === 'ac-text-field') {
				a.addEventListener('click', this.handleFocusIn);
				a.addEventListener('focus', this.handleFocusIn);
				a.addEventListener('input', this.handleSearch);
			}
		});
		this.addEventListener('blur', this.handleFocusOut);
		this.addEventListener('keydown', this.handleKeydown);
		this.#expanded = false;
	}

	handleFocusIn = (e) => {
		if ((e.code && e.code.toLowerCase() !== 'tab') || !e.code) {
			if (!this.#expanded) {
				this.#expanded = true;
			}
		}
	}

	handleFocusOut = () => {
		this.#expanded = false;
	}

	handleFocusReset = (e) => {
		this.#textfield.input.focus();
		this.handleFocusOut();
	}

	handleKeydown = (e) => {
		if (e.target.nodeName.toLowerCase() === 'ac-combobox' && e.code === 'ArrowDown') {
			if (this.selected > -1) {
				this.#options[this.selected].focus();
			} else {
				this.#options[0].focus();
			}

			if (!this.#expanded) {
				this.#expanded = true;
			}
		}
	}

	handleSelected = (e) => {
		this.handleFocusOut();
		this.#selected = e.target.selected;
		this.#textfield.input.value = this.#options[this.selected].value;
		this.#textfield.input.focus();
		this.#expanded = false;
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-combobox', Combobox);
