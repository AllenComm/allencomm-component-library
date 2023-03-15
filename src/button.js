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
					outline: none;
					width: 100%;
				}
				button {
					cursor: pointer;
				}
				label {
					align-items: flex-start;
					cursor: pointer;
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					width: 100%;
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
		const value = this.getAttribute('value') || null;
		this.#button.value = value;
		this.#button.addEventListener('click', this.handleChange);
		this.setAttribute('aria-valuenow', value);
	}

	handleChange = () => {
		this.setAttribute('aria-valuenow', this.value);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-button', Button);
