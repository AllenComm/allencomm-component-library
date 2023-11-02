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
					animation-duration: .25s;
					animation-fill-mode: both;
					background: #fff;
					box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%), 0 1px 5px 0 rgb(0 0 0 / 20%);
					border-radius: 3px;
					display: none;
					margin: 20px;
					min-width: 250px;
					padding: 15px;
					position: fixed;
					transform-origin: center;
					z-index: 100;
				}
				#body[open='false'] {
					animation-name: scaleOut;
					animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
					display: flex;
				}
				#body[open='true'] {
					animation-name: scaleIn;
					animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
					display: flex;
				}
				#body[open='false'][horizontal='center'] {
					animation-name: scaleTransformOut;
					transform-origin: left;
				}
				#body[open='true'][horizontal='center'] {
					animation-name: scaleTransformIn;
					transform-origin: left;
				}
				#body[open='false'][animation='fade'] {
					animation-name: fadeOut;
				}
				#body[open='true'][animation='fade'] {
					animation-name: fadeIn;
				}
				#body[open='false'][animation='slide'][direction='down'] {
					animation-name: slideDownOut;
				}
				#body[open='true'][animation='slide'][direction='down'] {
					animation-name: slideDownIn;
				}
				#body[open='false'][animation='slide'][direction='left'] {
					animation-name: slideLeftOut;
				}
				#body[open='true'][animation='slide'][direction='left'] {
					animation-name: slideLeftIn;
				}
				#body[open='false'][animation='slide'][direction='right'] {
					animation-name: slideRightOut;
				}
				#body[open='true'][animation='slide'][direction='right'] {
					animation-name: slideRightIn;
				}
				#body[open='false'][animation='slide'][direction='up'] {
					animation-name: slideUpOut;
				}
				#body[open='true'][animation='slide'][direction='up'] {
					animation-name: slideUpIn;
				}
				#body[horizontal='center'] {
					left: 50%;
					transform: translateX(-50%);
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
				@keyframes fadeIn {
					from {
						opacity: 0;
					} to {
						opacity: 1;
					}
				}
				@keyframes fadeOut {
					from {
						opacity: 1;
					} to {
						opacity: 0;
					}
				}
				@keyframes scaleIn {
					from {
						opacity: 0;
						transform: scale(0);
					} to {
						opacity: 1;
						transform: scale(1);
					}
				}
				@keyframes scaleOut {
					from {
						opacity: 1;
						transform: scale(1);
					} to {
						opacity: 0;
						transform: scale(0);
					}
				}
				@keyframes scaleTransformIn {
					from {
						opacity: 0;
						transform: scale(0) translateX(-50%);
					} to {
						opacity: 1;
						transform: scale(1) translateX(-50%);
					}
				}
				@keyframes scaleTransformOut {
					from {
						opacity: 1;
						transform: scale(1) translateX(-50%);
					} to {
						opacity: 0;
						transform: scale(0) translateX(-50%);
					}
				}
				@keyframes slideDownIn {
					from {
						transform: translateY(-100vh);
					} to {
						transform: translateY(0);
					}
				}
				@keyframes slideDownOut {
					from {
						transform: translateY(0);
					} to {
						transform: translateY(-100vh);
					}
				}
				@keyframes slideLeftIn {
					from {
						transform: translateX(-100vw);
					} to {
						transform: translateX(0);
					}
				}
				@keyframes slideLeftOut {
					from {
						transform: translateX(0);
					} to {
						transform: translateX(-100vw);
					}
				}
				@keyframes slideRightIn {
					from {
						transform: translateX(100vw);
					} to {
						transform: translateX(0);
					}
				}
				@keyframes slideRightOut {
					from {
						transform: translateX(0);
					} to {
						transform: translateX(100vw);
					}
				}
				@keyframes slideUpIn {
					from {
						transform: translateY(100vh);
					} to {
						transform: translateY(0);
					}
				}
				@keyframes slideUpOut {
					from {
						transform: translateY(0);
					} to {
						transform: translateY(100vh);
					}
				}
			</style>
			<div id='body'>
				<slot></slot>
			</div>
		`;
		this._anchor = 'bottom left';
		this._animation = 'scale';
		this._autohide = -1;
		this._direction = 'left';
		this._onclose = null;
		this._open = false;
		this._horizontal = null;
		this._timer = null;
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
			this.#body.setAttribute('direction', newVal);
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
				this._timer = setTimeout(() => this.handleClose(), this.#autohide);
			}
			this.#body.setAttribute('open', true);
		} else {
			clearTimeout(this._timer);
			this._timer = null;
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
		if (direction != null) {
			this.#direction = direction;
		} else {
			this.#direction = this._direction;
		}
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
