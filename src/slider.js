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
			this.setAttribute('aria-valuenow', newVal);
		}
	}

	connectedCallback() {
		const max = this.getAttribute('max') || 10;
		const min = this.getAttribute('min') || 0;
		const step = this.getAttribute('step') || 1;
		const value = this.getAttribute('value') || 0;
		this.#input.addEventListener('input', this.handleChange);
		this.#input.setAttribute('max', max);
		this.#input.setAttribute('min', min);
		this.#input.setAttribute('step', step);
		this.#input.value = parseFloat(value);
		this.#output.innerText = parseFloat(this.#input.value);
		this.setAttribute('aria-orientation', 'horizontal');
		this.setAttribute('aria-valuemax', max);
		this.setAttribute('aria-valuemin', min);
		this.setAttribute('aria-valuenow', value);
		this.setAttribute('tabindex', 0);
		this.addEventListener('keydown', this.handleKeydown);
	}
	
	handleChange = () => {
		this.#output.innerText = parseFloat(this.#input.value);
		this.setAttribute('aria-valuenow', parseFloat(this.#input.value));
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));			
	}

	handleKeydown = (e) => {
		const val = parseFloat(this.#input.value);
		const step = parseFloat(this.#input.getAttribute('step'));
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
