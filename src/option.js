export default class Option extends HTMLElement {
	static observedAttributes = ['hidden'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					align-items: center;
					border-radius: 3px;
					cursor: pointer;
					display: flex;
					padding: 5px;
				}
				:host([aria-selected='true']) {
					background: #0075ff;
				}
				:host([hidden='true']) {
					display: none;
				}
			</style>
			<slot></slot>
		`;
		this.shadowRoot.addEventListener('mousedown', this.handleMouseDown);
	}

	get value() {
		if (this.getAttribute('value') !== null) {
			return this.getAttribute('value');
		}
		return this.innerText;
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'hidden') {
			const bool = newVal === 'true';
			this.setAttribute('aria-hidden', bool);
		}
	}

	connectedCallback() {
		this.setAttribute('tabindex', 0);
		const draggable = this.getAttribute('draggable');
		if (draggable != null) this.shadowRoot.removeEventListener('mousedown', this.handleMouseDown);
	}

	handleMouseDown = (e) => {
		e.stopPropagation();
	}
}

customElements.define('ac-option', Option);
