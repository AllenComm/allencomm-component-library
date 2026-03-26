export default class Tab extends HTMLElement {
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
					width: 100%;
				}
				:host([aria-selected='true']) button {
					background-color: #d460271a;
				}
				:host([variant='alternate'][aria-selected='true']) button {
					background-color: #d46027;
					border-radius: 3px;
					color: #fff;
				}
				button {
					background: none;
					border: none;
					color: #d46027;
					cursor: pointer;
					display: flex;
					padding: 10px;
					place-content: center;
					text-align: center;
					width: 100%;
				}
			</style>
			<button tabindex='0'><slot></slot></button>
		`;

		this.#button.addEventListener('click', (e) => this.handleClick(e));
	}

	get #button() { return this.shadowRoot.querySelector('button'); }

	handleClick(e) {
		e.preventDefault();
		e.stopPropagation();
		const clickEvent = new Event('click', { 'bubbles': false, 'cancelable': true, 'composed': true });
		this.dispatchEvent(clickEvent);
	}

	handleKeyDown(e) {
		if (this.disabled) return;
		if (e.key === 'Enter' || e.key === 'Space') {
			this.handleClick(e);
		}
	}
}

customElements.define('ac-tab', Tab);
