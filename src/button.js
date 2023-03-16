export default class Button extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: inline-block;
					outline: none;
				}
				button {
					align-items: flex-start;
					cursor: pointer;
					display: flex;
				}
			</style>
			<button>
				<slot></slot>
			</button>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get value() { return this.#button.value; }

	get #button() { return this.shadowRoot.querySelector('button'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.#button.value = parseFloat(newVal);
			this.setAttribute('aria-valuenow', newVal);
		}
	}

	connectedCallback() {
		const value = this.getAttribute('value');
		if (value != null) this.#button.value = value;
		this.#button.addEventListener('click', this.handleChange);
		this.setAttribute('aria-valuenow', value);
	}

	handleChange = () => {
		this.setAttribute('aria-valuenow', this.value);
		this.dispatchEvent(new Event('click', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-button', Button);
