export default class Slider extends HTMLElement {
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
				:host(:focus-within) input, input:focus-visible {
					border-radius: 3px;
					outline: 2px solid #000;
					outline-offset: 10px;
					z-index: 1;
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
				.inner {
					align-self: center;
					display: flex;
					flex: 1;
					flex-direction: column;
					justify-content: flex-end;
					margin-top: 1px;
				}
				/* Reset */
				input {
					-webkit-appearance: none;
					appearance: none;
					background: transparent;
					cursor: pointer;
					width: 100%;
					--range: calc(var(--max) - var(--min));
					--ratio: calc((var(--value) - var(--min)) / var(--range));
					--sx: calc(0.5 * 2em + var(--ratio) * (100% - 2em));
				}
				/* Chromium, Safari */
				input::-webkit-slider-runnable-track {
					background: linear-gradient(#d46027,#d46027) 0/var(--sx) 100% no-repeat, #e5e5e5;
					border-radius: 5px;
					height: 5px;
					transition: background-color .2s ease;
				}
				input:hover::-webkit-slider-runnable-track, input:active::-webkit-slider-runnable-track {
					background: linear-gradient(#fc6e28,#fc6e28) 0/var(--sx) 100% no-repeat, #e5e5e5;
				}
				input::-webkit-slider-thumb {
					-webkit-appearance: none;
					appearance: none;
					background-color: #d46027;
					border-radius: 50%;
					height: 22px;
					margin-top: -8px;
					transition: background-color .2s ease;
					width: 22px;
				}
				input:hover::-webkit-slider-thumb, input:active::-webkit-slider-thumb {
					background-color: #fc6e28;
				}
				/* Firefox */
				input::-moz-range-track {
					background: linear-gradient(#d46027,#d46027) 0/var(--sx) 100% no-repeat, #e5e5e5;
					border-radius: 5px;
					height: 5px;
					transition: background-color .2s ease;
				}
				input:hover::-moz-range-track, input:active::-moz-range-track {
					background: linear-gradient(#fc6e28,#fc6e28) 0/var(--sx) 100% no-repeat, #e5e5e5;
				}
				input::-moz-range-thumb {
					background-color: #d46027;
					border-radius: 50%;
					border: none;
					height: 22px;
					margin-top: -8px;
					transition: background-color .2s ease;
					width: 22px;
				}
				input:hover::-moz-range-thumb, input:active::-moz-range-thumb {
					background-color: #fc6e28;
				}
				label {
					align-items: flex-start;
					cursor: pointer;
					display: flex;
					gap: 0 10px;
					width: 100%;
				}
			</style>
			<label tabindex='-1'>
				<slot></slot>
				<div class='inner'>
					<input tabindex='-1' type='range'></input>
					<div id='helper' class='hidden'></div>
				</div>
				<output></output>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
		this._error = false;
	}

	get disabled() { return this._disabled; }
	set disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#input.removeEventListener('input', this.handleChange);
			this.#input.setAttribute('disabled', bool);
			this.removeEventListener('keydown', this.handleKeydown);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
			this.setAttribute('tabindex', -1);
		} else {
			this.#input.addEventListener('input', this.handleChange);
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

	get #input() { return this.shadowRoot.querySelector('input'); }

	get #output() { return this.shadowRoot.querySelector('output'); }

	get value() { return this.#input.value; }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.#input.value = parseFloat(newVal);
			this.#output.innerText = newVal;
			this.setAttribute('aria-valueNow', newVal);
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
		const max = this.getAttribute('max');
		const min = this.getAttribute('min');
		const step = this.getAttribute('step');
		const value = this.getAttribute('value');
		this.#input.setAttribute('aria-hidden', true);
		if (error) this.error = error;
		if (helpertext) this.#helperDiv.innerText = helpertext;
		if (max != null) {
			this.#input.setAttribute('max', max);
			this.setAttribute('aria-valueMax', max);
		}
		if (min != null) {
			this.#input.setAttribute('min', min);
			this.setAttribute('aria-valueMin', min);
		}
		if (step) this.#input.setAttribute('step', step);
		if (value != null) {
			this.#input.value = parseFloat(value);
			this.setAttribute('aria-valueNow', value);
		}
		this.#output.innerText = value;
		if (this.getAttribute('disabled') === 'true') {
			this.disabled = true;
		} else {
			this.disabled = false;
		}
		this.setAttribute('aria-orientation', 'horizontal');
		this.style.setProperty('--value', value);
		this.style.setProperty('--min', min == '' ? '0' : min);
		this.style.setProperty('--max', max == '' ? '100' : max);
	}

	handleChange = () => {
		this.#output.innerText = this.value;
		this.setAttribute('aria-valueNow', parseFloat(this.value));
		this.style.setProperty('--value', parseFloat(this.value));
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}

	handleKeydown = (e) => {
		let val = 0;
		if (!isNaN(parseFloat(this.value))) {
			val = parseFloat(this.value);
		} else if (!isNaN(parseFloat(this.#input.min)) && parseFloat(this.#input.min) > 0) {
			val = parseFloat(this.#input.min);
		}
		const step = isNaN(parseFloat(this.#input.step)) ? 1 : parseFloat(this.#input.step);
		switch (e.code) {
			case 'ArrowUp':
			case 'ArrowRight':
				e.preventDefault();
				e.stopPropagation();
				if ((val + step) <= parseFloat(this.#input.getAttribute('max'))) {
					this.#input.value = val + step;
					this.handleChange();
				}
				break;
			case 'ArrowDown':
			case 'ArrowLeft':
				e.preventDefault();
				e.stopPropagation();
				if ((val - step) >= parseFloat(this.#input.getAttribute('min'))) {
					this.#input.value = val - step;
					this.handleChange();
				}
				break;
		}
	}
}

customElements.define('ac-slider', Slider);
