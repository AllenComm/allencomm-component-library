export default class Switch extends HTMLElement {
	static observedAttributes = ['checked'];

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
				label, label>* {
					vertical-align: middle;
				}
				div.ac-switch-wrapper {
					background: transparent;
					border: 1px solid #b2b2b2;
					border-radius: 5px;
					display: inline-block;
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
				<label>
					<input type='checkbox'></input>
					<div class='ac-switch-wrapper'>
						<div class='ac-switch-indicator'></div>
					</div>
				</label>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get checked() { return this.input.hasAttribute('checked'); }
	get container() { return this.shadowRoot.querySelector('div.ac-switch'); }
	get input() { return this.shadowRoot.querySelector('input'); }
	get label() { return this.shadowRoot.querySelector('label'); }
	get wrapper() { return this.shadowRoot.querySelector('div.ac-switch-wrapper'); }

	set checked(val) {
		this.input.toggleAttribute('checked', Boolean(val));
		this.wrapper.dataset.checked = Boolean(val);
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			this.dispatchEvent(new Event('change', { 'bubbles': true }));
			this.checked = newVal;
		}
	}

	connectedCallback() {
		const checked = this.getAttribute('checked') || false;
		this.wrapper.addEventListener('click', this.handleChange);
		this.checked = checked;
		if (this.childNodes.length > 0) {
			Array.from(this.childNodes).map((a) => this.label.appendChild(a));
		}
	}

	handleChange = () => {
		this.dispatchEvent(new Event('change', { 'bubbles': true }));
		this.checked = !this.checked;
	}
}

customElements.define('ac-switch', Switch);
