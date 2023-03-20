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
					box-shadow: 0 2px 1px -1px rgb(0 0 0 / 20%), 0 1px 1px 0 rgb(0 0 0 / 14%), 0 1px 3px 0 rgb(0 0 0 / 12%);
					display: block;
				}
				:host([density='cozy']) {
					padding: 15px;
				}
				:host([density='cozy']) div {
					gap: 10px;
				}
				:host([density='comfortable']) {
					padding: 10px;
				}
				:host([density='comfortable']) div {
					gap: 6px;
				}
				:host([density='compact']) {
					padding: 5px;
				}
				:host([density='compact']) div {
					gap: 2px;
				}
				:host([shadow='0']) {
					box-shadow: none;
				}
				:host([shadow='2']) {
					box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
				}
				:host([shadow='3']) {
					box-shadow: 0 3px 3px -2px rgb(0 0 0 / 20%), 0 3px 4px 0 rgb(0 0 0 / 14%), 0 1px 8px 0 rgb(0 0 0 / 12%);
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
