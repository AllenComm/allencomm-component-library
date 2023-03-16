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
			this.#input.ariaValueNow = newVal;
		}
	}

	connectedCallback() {
		const max = this.getAttribute('max');
		const maxlength = this.getAttribute('maxlength');
		const min = this.getAttribute('min');
		const minlength = this.getAttribute('minlength');
		const placeholder = this.getAttribute('placeholder');
		const size = this.getAttribute('size');
		const step = this.getAttribute('step');
		const value = this.getAttribute('value');
		if (max != null) {
			this.#input.max = max;
			this.#input.ariaValueMax = max;
		}
		if (maxlength) this.#input.maxlength = maxlength;
		if (min != null) {
			this.#input.min = min;
			this.#input.ariaValueMin = min;
		}
		if (minlength) this.#input.minlength = minlength;
		if (placeholder) this.#input.placeholder = placeholder;
		if (size) this.#input.size = size;
		if (step) this.#input.step = step;
		if (value != null) {
			this.#input.value = parseFloat(value);
			this.#input.ariaValueNow = value;
		}
		this.#input.addEventListener('change', this.handleChange);
		this.addEventListener('keydown', this.handleKeydown);
	}
	
	handleChange = () => {
		if (this.value != null) this.#input.ariaValueNow = this.value;
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}

	handleKeydown = (e) => {
		let val = 0;
		if (!isNaN(parseFloat(this.value))) {
			val = parseFloat(this.value);
		} else if (!isNaN(parseFloat(this.#input.min)) && parseFloat(this.#input.min) > 0) {
			val = parseFloat(this.#input.min);
		}
		const step = isNaN(parseFloat(this.#input.step)) ? 1 : parseFloat(this.#input.step);
		switch (e.code) {
			case 'ArrowUp':
			case 'ArrowRight':
				e.preventDefault();
				e.stopPropagation();
				const max = isNaN(parseFloat(this.#input.max)) ? null : parseFloat(this.#input.max);
				if ((max != null && (val + step) <= max) || max == null) {
					this.#input.value = val + step;
					this.handleChange(e);
				}
				break;
			case 'ArrowDown':
			case 'ArrowLeft':
				e.preventDefault();
				e.stopPropagation();
				const min = isNaN(parseFloat(this.#input.min)) ? null : parseFloat(this.#input.min);
				if ((min != null && (val - step) >= min) || min == null) {
					this.#input.value = val - step;
					this.handleChange(e);
				} else if (val === 0 && this.value !== 0) {
					this.#input.value = 0;
					this.handleChange(e);
				}
				break;
		}
	}
}

customElements.define('ac-number', Number);
