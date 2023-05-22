export default class Switch extends HTMLElement {
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
				:host(:focus-visible) .wrapper {
					border-radius: 3px;
					outline: 2px solid #000;
					outline-offset: 2px;
				}
				input {
					display: none;
				}
				label {
					align-items: center;
					cursor: pointer;
					display: flex;
					flex-wrap: wrap;
					gap: 0 10px;
					width: 100%;
				}
				.wrapper {
					background: transparent;
					border: 1px solid #b2b2b2;
					border-radius: 5px;
					display: inline-block;
					height: 22px;
					position: relative;
					width: 40px;
				}
				.indicator {
					background: #b2b2b2;
					border-radius: 5px;
					height: 16px;
					left: 2px;
					position: absolute;
					top: 2px;
					width: 16px;
				}
				.inner {
					display: flex;
					flex: 1;
					justify-content: flex-end;
				}
				label:hover .wrapper {
					cursor: pointer;
					border-color: #9a9a9a;
				}
				label:hover .indicator {
					background: #9a9a9a;
				}
				label:has(input:checked) .wrapper {
					background-color: #0075ff;
				}
				label:has(input:checked):hover .wrapper {
					background-color: #005cc8;
				}
				label:has(input:checked) .indicator {
					background-color: white;
					left: calc(100% - 2px - 16px);
				}
				label:has(input:checked):hover .indicator {
					background-color: #efefef;
				}
				::slotted(*[slot='off-label']:not(:empty)) {
					display: inline-block;
				}
				::slotted(*[slot='on-label']) {
					display: none;
				}
				slot {
					user-select: none;
				}
				label:has(input:checked) ::slotted(*[slot='off-label']) {
					display: none;
				}
				label:has(input:checked) ::slotted(*[slot='on-label']:not(:empty)) {
					display: inline-block;
				}
			</style>
			<label tabindex='-1'>
				<slot></slot>
				<slot name='on-label'></slot>
				<slot name='off-label'></slot>
				<div class='inner'>
					<input tabindex='-1' type='checkbox'></input>
					<div class='wrapper'>
						<div class='indicator'></div>
					</div>
				</div>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get checked() { return this.#input.checked; }

	get #input() { return this.shadowRoot.querySelector('input'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			const bool = newVal === 'true';
			this.#input.checked = bool;
			this.handleChange();
		}
	}

	connectedCallback() {
		const checked = this.getAttribute('checked') || false;
		this.#input.checked = checked;
		this.#input.addEventListener('change', this.handleChange);
		this.setAttribute('aria-checked', checked);
		this.setAttribute('tabindex', 0);
		this.addEventListener('keydown', this.handleKeydown);
	}

	handleChange = (e) => {
		this.setAttribute('aria-checked', this.#input.checked);
		if (e) {
			this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
		}
	}

	handleKeydown = (e) => {
		switch (e.code) {
			case 'NumpadEnter':
			case 'Enter':
			case 'Space':
				e.preventDefault();
				e.stopPropagation();
				this.#input.checked = !this.#input.checked;
				this.handleChange(e);
				break;
		}
	}
}

customElements.define('ac-switch', Switch);
