export default class Radio extends HTMLElement {
	static observedAttributes = ['checked'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					outline: none;
					width: 100%;
				}
				:host(:focus-visible) input:after {
					border-radius: 3px;
					content: '';
					display: block;
					height: 13px;
					outline: 2px solid #000;
					outline-offset: 2px;
					width: 13px;
					z-index: 1;
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
					flex-wrap: wrap;
					gap: 0 10px;
					width: 100%;
				}
			</style>
			<label tabindex='-1'>
				<input tabindex='-1' type='radio'></input>
				<slot></slot>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get checked() { return this.#input.checked; }
	get id() { return this.#input.id; }
	get name() { return this.#input.name; }

	get #input() { return this.shadowRoot.querySelector('input'); }
	get #label() { return this.shadowRoot.querySelector('label'); }
	get #slot() { return this.shadowRoot.querySelector('slot'); }

	set checked(newVal) {
		const bool = newVal === 'true';
		this.#input.checked = bool;
		this.ariaChecked = bool;
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			const bool = newVal === 'true';
			this.#input.checked = bool;
		}
	}

	connectedCallback() {
		const checked = this.getAttribute('checked') || false;
		const id = this.getAttribute('id');
		const name = this.getAttribute('name') || '';
		const value = this.getAttribute('value') || id || '';
		this.#input.ariaHidden = true;
		if (id != null) {
			this.#input.id = id;
			this.#label.for = id;
		} else {
			const newId = `radio-${[...document.querySelectorAll('ac-radio')].findIndex((a) => a === this)}`;
			this.#input.id = newId;
			this.#label.for = newId;
			this.setAttribute('id', newId);
		}
		this.#input.name = name;
		this.#input.value = value;
		this.#input.checked = checked;
		this.#input.addEventListener('change', this.handleChange);
		this.ariaChecked = checked;
		this.tabIndex = 0;
		this.addEventListener('keydown', this.handleKeydown);
	}
	
	handleChange = (e) => {
		this.setAttribute('aria-checked', this.#input.checked);
		Array.from(window.document.querySelectorAll('ac-radio')).map((a) => {
			const name = a.attributes?.name?.nodeValue;
			const sameItem = this.id && a.id ? this.id === a.id : this.#slot.assignedNodes()?.[0].nodeValue === a.shadowRoot.querySelector('slot')?.assignedNodes()?.[0].nodeValue;
			const sameName = name && this.name === name;
			if (sameName && !sameItem) {
				a.checked = false;
			}
		});
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));			
	}

	handleKeydown = (e) => {
		// Add arrow key navigation/toggling within same group, like default
		// html
		switch (e.code) {
			case 'Enter':
			case 'Space':
				e.preventDefault();
				e.stopPropagation();
				if (!this.#input.checked) {
					this.#input.checked = true;
					this.handleChange(e);
				}
				break;
		}
	}
}

customElements.define('ac-radio', Radio);
