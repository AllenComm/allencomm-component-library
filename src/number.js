export default class Number extends HTMLElement {
	static observedAttributes = ['checked'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				div.ac-number {
					align-items: center;
					display: flex;
					gap: 10px;
					width: 100%;
				}
				input {
					cursor: pointer;
				}
			</style>
			<div class='ac-number'>
				<input type='number'></input>
				<label></label>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get checked() { return this.shadowRoot.querySelector('input').checked; }
	get container() { return this.shadowRoot.querySelector('div.ac-checkbox'); }
	get input() { return this.shadowRoot.querySelector('input'); }
	get label() { return this.shadowRoot.querySelector('label'); }

	set checked(val) { this.input.toggleAttribute('checked', Boolean(val)); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			this.dispatchEvent(new Event('change', { 'bubbles': true }));
			this.checked = newVal;
		}
	}

	connectedCallback() {
		const label = this.getAttribute('label') || '';
		const checked = this.getAttribute('checked') || false;
		this.input.addEventListener('change', this.handleChange);
		this.label.setAttribute('for', label);
		this.label.innerText = label;
		this.checked = checked;
	}
	
	handleChange = (e) => {
		this.dispatchEvent(new Event('change', { 'bubbles': true }));
		this.checked = e.target.checked;
	}
}

customElements.define('ac-number', Number);
