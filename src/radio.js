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
					user-select: none;
				}
			</style>
			<label><input type='radio'></input></label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get checked() { return this.input.hasAttribute('checked'); }
	get input() { return this.shadowRoot.querySelector('input'); }
	get label() { return this.shadowRoot.querySelector('label'); }
	get name() { return this.input.getAttribute('name'); }

	set checked(val) {
		if (Boolean(val)) {
			this.input.checked = true;
			this.input.setAttribute('checked', true);
		} else {
			this.input.checked = false;
			this.input.removeAttribute('checked');
		}
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
			this.checked = newVal;
		}
	}

	connectedCallback() {
		const checked = this.getAttribute('checked') || false;
		const name = this.getAttribute('name') || '';
		const id = this.getAttribute('id') || null;
		const value = this.getAttribute('value') || id || '';
		this.input.addEventListener('change', this.handleChange);
		this.input.setAttribute('name', name);
		this.input.setAttribute('value', value);

		if (id) {
			this.input.setAttribute('id', id);
			this.label.setAttribute('for', id);
		}

		this.checked = checked;
		if (this.childNodes.length > 0) {
			Array.from(this.childNodes).map((a) => this.label.appendChild(a));
		}
	}
	
	handleChange = () => {
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
		this.checked = !this.checked;
		Array.from(window.document.querySelectorAll('ac-radio')).map((a) => {
			const name = a.attributes?.name?.nodeValue;
			const label = a.label.innerText;
			const id = a.id || null;
			const isSame = this.label.innerText === label || id === this.id;
			if (name && this.name == name && !isSame) {
				a.checked = false;
			}
		});
	}
}

customElements.define('ac-radio', Radio);
