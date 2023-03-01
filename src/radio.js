export default class Radio extends HTMLElement {
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
				input, label {
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

	get checked() { return this.input.hasAttribute('checked'); }
	get input() { return this.shadowRoot.querySelector('input'); }
	get label() { return this.shadowRoot.querySelector('label'); }
	get name() { return this.input.getAttribute('name'); }

	set checked(val) {
		if (Boolean(val) && !this.checked) {
			this.input.checked = true;
		} else {
			this.input.checked = false;
		}
	}

	attributeChangedCallback(attr, oldVal, newVal) {
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
		this.dispatchEvent(new Event('change', { 'bubbles': true }));
		this.checked = !this.checked;
		Array.from(window.document.querySelectorAll('ac-radio')).map((a) => {
			const name = a.attributes?.name?.nodeValue;
			const label = a.attributes?.label?.nodeValue;
			if (name && this.name == name && this.label.innerText !== label) {
				a.checked = false;
			}
		});
	}
}

customElements.define('ac-radio', Radio);
