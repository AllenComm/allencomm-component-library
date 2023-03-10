export default class Radio extends HTMLElement {
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
			<label>
				<input type='radio'></input>
				<slot></slot>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get checked() { return this.input.checked; }
	get id() { return this.input.getAttribute('id'); }
	get input() { return this.shadowRoot.querySelector('input'); }
	get label() { return this.shadowRoot.querySelector('label'); }
	get name() { return this.input.getAttribute('name'); }
	get slot() { return this.shadowRoot.querySelector('slot'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			const bool = newVal === 'true';
			this.input.checked = bool;
			this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
		}
	}

	connectedCallback() {
		const checked = this.getAttribute('checked') || false;
		const name = this.getAttribute('name') || '';
		const id = this.getAttribute('id') || null;
		const value = this.getAttribute('value') || id || '';
		this.input.setAttribute('name', name);
		this.input.setAttribute('value', value);

		if (id) {
			this.input.setAttribute('id', id);
			this.label.setAttribute('for', id);
		}

		this.input.checked = checked;
		this.input.addEventListener('change', this.handleChange);
	}
	
	handleChange = () => {
		this.setAttribute('checked', this.checked);
		Array.from(window.document.querySelectorAll('ac-radio')).map((a) => {
			const name = a.attributes?.name?.nodeValue;
			const sameItem = this.id && a.id ? this.id === a.id : this.slot.assignedNodes()?.[0] === a.shadowRoot.querySelector('slot')?.assignedNodes()?.[0];
			const sameName = name && this.name === name;
			if (sameName && !sameItem) {
				a.input.checked = false;
			}
		});
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
	}
}

customElements.define('ac-radio', Radio);
