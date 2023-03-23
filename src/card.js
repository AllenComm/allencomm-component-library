export default class Card extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host([density='cozy']) > div {
					padding: 15px;
				}
				:host([density='comfortable']) > div {
					padding: 10px;
				}
				:host([density='compact']) > div {
					padding: 5px;
				}
				:host([shadow='0']) > div {
					box-shadow: none;
				}
				:host([shadow='2']) > div {
					box-shadow: 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%), 0 2px 4px -1px rgb(0 0 0 / 30%);
				}
				:host([shadow='3']) > div {
					box-shadow: 0 8px 17px 2px rgb(0 0 0 / 14%), 0 3px 14px 2px rgb(0 0 0 / 12%), 0 5px 5px -3px rgb(0 0 0 / 20%);
				}
				:host([shadow='4']) > div {
					box-shadow: 0 16px 24px 2px rgb(0 0 0 / 14%), 0 6px 30px 5px rgb(0 0 0 / 12%), 0 8px 10px -7px rgb(0 0 0 / 20%);
				}
				:host([shadow='5']) > div {
					box-shadow: 0 24px 38px 3px rgb(0 0 0 / 14%), 0 9px 46px 8px rgb(0 0 0 / 12%), 0 11px 15px -7px rgb(0 0 0 / 20%);
				}
				div {
					background-color: #fff;
					border-radius: 3px;
					box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%), 0 1px 5px 0 rgb(0 0 0 / 20%);
					display: block;
					contain: content;
					height: 100%;
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
