export default class Slider extends HTMLElement {
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
				input {
					cursor: pointer;
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
				<input tabindex='-1' type='range'></input>
				<output></output>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get value() { return this.#input.value; }

	get #input() { return this.shadowRoot.querySelector('input'); }
	get #output() { return this.shadowRoot.querySelector('output'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.#input.value = parseFloat(newVal);
			this.#output.innerText = newVal;
			this.setAttribute('aria-valueNow', newVal);
		}
	}

	connectedCallback() {
		const max = this.getAttribute('max');
		const min = this.getAttribute('min');
		const step = this.getAttribute('step');
		const value = this.getAttribute('value');
		this.#input.setAttribute('aria-hidden', true);
		if (max != null) {
			this.#input.setAttribute('max', max);
			this.setAttribute('aria-valueMax', max);
		}
		if (min != null) {
			this.#input.setAttribute('min', min);
			this.setAttribute('aria-valueMin', min);
		}
		if (step) this.#input.setAttribute('step', step);
		if (value != null) {
			this.#input.value = parseFloat(value);
			this.setAttribute('aria-valueNow', value);
		}
		this.#input.addEventListener('input', this.handleChange);
		this.#output.innerText = value;
		this.setAttribute('aria-orientation', 'horizontal');
		this.setAttribute('tabindex', 0);
		this.addEventListener('keydown', this.handleKeydown);
	}

	handleChange = () => {
		this.#output.innerText = this.value;
		this.setAttribute('aria-valueNow', parseFloat(this.value));
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
				if ((val + step) <= parseFloat(this.#input.getAttribute('max'))) {
					this.#input.value = val + step;
					this.handleChange();
				}
				break;
			case 'ArrowDown':
			case 'ArrowLeft':
				e.preventDefault();
				e.stopPropagation();
				if ((val - step) >= parseFloat(this.#input.getAttribute('min'))) {
					this.#input.value = val - step;
					this.handleChange();
				}
				break;
		}
	}
}

customElements.define('ac-slider', Slider);
