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
					display: inline-block;
				}
				.tab {
					cursor: pointer;
					display: block;
					width: 100%;
				}
			</style>
			<div class='tab'><slot></slot></div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get container() { return this.shadowRoot.querySelector('.tab'); }

	connectedCallback() {
		this.container.addEventListener('click', this.handleClick);
	}

	handleClick() {
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
	}
}

customElements.define('ac-tab', Tab);
