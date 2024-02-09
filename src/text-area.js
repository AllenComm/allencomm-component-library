export default class TextArea extends HTMLElement {
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
				label {
					align-items: flex-start;
					cursor: pointer;
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					height: 100%;
					width: 100%;
				}
				textarea {
					border-color: #d7d7d7;
					border-radius: 5px;
					border-style: solid;
					border-width: 1px;
					font-family: sans-serif;
					font-size: 16px;
					padding: 8px;
					width: 100%;
				}
				textarea:focus-visible {
					border-style: solid;
					outline: 2px solid #000;
					outline-offset: 2px;
					z-index: 1;
				}
				textarea.error {
					border-color: rgb(240, 45, 50);
					border-style: solid;
				}
			</style>
			<label tabindex='-1'>
				<slot></slot>
				<textarea></textarea>
				<div id='helper' class='hidden'></div>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
		this._error = false;
	}

	get value() { return this.#textarea.value; }
	set value(newVal) {
		this.#textarea.value = newVal;
		this.setAttribute('aria-valueNow', newVal);
		setTimeout(() => this.resize());
	}

	get disabled() { return this._disabled; }
	set disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#textarea.removeEventListener('input', this.handleChange);
			this.#textarea.setAttribute('disabled', bool);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
		} else {
			this.#textarea.addEventListener('input', this.handleChange);
			this.#textarea.removeAttribute('disabled');
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
			this.#textarea.classList.add('error');
			this.dispatchEvent(new Event('error', { 'composed': true }));
		} else {
			if (this.#helperDiv.innerText.length > 0) {
				this.#helperDiv.setAttribute('aria-hidden', !bool);
				this.#helperDiv.classList.add('hidden');
			}
			this.#textarea.classList.remove('error');
		}
	}

	get #helperDiv() { return this.shadowRoot.querySelector('#helper'); }

	get #textarea() { return this.shadowRoot.querySelector('textarea'); }

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
		const autoHeight = this.getAttribute('auto-height');
		const cols = this.getAttribute('cols');
		const error = this.getAttribute('error');
		const helpertext = this.getAttribute('helpertext');
		const lines = this.getAttribute('lines');
		const maxlength = this.getAttribute('maxlength');
		const minlength = this.getAttribute('minlength');
		const placeholder = this.getAttribute('placeholder');
		const resize = this.getAttribute('resize') || 'none';
		const rows = this.getAttribute('rows');
		const value = this.getAttribute('value');
		if (autoHeight != null) {
			this.#textarea.setAttribute('auto-height', autoHeight);
		} else {
			this.#textarea.setAttribute('auto-height', true);
		}
		if (cols) this.#textarea.setAttribute('cols', cols);
		if (error) this.error = error;
		if (helpertext) this.#helperDiv.innerText = helpertext;
		if (maxlength) this.#textarea.setAttribute('maxlength', maxlength);
		if (minlength) this.#textarea.setAttribute('minlength', minlength);
		if (placeholder) this.#textarea.setAttribute('placeholder', placeholder);
		if (rows) {
			this.#textarea.setAttribute('rows', rows);
		} else if (lines) {
			this.#textarea.setAttribute('rows', lines);
		}
		this.#textarea.style.setProperty('resize', resize);
		if (value != null) {
			this.value = value;
		}
		if (this.getAttribute('disabled') === 'true') {
			this.disabled = true;
		} else {
			this.disabled = false;
		}
	}

	handleChange = (e) => {
		const target = e.target;
		this.value = target.value;
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}

	resize = () => {
		const target = this.#textarea;
		if (target.getAttribute('auto-height')) {
			target.style.height = 'auto';
			const styles = getComputedStyle(target);
			const border = parseInt(styles.borderBottomWidth) + parseInt(styles.borderTopWidth);
			target.style.height = target.scrollHeight + border + 'px';
		}
	}
}

customElements.define('ac-text-area', TextArea);
