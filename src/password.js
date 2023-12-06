export default class Password extends HTMLElement {
	static observedAttributes = ['disabled', 'error', 'value'];

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
				#helper {
					color: rgb(240, 45, 50);
					flex: 100%;
					font-size: 90%;
					padding: 5px 5px 0px 5px;
				}
				#helper.hidden {
					display: none;
				}
				.icon, slot[name='toggle-show'], slot[name='toggle-hide'] {
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
				.icon button, ::slotted(*[slot='toggle-show']), ::slotted(*[slot='toggle-hide']) {
					background: none;
					border: none;
					cursor: pointer;
					display: flex !important;
					height: 100%;
					max-height: 22px !important;
					max-width: 22px !important;
					padding: 0;
					place-content: center;
					place-items: center;
					width: 100%;
				}
				.icon.hidden, slot[name='toggle-show'].hidden, slot[name='toggle-hide'].hidden {
					opacity: 0;
					pointer-events: none;
				}
				.inner {
					display: flex;
					flex: 1;
					flex-direction: column;
					justify-content: flex-end;
				}
				input {
					border-radius: 3px;
					border-width: 1px;
					flex: 1;
					font-family: monospace;
					padding: 5px;
					width: 100%;
				}
				input:focus-visible {
					border-color: #000;
					border-style: solid;
					outline: 1px solid #000;
					z-index: 1;
				}
				input.error {
					border-color: rgb(240, 45, 50);
					border-style: solid;
				}
				label {
					align-items: baseline;
					cursor: pointer;
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					gap: 0 10px;
					position: relative;
					width: 100%;
				}
			</style>
			<label tabindex='-1'>
				<slot></slot>
				<div class='inner'>
					<input type='password' autocomplete='current-password' id='current-password' name='password'/>
					<div class='icon toggle-show'>
						<button aria-hidden='true' tabindex='-1'>
							<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
								<path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/>
							</svg>
						</button>
					</div>
					<div class='icon toggle-hide hidden'>
						<button aria-hidden='true' tabindex='-1'>
							<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
								<path xmlns="http://www.w3.org/2000/svg" d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"/>
							</svg>
						</button>
					</div>
					<slot name='toggle-show'></slot>
					<slot name='toggle-hide'></slot>
					<div id='helper' class='hidden'></div>
				</div>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
		this._error = false;
		this._slotToggleShow = null;
		this._slotToggleHide = null;
	}

	get #input() { return this.shadowRoot.querySelector('input'); }

	get value() { return this.#input.value; }
	set value(newVal) { this.#input.value = newVal }

	get disabled() { return this._disabled; }
	set disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#input.removeEventListener('input', this.handleChange);
			this.#input.setAttribute('disabled', bool);
			if (this.#slotToggleShow) {
				this.#slotToggleShow.removeEventListener('click', this.handlePasswordToggle);
				this.#slotToggleShow.removeEventListener('keydown', this.onKeyDown);
				this.#slotToggleShow.setAttribute('aria-disabled', bool);
				this.#slotToggleShow.setAttribute('aria-hidden', bool);
				this.#slotToggleShow.removeAttribute('aria-label');
				this.#slotToggleShow.setAttribute('tabindex', -1);
			}
			if (this.#slotToggleHide) {
				this.#slotToggleHide.removeEventListener('click', this.handlePasswordToggle);
				this.#slotToggleHide.removeEventListener('keydown', this.onKeyDown);
				this.#slotToggleHide.setAttribute('aria-disabled', bool);
				this.#slotToggleHide.setAttribute('aria-hidden', bool);
				this.#slotToggleHide.removeAttribute('aria-label');
				this.#slotToggleHide.setAttribute('tabindex', -1);
			}
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
		} else {
			this.#input.addEventListener('input', this.handleChange);
			this.#input.removeAttribute('disabled');
			if (this.#slotToggleShow) {
				this.#slotToggleShow.addEventListener('click', this.handlePasswordToggle);
				this.#slotToggleShow.addEventListener('keydown', this.onKeyDown);
				this.#slotToggleShow.removeAttribute('aria-disabled');
				this.#slotToggleShow.setAttribute('aria-label', 'Hide password.');
				if (this.#input.type === 'password') {
					this.#slotToggleShow.setAttribute('tabindex', 0);
					this.#slotToggleShow.removeAttribute('aria-hidden');
				} else {
					this.#slotToggleShow.setAttribute('tabindex', -1);
					this.#slotToggleShow.setAttribute('aria-hidden', true);
				}
			}
			if (this.#slotToggleHide) {
				this.#slotToggleHide.addEventListener('click', this.handlePasswordToggle);
				this.#slotToggleHide.addEventListener('keydown', this.onKeyDown);
				this.#slotToggleHide.removeAttribute('aria-disabled');
				this.#slotToggleHide.setAttribute('aria-label', 'Show password as plain text. Warning: this will display your password on the screen.');
				if (this.#input.type === 'password') {
					this.#slotToggleHide.setAttribute('tabindex', -1);
					this.#slotToggleHide.setAttribute('aria-hidden', true);
				} else {
					this.#slotToggleHide.setAttribute('tabindex', 0);
					this.#slotToggleHide.removeAttribute('aria-hidden');
				}
			}
			this.removeAttribute('aria-disabled');
			this.removeAttribute('aria-hidden');
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
			this.#input.classList.add('error');
			this.dispatchEvent(new Event('error', { 'composed': true }));
		} else {
			if (this.#helperDiv.innerText.length > 0) {
				this.#helperDiv.setAttribute('aria-hidden', !bool);
				this.#helperDiv.classList.add('hidden');
			}
			this.#input.classList.remove('error');
		}
	}

	get #helperDiv() { return this.shadowRoot.querySelector('#helper'); }

	get #slotToggleShow() { return this._slotToggleShow; }
	set #slotToggleShow(newVal) { this._slotToggleShow = newVal; }

	get #slotToggleHide() { return this._slotToggleHide; }
	set #slotToggleHide(newVal) { this._slotToggleHide = newVal; }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.value = newVal;
		} else if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.disabled = bool;
		} else if (attr === 'error') {
			const bool = newVal === 'true' || newVal === true;
			this.error = bool;
		}
	}

	connectedCallback() {
		const error = this.getAttribute('error');
		const helpertext = this.getAttribute('helpertext');
		const maxlength = this.getAttribute('maxlength');
		const minlength = this.getAttribute('minlength');
		const placeholder = this.getAttribute('placeholder');
		const size = this.getAttribute('size');
		const value = this.getAttribute('value');
		if (error) this.error = error;
		if (helpertext) this.#helperDiv.innerText = helpertext;
		if (maxlength) this.#input.setAttribute('maxlength', maxlength);
		if (minlength) this.#input.setAttribute('minlength', minlength);
		if (placeholder) this.#input.setAttribute('placeholder', placeholder);
		if (size) this.#input.setAttribute('size', size);
		if (value != null) {
			this.value = value;
		}
		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.slot === 'toggle-show') {
					this.shadowRoot.querySelector('.icon').classList.add('hidden');
					this.#slotToggleShow = a;
				} else if (a.slot === 'toggle-hide') {
					this.shadowRoot.querySelector('.icon').classList.add('hidden');
					this.#slotToggleHide = a;
				}
			});
		}
		if (!this.#slotToggleShow) {
			this.shadowRoot.querySelector('[name=toggle-show]').classList.add('hidden');
			this.#slotToggleShow = this.shadowRoot.querySelector('.toggle-show');
		}
		if (!this.#slotToggleHide) {
			this.shadowRoot.querySelector('[name=toggle-hide]').classList.add('hidden');
			this.#slotToggleHide = this.shadowRoot.querySelector('.toggle-hide');
		}
		if (this.getAttribute('disabled') === 'true') {
			this.disabled = true;
		} else {
			this.disabled = false;
		}
	}

	handleChange = () => {
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}

	handlePasswordToggle = () => {
		if (this.#input.type === 'password') {
			this.#input.type = 'text';
			this.#slotToggleShow.classList.add('hidden');
			this.#slotToggleShow.setAttribute('aria-hidden', true);
			this.#slotToggleShow.setAttribute('tabindex', -1);
			this.#slotToggleHide.classList.remove('hidden');
			this.#slotToggleHide.setAttribute('aria-hidden', false);
			this.#slotToggleHide.setAttribute('tabindex', 0);
			this.#slotToggleHide.focus();
		} else {
			this.#input.type = 'password';
			this.#slotToggleShow.classList.remove('hidden');
			this.#slotToggleShow.setAttribute('aria-hidden', false);
			this.#slotToggleShow.setAttribute('tabindex', 0);
			this.#slotToggleHide.classList.add('hidden');
			this.#slotToggleHide.setAttribute('aria-hidden', true);
			this.#slotToggleHide.setAttribute('tabindex', -1);
			this.#slotToggleShow.focus();
		}
	}

	onKeyDown = (e) => {
		if (e.key === 'Enter' || e.key === 'Space') {
			this.handlePasswordToggle();
		}
	}
}

customElements.define('ac-password', Password);
