export default class Switch extends HTMLElement {
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
					display: none;
				}
				label {
					align-items: center;
					cursor: pointer;
					display: flex;
					gap: 10px;
					user-select: none;
				}
				.ac-switch-wrapper {
					background: transparent;
					border: 1px solid #b2b2b2;
					border-radius: 5px;
					display: inline-block;
					height: 20px;
					position: relative;
					width: 40px;
				}
				.ac-switch-indicator {
					background: #b2b2b2;
					border-radius: 5px;
					height: 16px;
					left: 2px;
					position: absolute;
					top: 2px;
					width: 16px;
				}
				label:hover .ac-switch-wrapper {
					cursor: pointer;
					border-color: #9a9a9a;
				}
				label:hover .ac-switch-indicator {
					background: #9a9a9a;
				}
				label:has(input:checked) .ac-switch-wrapper {
					background-color: #0075ff;
				}
				label:has(input:checked):hover .ac-switch-wrapper {
					background-color: #005cc8;
				}
				label:has(input:checked) .ac-switch-indicator {
					background-color: white;
					left: calc(100% - 2px - 16px);
				}
				label:has(input:checked):hover .ac-switch-indicator {
					background-color: #efefef;
				}
			</style>
			<label>
				<input type='checkbox'></input>
				<div class='ac-switch-wrapper'>
					<div class='ac-switch-indicator'></div>
				</div>
				<slot></slot>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get checked() { return this.input.checked; }
	get input() { return this.shadowRoot.querySelector('input'); }
	get wrapper() { return this.shadowRoot.querySelector('div.ac-switch-wrapper'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			const bool = newVal === 'true';
			this.input.checked = bool;
			this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
		}
	}

	connectedCallback() {
		const value = this.getAttribute('checked') || false;
		this.input.checked = value;
		this.input.addEventListener('change', this.handleChange);
	}

	handleChange = () => {
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
	}
}

customElements.define('ac-switch', Switch);
