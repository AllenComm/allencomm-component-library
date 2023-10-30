export default class Snackbar extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					background: #fff;
					display: none;
					flex-direction: column;
					margin: 20px;
					position: fixed;
				}
				:host([open='true']) {
					display: flex;
					z-index: 100;
				}
				:host([anchor*='center']) {
					left: 50%;
					transform: translateX(-50%);
				}
				:host([anchor*='left']) {
					left: 0;
				}
				:host([anchor*='right']) {
					right: 0;
				}
				:host([anchor*='bottom']) {
					bottom: 0;
				}
				:host([anchor*='top']) {
					top: 0;
				}
			</style>
			<slot></slot>
			<div class='close'></div>
		`;
		this._anchor = '';
		this._autohide = -1;
		this._onclose = null;
		this._open = false;
	}

	get #anchor() { return this._anchor; }
	set #anchor(newVal) { this._anchor = newVal; }

	get #autohide() { return this._autohide; }
	set #autohide(newVal) { this._autohide = parseFloat(newVal); }

	get onclose() { return this._onclose; }
	set onclose(newVal) { this._onclose = newVal; }

	get open() { return this._open; }
	set open(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._open = bool;
		if (bool) {
			if (this.#autohide > 0) {
				setTimeout(() => this.handleClose(), this.#autohide);
			}
			this.setAttribute('open', true);
		} else {
			if (this.onclose != null) {
				this.onclose();
			}
			this.setAttribute('open', false);
		}
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'open') {
			this.open = newVal;
		}
	}

	connectedCallback() {
		const anchor = this.getAttribute('anchor');
		const autohide = this.getAttribute('autohide');
		const onclose = this.getAttribute('onclose');
		const open = this.getAttribute('open');
		if (anchor && typeof anchor === 'object' && (anchor.horizontal || anchor.vertical)) {
			this.#anchor = anchor;
		} else {
			this.#anchor = { vertical: 'bottom', horizontal: 'left' };
		}
		if (autohide) this.#autohide = autohide;
		if (onclose != null) this.onclose = onclose;
		if (open != null) this.open = open;
	}

	handleClose = () => {
		if (this.onclose != null) {
			this.onclose();
		}
		this.open = false;
	}
}

customElements.define('ac-snackbar', Snackbar);
