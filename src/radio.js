export default class Radio extends HTMLElement {
	static observedAttributes = ['checked', 'disabled', 'error'];

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
				#helper {
					color: rgb(240, 45, 50);
					font-size: 90%;
					margin-right: 10px;
				}
				#helper.hidden {
					display: none;
				}
				.inner {
					display: flex;
					flex: 1;
					justify-content: flex-end;
				}
				input {
					height: 0;
					margin: 0;
					opacity: 0;
					width: 0;
				}
				input, label, span.icon {
					cursor: pointer;
				}
				label {
					align-items: center;
					display: flex;
					flex-wrap: wrap;
					gap: 0 10px;
					width: 100%;
				}
				span.icon {
					background-color: #fff;
					border: 1px solid #d7d7d7;
					border-radius: 50%;
					height: 22px;
					overflow: hidden;
					position: relative;
					width: 22px;
					transition: border-color .05s ease;
				}
				span.icon svg {
					background-color: #fff;
					display: inline-block;
					fill: #d46027;
					left: 50%;
					opacity: 0;
					position: absolute;
					top: 50%;
					transform: translate(-50%, -50%);
					transition: opacity .1s ease;
				}
				span.icon[checked='true'] {
					border-color: transparent;
					transition: border-color .25s ease;
				}
				span.icon[checked='true'] svg {
					opacity: 1;
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
					<div id='helper' class='hidden'></div>
					<input tabindex='-1' type='radio'></input>
					<span class='icon'>
						<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-280q83 0 141.5-58.5T680-480q0-83-58.5-141.5T480-680q-83 0-141.5 58.5T280-480q0 83 58.5 141.5T480-280Zm0 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
					</span>
				</div>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
		this._error = false;
	}

	get checked() { return this.#input.checked; }
	set checked(newVal) {
		const bool = newVal === 'true';
		this.#icon.setAttribute('checked', bool);
		this.#input.checked = bool;
		this.setAttribute('aria-checked', bool);
	}

	get disabled() { return this._disabled; }
	set disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#icon.removeEventListener('click', this.handleChange);
			this.#icon.setAttribute('disabled', bool);
			this.#input.removeEventListener('change', this.handleChange);
			this.#input.setAttribute('disabled', bool);
			this.removeEventListener('keydown', this.handleKeydown);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
			this.setAttribute('tabindex', -1);
		} else {
			this.#icon.addEventListener('click', this.handleChange);
			this.#icon.removeAttribute('disabled');
			this.#input.addEventListener('change', this.handleChange);
			this.#input.removeAttribute('disabled');
			this.addEventListener('keydown', this.handleKeydown);
			this.removeAttribute('aria-disabled');
			this.removeAttribute('aria-hidden');
			this.setAttribute('tabindex', 0);
		}
	}

	get error() { return this._error; }
	set error(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._error = bool;
		if (bool) {
			if (this.#helperDiv.innerText.length > 0) {
				this.#helperDiv.removeAttribute('aria-hidden');
				this.#helperDiv.classList.remove('hidden');
			}
			this.dispatchEvent(new Event('error', { 'composed': true }));
		} else {
			if (this.#helperDiv.innerText.length > 0) {
				this.#helperDiv.setAttribute('aria-hidden', !bool);
				this.#helperDiv.classList.add('hidden');
			}
		}
	}

	get #helperDiv() { return this.shadowRoot.querySelector('#helper'); }

	get id() { return this.#input.id; }

	get #input() { return this.shadowRoot.querySelector('input'); }

	get #icon() { return this.shadowRoot.querySelector('span.icon'); }

	get #label() { return this.shadowRoot.querySelector('label'); }

	get name() { return this.#input.name; }

	get #slot() { return this.shadowRoot.querySelector('slot'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			const bool = newVal === 'true' || newVal === true;
			this.#icon.setAttribute('checked', bool);
			this.#input.checked = bool;
		} else if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.disabled = bool;
		} else if (attr === 'error') {
			const bool = newVal === 'true' || newVal === true;
			this.error = bool;
		}
	}

	connectedCallback() {
		const checked = this.getAttribute('checked') || false;
		const error = this.getAttribute('error');
		const helpertext = this.getAttribute('helpertext');
		const id = this.getAttribute('id');
		const name = this.getAttribute('name') || '';
		const value = this.getAttribute('value') || id || '';
		this.#icon.setAttribute('checked', checked);
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
		if (error) this.error = error;
		if (helpertext) this.#helperDiv.innerText = helpertext;
		if (this.getAttribute('disabled') === 'true') {
			this.disabled = true;
		} else {
			this.disabled = false;
		}
		this.setAttribute('aria-checked', checked);
	}

	handleChange = () => {
		this.#icon.setAttribute('checked', this.#input.checked);
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
		// Add arrow key navigation/toggling within same group, like default html
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
