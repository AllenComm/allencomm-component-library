export default class Listbox extends HTMLElement {
	static observedAttributes = ['selected'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				div.ac-listbox {
					align-items: center;
					display: flex;
					gap: 10px;
					width: 100%;
				}
				input, label {
					cursor: pointer;
				}
			</style>
			<div class='ac-listbox'>
				<select>
					<option>option</option>
				</select>
				<label></label>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get input() { return this.shadowRoot.querySelector('input'); }
	get label() { return this.shadowRoot.querySelector('label'); }
	get name() { return this.input.getAttribute('name'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
		}
	}

	connectedCallback() {
		const label = this.getAttribute('label') || '';
		this.label.setAttribute('for', label);
		this.label.innerText = label;
	}
	
	handleChange = () => {
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
	}
}

customElements.define('ac-listbox', Listbox);
