export default class Slider extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				div.ac-slider {
					align-items: center;
					display: flex;
					gap: 10px;
					width: 100%;
				}
				input {
					cursor: pointer;
				}
			</style>
			<div class='ac-slider'>
				<label></label>
				<input type='range'></input>
				<output></output>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	static get observedAttributes() {
		return ['value'];
	}

	get input() {
		return this.shadowRoot.querySelector('input');
	}

	get label() {
		return this.shadowRoot.querySelector('label');
	}

	get output() {
		return this.shadowRoot.querySelector('output');
	}

	get value() {
		return parseInt(this.shadowRoot.querySelector('input').value);
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.dispatchEvent(new Event('change', { 'bubbles': true }));
			this.updateValue(newVal);
		}
	}

	connectedCallback() {
		const label = this.getAttribute('label') || '';
		const max = this.getAttribute('max') || 10;
		const min = this.getAttribute('min') || 0;
		const step = this.getAttribute('step') || 1;
		const value = this.getAttribute('value') || 0;
		this.input.addEventListener('change', this.handleChange);
		this.input.setAttribute('max', max);
		this.input.setAttribute('min', min);
		this.input.setAttribute('step', step);
		this.label.setAttribute('for', label);
		this.label.innerText = label;
		this.output.setAttribute('for', label);
		this.updateValue(value);
	}
	
	handleChange = (e) => {
		this.dispatchEvent(new Event('change', { 'bubbles': true }));
		this.updateValue(e.target.value);
	}

	updateValue = (newVal) => {
		this.input.setAttribute('value', newVal);
		this.input.value = parseInt(newVal);
		this.output.innerText = newVal;
	}
}

customElements.define('ac-slider', Slider);
