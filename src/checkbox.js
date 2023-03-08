export default class Checkbox extends HTMLElement {
	static observedAttributes = ['checked'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					width: 100%;
				}
				input {
					margin: 0;
				}
				input, label {
					cursor: pointer;
				}
				label {
					align-items: center;
					display: flex;
					gap: 10px;
				}
			</style>
			<label><input type='checkbox'></input></label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get checked() { return this.input.hasAttribute('checked'); }
	get input() { return this.shadowRoot.querySelector('input'); }
	get label() { return this.shadowRoot.querySelector('label'); }

	set checked(val) { this.input.toggleAttribute('checked', Boolean(val)); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			this.checked = newVal;
			this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
		}
	}

	connectedCallback() {
		const checked = this.getAttribute('checked') || false;
		const value = this.getAttribute('value') || '';
		this.input.addEventListener('change', this.handleChange);
		this.input.setAttribute('value', value);
		this.checked = checked;
		if (this.childNodes.length > 0) {
			Array.from(this.childNodes).map((a) => this.label.appendChild(a));
		}
	}
	
	handleChange = (e) => {
		this.checked = e.target.checked;
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
	}
}

customElements.define('ac-checkbox', Checkbox);
