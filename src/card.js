export default class Card extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					background-color: #fff;
					border-radius: 3px;
					box-shadow: 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%), 0 2px 4px -1px rgb(0 0 0 / 30%);
					display: block;
				}
				div {
					display: flex;
					flex-direction: column;
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
