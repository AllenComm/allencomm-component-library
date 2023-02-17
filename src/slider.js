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
			</style>
			<div class='ac-slider'>
				<label></label>
				<input type='range'></input>
				<output></output>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get label() {
		return this.shadowRoot.querySelector('label');
	}

	get input() {
		return this.shadowRoot.querySelector('input');
	}

	get value() {
		return parseInt(this.shadowRoot.querySelector('input').value);
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		console.log('attribute changed: %s\nold: %s\nnew: %s', attr, oldVal, newVal);
	}

	connectedCallback() {
		const label = this.getAttribute('label') || '';
		const min = this.getAttribute('min') || 0;
		const max = this.getAttribute('max') || 10;
		const step = this.getAttribute('step') || 1;
		const value = this.getAttribute('value') || '';
		// input: name, min, max, step, value
		// output: for; output.innerText: value
		console.log({ label, min, max, step, value });
		this.input.addEventListener('change', this.handleChange);
		this.label.setAttribute('for', label);
		this.label.innerText = label;
	}
	
	handleChange = (e) => {
		this.dispatchEvent(new Event('change'));
	}
}

customElements.define('ac-slider', Slider);
