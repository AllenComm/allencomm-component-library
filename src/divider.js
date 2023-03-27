export default class Divider extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					border-bottom: none;
					border-left: none;
					border-right: none;
					border-top: 1px solid grey;
					display: block;
					margin: 5px 0;
					width: 100%;
				}
			</style>
		`;
	}

	connectedCallback() {
		if (this.getAttribute('role') === null) this.setAttribute('role', 'separator');
	}
}

customElements.define('ac-divider', Divider);
