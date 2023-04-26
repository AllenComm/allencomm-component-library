export default class Radio extends HTMLElement {
	static observedAttributes = ['checked', 'disabled'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: block;
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
				.inner {
					display: flex;
					flex: 1;
					justify-content: flex-end;
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
				::slotted(*[slot='off-label']:not(:empty)) {
					display: inline-block;
				}
				::slotted(*[slot='on-label']) {
					display: none;
				}
				label:has(input:checked) ::slotted(*[slot='off-label']) {
					display: none;
				}
				label:has(input:checked) ::slotted(*[slot='on-label']:not(:empty)) {
					display: inline-block;
				}
			</style>
			<label tabindex='-1'>
				<slot name='on-label'></slot>
				<slot name='off-label'></slot>
				<slot></slot>
				<div class='inner'>
					<input tabindex='-1' type='radio'></input>
				</div>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
	}

	get checked() { return this.#input.checked; }
	get id() { return this.#input.id; }
	get name() { return this.#input.name; }

	get #disabled() { return this._disabled; }
	get #input() { return this.shadowRoot.querySelector('input'); }
	get #label() { return this.shadowRoot.querySelector('label'); }
	get #slot() { return this.shadowRoot.querySelector('slot'); }

	set #disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#input.removeEventListener('change', this.handleChange);
			this.#input.setAttribute('disabled', bool);
			this.removeEventListener('keydown', this.handleKeydown);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
			this.setAttribute('tabindex', -1);
		} else {
			this.#input.addEventListener('change', this.handleChange);
			this.#input.removeAttribute('disabled');
			this.addEventListener('keydown', this.handleKeydown);
			this.removeAttribute('aria-disabled');
			this.removeAttribute('aria-hidden');
			this.setAttribute('tabindex', 0);
		}
	}

	set checked(newVal) {
		const bool = newVal === 'true';
		this.#input.checked = bool;
		this.setAttribute('aria-checked', bool);
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			const bool = newVal === 'true';
			this.#input.checked = bool;
		} else if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.#disabled = bool;
		}
	}

	connectedCallback() {
		const checked = this.getAttribute('checked') || false;
		const id = this.getAttribute('id');
		const name = this.getAttribute('name') || '';
		const value = this.getAttribute('value') || id || '';
		this.#input.setAttribute('aria-hidden', true);
		this.#input.checked = checked;
		if (id != null) {
			this.#input.setAttribute('id', id);
			this.#label.setAttribute('for', id);
		} else {
			const newId = `radio-${[...document.querySelectorAll('ac-radio')].findIndex((a) => a === this)}`;
			this.#input.setAttribute('id', newId);
			this.#label.setAttribute('for', newId);
			this.setAttribute('id', newId);
		}
		this.#input.setAttribute('name', name);
		this.#input.setAttribute('value', value);
		if (this.getAttribute('disabled') === 'true') {
			this.#disabled = true;
		} else {
			this.#disabled = false;
		}
		this.setAttribute('aria-checked', checked);
	}

	handleChange = () => {
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
					this.handleChange();
				}
				break;
		}
	}
}

customElements.define('ac-radio', Radio);
