export default class Number extends HTMLElement {
	static observedAttributes = ['value'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
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
			<label><input type='number'></input></label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get input() { return this.shadowRoot.querySelector('input'); }
	get label() { return this.shadowRoot.querySelector('label'); }
	get value() { return parseFloat(this.input.value); }

	set value(val) {
		this.input.setAttribute('value', val);
		this.input.value = parseFloat(val);
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.value = newVal;
			this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
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
			Array.from(this.childNodes).map((a) => this.label.insertBefore(a, this.label.children[0]));
		}
	}
	
	handleChange = (e) => {
		this.value = e.target.value;
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
	}
}

customElements.define('ac-number', Number);
