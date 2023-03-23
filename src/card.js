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
					box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%), 0 1px 5px 0 rgb(0 0 0 / 20%);
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
					box-shadow: 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%), 0 2px 4px -1px rgb(0 0 0 / 30%);
				}
				:host([shadow='3']) {
					box-shadow: 0 8px 17px 2px rgb(0 0 0 / 14%), 0 3px 14px 2px rgb(0 0 0 / 12%), 0 5px 5px -3px rgb(0 0 0 / 20%);
				}
				:host([shadow='4']) {
					box-shadow: 0 16px 24px 2px rgb(0 0 0 / 14%), 0 6px 30px 5px rgb(0 0 0 / 12%), 0 8px 10px -7px rgb(0 0 0 / 20%);
				}
				:host([shadow='5']) {
					box-shadow: 0 24px 38px 3px rgb(0 0 0 / 14%), 0 9px 46px 8px rgb(0 0 0 / 12%), 0 11px 15px -7px rgb(0 0 0 / 20%);
				}
				div {
					contain: content;
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
