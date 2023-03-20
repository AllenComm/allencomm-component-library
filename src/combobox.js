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
	get #listbox() { return this._listbox; }
	get #options() { return this._options; }

	set #expanded(newVal) { this._expanded = newVal; }
	set #listbox(elem) { this._listbox = elem; }
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
				this.#listbox = a;
				this.#options.forEach((b) => a.appendChild(b));
			} else if (a.nodeName.toLowerCase() === 'ac-text-field') {
				a.addEventListener('blur', this.handleFocusOut);
				a.addEventListener('click', this.handleFocusIn);
				a.addEventListener('focus', this.handleFocusIn);
				a.addEventListener('keydown', this.handleFocusIn);
			}
		});
		this.setAttribute('expanded', false);
	}

	handleFocusIn = (e) => {
		if ((e.code && e.code.toLowerCase() !== 'tab') || !e.code) {
			if (!this.#expanded) {
				this.#expanded = true;
				this.setAttribute('expanded', true);
			}
		}
	}

	handleFocusOut = (e) => {
		this.#expanded = false;
		this.setAttribute('expanded', false);
	}
}

customElements.define('ac-combobox', Combobox);
