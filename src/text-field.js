export default class TextField extends HTMLElement {
	static observedAttributes = ['disabled', 'value'];

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
				:host([search='true']) input {
					border-radius: 20px;
					padding-right: 30px;
				}
				:host(:not([search='true'])) .icon {
					display: none !important;
				}
				input {
					border-radius: 3px;
					border-width: 1px;
					flex: 1;
					padding: 5px;
					width: 100%;
				}
				input:focus-visible {
					border-color: #000;
					border-style: solid;
					outline: 1px solid #000;
					z-index: 1;
				}
				label {
					align-items: flex-start;
					cursor: pointer;
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					gap: 0 10px;
					place-items: center;
					position: relative;
					width: 100%;
				}
				.icon, slot[name='icon'] {
					display: flex;
					height: 30px;
					position: absolute;
					place-content: center;
					place-items: center;
					right: 2px;
					top: 0;
					user-select: none;
					width: 30px;
					z-index: 2;
				}
				.icon.hidden {
					display: none;
				}
				.icon div, ::slotted(*[slot='icon']) {
					display: flex !important;
					height: 100%;
					max-height: 22px !important;
					max-width: 22px !important;
					place-content: center;
					place-items: center;
					width: 100%;
				}
				slot[name='icon'] {
					pointer-events: none;
				}
			</style>
			<label tabindex='-1'>
				<slot></slot>
				<input type='text'/>
				<div class='icon'>
					<div>
						<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="#000000">
							<path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
						</svg>
					</div>
				</div>
				<slot name='icon'></slot>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
		this._slotIcon = null;
	}

	get input() { return this.shadowRoot.querySelector('input'); }
	get value() { return this.input.value; }

	set value(newVal) { this.input.value = newVal }

	get #disabled() { return this._disabled; }
	get #slotIcon() { return this._slotIcon; }

	set #disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.input.removeEventListener('input', this.handleChange);
			this.input.setAttribute('disabled', bool);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
		} else {
			this.input.addEventListener('input', this.handleChange);
			this.input.removeAttribute('disabled');
			this.removeAttribute('aria-disabled');
			this.removeAttribute('aria-hidden');
		}
	}
	set #slotIcon(newVal) { this._slotIcon = newVal; }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.value = newVal;
			this.setAttribute('aria-valueNow', newVal);
		} else if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.#disabled = bool;
		}
	}

	connectedCallback() {
		const maxlength = this.getAttribute('maxlength');
		const minlength = this.getAttribute('minlength');
		const placeholder = this.getAttribute('placeholder');
		const search = this.getAttribute('search');
		const size = this.getAttribute('size');
		const value = this.getAttribute('value');
		if (maxlength) this.input.setAttribute('maxlength', maxlength);
		if (minlength) this.input.setAttribute('minlength', minlength);
		if (placeholder) this.input.setAttribute('placeholder', placeholder);
		if (search != null && search === 'true') this.setAttribute('search', 'true');
		if (size) this.input.setAttribute('size', size);
		if (value != null) {
			this.value = value;
			this.setAttribute('aria-valueNow', value);
		}
		if (this.getAttribute('disabled') === 'true') {
			this.#disabled = true;
		} else {
			this.#disabled = false;
		}
		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.slot === 'icon') {
					this.shadowRoot.querySelector('.icon').classList.add('hidden');
					this.#slotIcon = a;
				}
			});
		}
	}

	handleChange = () => {
		this.setAttribute('aria-valueNow', this.value);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-text-field', TextField);
