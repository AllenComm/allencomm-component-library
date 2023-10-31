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
					display: block;
					height: 0px;
					width: 0px;
				}
				#body {
					animation-direction: alternate;
					background: #fff;
					box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%), 0 1px 5px 0 rgb(0 0 0 / 20%);
					border-radius: 3px;
					display: none;
					margin: 20px;
					min-width: 250px;
					padding: 15px;
					position: fixed;
					/* visibility: hidden; */
				}
				#body[animation='scale'] {
					animation: scale .25s;
				}
				#body[animation='slide'] {
					animation: slide-left .25s;
				}
				#body[open='true'] {
					display: flex;
					/* visibility: visible; */
					z-index: 100;
				}
				#body[horizontal='center'] {
					left: 50%;
					transform: translateX(-50%);
				}
				#body[horizontal='center'][animation='scale'] {
					animation: scaleAndTranslate .25s;

				}
				#body[horizontal='left'] {
					left: 0;
				}
				#body[horizontal='right'] {
					right: 0;
				}
				#body[vertical='bottom'] {
					bottom: 0;
				}
				#body[vertical='top'] {
					top: 0;
				}
				@keyframes scale {
					from {
						transform: scale(0);
					} to {
						transform: scale(1);
					}
				}
				@keyframes scaleAndTranslate {
					from {
						transform: scale(0) translateX(-50%);
					} to {
						transform: scale(1) translateX(-50%);
					}
				}
			</style>
			<div id='body'>
				<slot></slot>
				<div class='close'></div>
			</div>
		`;
		this._anchor = 'bottom left';
		this._animation = 'scale';
		this._autohide = -1;
		this._direction = null;
		this._onclose = null;
		this._open = false;
		this._horizontal = null;
		this._vertical = null;
	}

	set #anchor(newVal) {
		if (newVal.length > 0) {
			this._anchor = newVal;
			const anchors = newVal.split(' ');
			anchors.map((a, i) => {
				switch(a) {
					case 'bottom':
					case 'top':
						if (!this.#vertical) {
							this.#vertical = a;
						}
						break;
					case 'center':
					case 'left':
					case 'right':
						if (!this.#horizontal) {
							this.#horizontal = a;
						}
						break;
				}
			});
			if (!this.#vertical) {
				this.#vertical = 'bottom';
			}
			if (!this.#horizontal) {
				this.#horizontal = 'left';
			}
		}
	}

	get #animation() { return this._animation; }
	set #animation(newVal) {
		this._animation = newVal;
		this.#body.setAttribute('animation', newVal);
	}

	get #autohide() { return this._autohide; }
	set #autohide(newVal) { this._autohide = parseFloat(newVal); }

	get #body() { return this.shadowRoot.querySelector('#body'); }

	set #direction(newVal) {
		if (this.#animation == 'slide') {
			this._direction = newVal;
		} else if (this._direction != null) {
			this._direction = null;
		}
	}

	get #horizontal() { return this._horizontal; }
	set #horizontal(newVal) {
		this._horizontal = newVal;
		this.#body.setAttribute('horizontal', newVal);
	}

	get #vertical() { return this._vertical; }
	set #vertical(newVal) {
		this._vertical = newVal;
		this.#body.setAttribute('vertical', newVal);
	}

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
			this.#body.setAttribute('open', true);
		} else {
			if (this.onclose != null) {
				this.onclose();
			}
			this.#body.setAttribute('open', false);
		}
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'open') {
			this.open = newVal;
		}
	}

	connectedCallback() {
		const anchor = this.getAttribute('anchor');
		const animation = this.getAttribute('animation');
		const autohide = this.getAttribute('autohide');
		const direction = this.getAttribute('direction');
		const onclose = this.getAttribute('onclose');
		const open = this.getAttribute('open');
		if (anchor != null) {
			this.#anchor = anchor;
		} else {
			this.#anchor = this._anchor;
		}
		if (animation != null) {
			this.#animation = animation;
		} else {
			this.#animation = this._animation;
		}
		if (autohide) this.#autohide = autohide;
		if (direction != null) this.#direction = direction;
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
