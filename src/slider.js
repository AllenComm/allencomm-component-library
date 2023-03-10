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
					width: 100%;
				}
				:host(:focus-visible) {
					outline: none;
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
					gap: 10px;
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

	get input() { return this.shadowRoot.querySelector('input'); }
	get output() { return this.shadowRoot.querySelector('output'); }
	get value() { return parseFloat(this.input.value); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.input.value = parseFloat(newVal);
			this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
		}
	}

	connectedCallback() {
		const max = this.getAttribute('max') || 10;
		const min = this.getAttribute('min') || 0;
		const step = this.getAttribute('step') || 1;
		const value = this.getAttribute('value') || 0;
		this.input.addEventListener('input', this.handleChange);
		this.input.setAttribute('max', max);
		this.input.setAttribute('min', min);
		this.input.setAttribute('step', step);
		this.input.value = parseFloat(value);
		this.output.innerText = this.value;
		this.setAttribute('aria-orientation', 'horizontal');
		this.setAttribute('aria-valuemax', max);
		this.setAttribute('aria-valuemin', min);
		this.setAttribute('aria-valuenow', value);
		this.setAttribute('tabindex', 0);
	}
	
	handleChange = () => {
		this.output.innerText = this.value;
		this.setAttribute('aria-valuenow', this.value);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
	}
}

customElements.define('ac-slider', Slider);
