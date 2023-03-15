export default class Number extends HTMLElement {
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
					align-items: center;
					display: flex;
					flex-wrap: wrap;
					gap: 0 10px;
					width: 100%;
				}
			</style>
			<label tabindex='-1'>
				<input type='number'></input>
				<slot></slot>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get value() { return parseFloat(this.#input.value); }

	get #input() { return this.shadowRoot.querySelector('input'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.#input.value = parseFloat(newVal);
			this.setAttribute('aria-valuenow', newVal);
		}
	}

	connectedCallback() {
		const max = this.getAttribute('max') || null;
		const maxlength = this.getAttribute('maxlength') || null;
		const min = this.getAttribute('min') || null;
		const minlength = this.getAttribute('minlength') || null;
		const placeholder = this.getAttribute('placeholder') || '';
		const size = this.getAttribute('size') || null;
		const step = this.getAttribute('step') || 1;
		const value = this.getAttribute('value') || null;
		this.#input.addEventListener('change', this.handleChange);
		this.#input.setAttribute('max', max);
		this.#input.setAttribute('maxlength', maxlength);
		this.#input.setAttribute('min', min);
		this.#input.setAttribute('minlength', minlength);
		this.#input.setAttribute('placeholder', placeholder);
		this.#input.setAttribute('size', size);
		this.#input.setAttribute('step', step);
		this.#input.value = parseFloat(value);
		this.setAttribute('aria-valuemax', max);
		this.setAttribute('aria-valuemin', min);
		this.setAttribute('aria-valuenow', value);
		this.addEventListener('keydown', this.handleKeydown);
	}
	
	handleChange = () => {
		this.setAttribute('aria-valuenow', this.value);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}

	handleKeydown = (e) => {
		const val = this.value;
		const step = parseFloat(this.#input.getAttribute('step'));
		switch (e.code) {
			case 'ArrowUp':
			case 'ArrowRight':
				e.preventDefault();
				e.stopPropagation();
				if ((val + step) <= parseFloat(this.#input.getAttribute('max'))) {
					this.#input.value = val + step;
					this.handleChange(e);
				}
				break;
			case 'ArrowDown':
			case 'ArrowLeft':
				e.preventDefault();
				e.stopPropagation();
				if ((val - step) >= parseFloat(this.#input.getAttribute('min'))) {
					this.#input.value = val - step;
					this.handleChange(e);
				}
				break;
		}
	}
}

customElements.define('ac-number', Number);
