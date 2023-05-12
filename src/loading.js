export default class Loading extends HTMLElement {
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
					outline: none;
					width: 100%;
				}
				.icon {
					display: flex;
					height: 30px;
					place-content: center;
					place-items: center;
					user-select: none;
					width: 30px;
				}
				.icon div {
					display: flex !important;
					height: 100%;
					max-height: 22px !important;
					max-width: 22px !important;
					place-content: center;
					place-items: center;
					width: 100%;
				}
				.icon div svg {
					animation: load;
					animation-duration: 1s;
					animation-iteration-count: infinite;
					animation-play-state: running;
					animation-timing-function: linear;
				}
				.wrapper {
					display: flex;
					flex-direction: row;
					outline: none;
					place-content: center;
					place-items: center;
					position: relative;
					width: 100%;
				}
				@keyframes load {
					0% {
						transform: rotate(0deg);
					}
					50% {
						transform: rotate(180deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
			</style>
			<div class='wrapper' tabindex='-1'>
				<div class='icon'>
					<div>
						<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48">
							<path d="M480 896q-133 0-226.5-93.5T160 576q0-133 93.5-226.5T480 256q85 0 149 34.5T740 385V256h60v254H546v-60h168q-38-60-97-97t-137-37q-109 0-184.5 75.5T220 576q0 109 75.5 184.5T480 836q83 0 152-47.5T728 663h62q-29 105-115 169t-195 64Z"/>
						</svg>
					</div>
				</div>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}
}

customElements.define('ac-loading', Loading);
