export default class Radio extends HTMLElement {
	static formAssociated = true;
	static observedAttributes = ['checked'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				div.ac-radio {
					align-items: center;
					display: flex;
					gap: 10px;
					width: 100%;
				}
				input {
					cursor: pointer;
				}
			</style>
			<div class='ac-radio'>
				<input type='radio'></input>
				<label></label>
			</div>
		`;
		this._internals = this.attachInternals();
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get checked() { return this.input.hasAttribute('checked'); }
	get container() { return this.shadowRoot.querySelector('div.ac-checkbox'); }
	get form() { return this._internals.form; }
	get input() { return this.shadowRoot.querySelector('input'); }
	get label() { return this.shadowRoot.querySelector('label'); }
	get name() { return this.input.getAttribute('name'); }

	set checked(val) { this.input.toggleAttribute('checked', Boolean(val)); }

	attributeChangedCallback(attr, oldVal, newVal) {
		console.log(attr, newVal);
		console.log(this._internals);
		this._internals.setFormValue(this.checked ? 'on' : null);
		if (attr === 'checked') {
			this.dispatchEvent(new Event('change', { 'bubbles': true }));
			this.checked = newVal;
		}
	}

	connectedCallback() {
		const name = this.getAttribute('name') || '';
		const label = this.getAttribute('label') || '';
		const checked = this.getAttribute('checked') || false;
		this.input.addEventListener('change', this.handleChange);
		this.input.setAttribute('name', name);
		this.input.setAttribute('id', label);
		this.input.setAttribute('value', label);
		this.label.setAttribute('for', label);
		this.label.innerText = label;
		this.checked = checked;
	}
	
	handleChange = () => {
		this.dispatchEvent(new Event('click', { 'bubbles': true }));
		this.checked = !this.checked;
	}
}

customElements.define('ac-radio', Radio);
