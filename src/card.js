export default class Card extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				div {
					display: flex;
					flex-direction: column;
					gap: 10px;
					padding: 16px;
					width: 100%;
				}
			</style>
			<div>
				<slot></slot>
			</div>
		`;
	}
}

customElements.define('ac-card', Card);
