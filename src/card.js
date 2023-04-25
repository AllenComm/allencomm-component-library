export default class Card extends HTMLElement {
	static observedAttributes = ['face'];

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
					contain: content;
					width: 100%;
				}
				:host([density='cozy']) {
					padding: 24px;
				}
				:host([density='comfortable']) {
					padding: 12px;
				}
				:host([density='compact']) {
					padding: 6px;
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
				:host([face='front']) .back {
					display: none;
				}
				:host([face='back']) .front {
					display: none;
				}
			</style>
			<div class='front'>
				<slot name='card-front-btn'></slot>
				<slot></slot>
				<slot name='front'></slot>
			</div>
			<div class='back'>
				<slot name='card-back-btn'></slot>
				<slot name='back'></slot>
			</div>
		`;
		this._face = 'front';
	}

	get face() { return this._face; }

	set face(newVal) {
		this.setAttribute('face', newVal);
		this._face = newVal;
	}

	connectedCallback() {
		if (!this.hasAttribute('face')) {
			this.face = 'front';
		}

		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.nodeName.toLowerCase() === 'button' && a.hasAttribute('slot')) {
					a.addEventListener('click', this.onFlip);
				}
			});
		}
	}

	onFlip = () => {
		if (this.face === 'front') {
			this.face = 'back';
		} else {
			this.face = 'front';
		}
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-card', Card);
