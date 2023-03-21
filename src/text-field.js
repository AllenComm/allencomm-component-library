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
				input {
					border-radius: 3px;
					border-width: 1px;
					padding: 5px;
				}
				input:focus-visible {
					border-color: #000;
					border-style: solid;
					outline: 1px solid #000;
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
			</style>
			<label tabindex='-1'>
				<slot></slot>
				<input type='text'/>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get value() { return this.input.value; }
	get input() { return this.shadowRoot.querySelector('input'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.input.value = newVal;
			this.setAttribute('aria-valueNow', newVal);
		}
	}

	connectedCallback() {
		const maxlength = this.getAttribute('maxlength');
		const minlength = this.getAttribute('minlength');
		const placeholder = this.getAttribute('placeholder');
		const size = this.getAttribute('size');
		const value = this.getAttribute('value');
		if (maxlength) this.input.setAttribute('maxlength', maxlength);
		if (minlength) this.input.setAttribute('minlength', minlength);
		if (placeholder) this.input.setAttribute('placeholder', placeholder);
		if (size) this.input.setAttribute('size', size);
		if (value != null) {
			this.input.value = value;
			this.setAttribute('aria-valueNow', value);
		}
		this.input.addEventListener('input', this.handleChange);
	}

	handleChange = () => {
		this.setAttribute('aria-valueNow', this.value);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-text-field', TextField);
