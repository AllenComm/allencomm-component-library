export default class TextField extends HTMLElement {
	static observedAttributes = ['value'];

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
				:host(:focus-visible) input {
					border-radius: 3px;
					outline: 2px solid #000;
					outline-offset: 2px;
					z-index: 1;
				}
				label {
					align-items: flex-start;
					cursor: pointer;
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					width: 100%;
				}
				input {
					padding: 5px;
				}
			</style>
			<label tabindex='-1'>
				<slot></slot>
				<input tabindex='-1' type='text'/>
			</label>
		`;
	}

	get value() { return this.#input.value; }

	get #input() { return this.shadowRoot.querySelector('input'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.#input.value = parseFloat(newVal);
			this.setAttribute('aria-valuenow', newVal);
		}
	}

	connectedCallback() {
		const placeholder = this.getAttribute('placeholder') || null;
		if (placeholder) {
			this.#input.setAttribute('placeholder', placeholder);
		}
		this.#input.addEventListener('input', this.handleChange);
		this.setAttribute('aria-valuenow', this.value);
		this.setAttribute('tabindex', 0);
		this.addEventListener('keydown', this.handleKeydown);
	}

	handleChange = () => {
		this.setAttribute('aria-valuenow', this.value);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}

	handleKeydown = (e) => {
		const val = this.value;
		console.log(e);
	}
}

customElements.define('ac-text-field', TextField);
