export default class Switch extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				div.ac-switch {
					align-items: center;
					display: flex;
					gap: 10px;
					width: 100%;
				}
				input {
					display: none;
				}
				div.ac-switch-wrapper {
					background: transparent;
					border: 1px solid #b2b2b2;
					border-radius: 5px;
					height: 20px;
					position: relative;
					width: 40px;
				}
				div.ac-switch-wrapper[data-checked="true"] {
					background: #0075ff;
				}
				div.ac-switch-wrapper:hover {
					cursor: pointer;
					border-color: #9a9a9a;
				}
				div.ac-switch-indicator {
					background: #b2b2b2;
					border-radius: 5px;
					height: 16px;
					left: 2px;
					position: absolute;
					top: 2px;
					width: 16px;
				}
				div.ac-switch-wrapper:hover div.ac-switch-indicator {
					background: #9a9a9a;
				}
				div.ac-switch-wrapper[data-checked="true"] div.ac-switch-indicator {
					background: white;
					left: calc(100% - 2px - 16px);
				}
				div.ac-switch-wrapper:hover[data-checked="true"] {
					background: #005cc8;
				}
				div.ac-switch-wrapper:hover[data-checked="true"] div.ac-switch-indicator {
					background: #efefef;
				}
			</style>
			<div class='ac-switch'>
				<input type='checkbox'></input>
				<div class='ac-switch-wrapper'>
					<div class='ac-switch-indicator'></div>
				</div>
				<label></label>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	static get observedAttributes() {
		return ['checked'];
	}

	get checked() {
		return this.shadowRoot.querySelector('input').checked;
	}

	get container() {
		return this.shadowRoot.querySelector('div.ac-switch');
	}

	get input() {
		return this.shadowRoot.querySelector('input');
	}

	get label() {
		return this.shadowRoot.querySelector('label');
	}

	get wrapper() {
		return this.shadowRoot.querySelector('div.ac-switch-wrapper');
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			this.dispatchEvent(new Event('change', { 'bubbles': true }));
			this.updateChecked(newVal);
		}
	}

	connectedCallback() {
		const label = this.getAttribute('label') || '';
		const checked = this.getAttribute('checked') || false;
		this.wrapper.addEventListener('change', this.handleChange);
		this.wrapper.addEventListener('click', this.handleChange);
		this.label.setAttribute('for', label);
		this.label.innerText = label;
		this.updateChecked(checked);
	}
	
	handleChange = (e) => {
		this.dispatchEvent(new Event('change', { 'bubbles': true }));
		this.updateChecked(e.target.checked);
	}

	updateChecked = (newVal) => {
		console.log('checked:', newVal);
		console.log('input:', this.input.checked);
		if (!newVal) {
			newVal = false;
		}
		this.input.setAttribute('checked', newVal);
		this.input.checked = newVal;
		this.wrapper.dataset.checked = newVal;
	}
}

customElements.define('ac-switch', Switch);
