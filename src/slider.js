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
			<label>
				<slot></slot>
				<input type='range'></input>
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
	}
	
	handleChange = () => {
		this.output.innerText = this.value;
		this.setAttribute('value', this.value);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
	}
}

customElements.define('ac-slider', Slider);
