export default class Slider extends HTMLElement {
	static observedAttributes = ['value'];

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

	get input() { return this.shadowRoot.querySelector('input'); }
	get label() { return this.shadowRoot.querySelector('label'); }
	get output() { return this.shadowRoot.querySelector('output'); }
	get value() { return parseFloat(this.input.value); }

	set value(val) {
		this.input.setAttribute('value', val);
		this.input.value = parseFloat(val);
		this.output.innerText = val;
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.dispatchEvent(new Event('change', { 'bubbles': true }));
			this.value = newVal;
		}
	}

	connectedCallback() {
		const max = this.getAttribute('max') || 10;
		const min = this.getAttribute('min') || 0;
		const step = this.getAttribute('step') || 1;
		const value = this.getAttribute('value') || 0;
		this.input.addEventListener('change', this.handleChange);
		this.input.setAttribute('max', max);
		this.input.setAttribute('min', min);
		this.input.setAttribute('step', step);
		this.value = value;
		if (this.childNodes.length > 0) {
			Array.from(this.childNodes).map((a) => this.label.appendChild(a));
		}
	}
	
	handleChange = (e) => {
		this.dispatchEvent(new Event('change', { 'bubbles': true }));
		this.value = e.target.value;
	}
}

customElements.define('ac-slider', Slider);
