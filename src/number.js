export default class Number extends HTMLElement {
	static observedAttributes = ['disabled', 'value'];

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
					outline: none;
					width: 100%;
				}
				.inner {
					display: flex;
					flex: 1;
					justify-content: flex-end;
				}
				input {
					border-radius: 3px;
					border-width: 1px;
					padding: 5px;
					width: 100%;
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
				<slot></slot>
				<div class='inner'>
					<input type='number'></input>
				</div>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
	}

	get disabled() { return this._disabled; }
	set disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#input.setAttribute('disabled', bool);
			this.#input.removeEventListener('change', this.handleChange);
			this.removeEventListener('keydown', this.handleKeydown);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
		} else {
			this.#input.removeAttribute('disabled');
			this.#input.addEventListener('change', this.handleChange);
			this.addEventListener('keydown', this.handleKeydown);
			this.removeAttribute('aria-disabled');
			this.removeAttribute('aria-hidden');
		}
	}

	get #input() { return this.shadowRoot.querySelector('input'); }

	get value() { return parseFloat(this.#input.value); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.#input.value = parseFloat(newVal);
			this.setAttribute('aria-valueNow', newVal);
		} else if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.disabled = bool;
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
			this.#input.setAttribute('max', max);
			this.setAttribute('aria-valueMax', max);
		}
		if (maxlength) this.#input.setAttribute('maxlength', maxlength);
		if (min != null) {
			this.#input.setAttribute('min', min);
			this.setAttribute('aria-valueMin', min);
		}
		if (minlength) this.#input.setAttribute('minlength', minlength);
		if (placeholder) this.#input.setAttribute('placeholder', placeholder);
		if (size) this.#input.setAttribute('size', size);
		if (step) this.#input.setAttribute('step', step);
		if (value != null) {
			this.#input.value = parseFloat(value);
			this.setAttribute('aria-valueNow', value);
		}
		if (this.getAttribute('disabled') === 'true') {
			this.disabled = true;
		} else {
			this.disabled = false;
		}
	}

	handleChange = () => {
		if (this.value != null) this.setAttribute('aria-valueNow', this.value);
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
