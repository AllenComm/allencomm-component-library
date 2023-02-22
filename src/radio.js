export default class Radio extends HTMLElement {
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
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	static get observedAttributes() {
		return ['checked'];
	}

	get checked() {
		return this.shadowRoot.querySelector('input').checked;
	}

	get container() {
		return this.shadowRoot.querySelector('div.ac-checkbox');
	}

	get input() {
		return this.shadowRoot.querySelector('input');
	}

	get label() {
		return this.shadowRoot.querySelector('label');
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			this.dispatchEvent(new Event('change', { 'bubbles': true }));
			this.updateChecked(newVal);
		}
	}

	connectedCallback() {
		const label = this.getAttribute('label') || '';
		const checked = this.getAttribute('checked') || false;
		this.input.addEventListener('change', this.handleChange);
		this.label.setAttribute('for', label);
		this.label.innerText = label;
		this.updateChecked(checked);
	}
	
	handleChange = (e) => {
		this.dispatchEvent(new Event('change', { 'bubbles': true }));
		this.updateChecked(e.target.checked);
	}

	updateChecked = (newVal) => {
		this.input.setAttribute('checked', newVal);
		this.input.checked = newVal;
	}
}

customElements.define('ac-radio', Radio);
