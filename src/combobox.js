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
				}
			</style>
			<ac-text-field></ac-text-field>
			<ac-listbox></ac-listbox>
		`;

		this._options = [];
	}

	get #options() { return this._options; }

	set #options(arr) { this._options = arr; }
	
	connectedCallback() {
		this.childNodes.forEach((a) => {
			if (a.nodeName.toLowerCase() === 'ac-option') {
				this.#options.push(a);
			}
		});
		this.shadowRoot.childNodes.forEach((a) => {
			if (a.nodeName.toLowerCase() === 'ac-listbox') {
				this.#options.forEach((b) => a.appendChild(b));
			}
		});
	}
}

customElements.define('ac-combobox', Combobox);
