import { html, css, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const _globalCIrcuitJS1: { [key: string]: any } = {};

@customElement('falstad-circuit')
export class FalstadCircuit extends LitElement {
  @property() src: string = '';
  @property() height: number = 600;
  @property() uuid = (100000.0 * Math.random()).toFixed(0);
  @property() autorun: boolean = false;

  static styles = css`
:host, div, object {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
  }

  .focus-overlay {
    z-index: 10;
    user-select: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: initial;
    background: transparent;
    contain: paint;
  }

  .focus-overlay.has-focus {
    z-index: -10;
    pointer-events: none;
  }

  .focus-overlay .bg {
    background: var(--focus-overlay-bg);
    opacity: 0;
    transition: opacity var(--transition-time-short);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .focus-overlay:hover .bg {
    opacity: var(--focus-overlay-opacity);
  }

  .focus-overlay.has-focus .bg {
    opacity: 0;
  }

  .focus-overlay .fg {
    position: absolute;
    font-size: 1.5rem;
    color: var(--focus-overlay-fg);
    text-shadow: rgba(0, 0, 0, 0.5) 0px 0px 15px;
    opacity: 0;
    pointer-events: none;
    display: flex;
    align-items: center;
justify-content: center;
background-color: #000;
}

  .focus-overlay:hover .fg {
    opacity: 0.7;
  }

  .focus-overlay.has-focus .fg {
    opacity: 0;
  }
`;

  constructor() {
    super();
    document.addEventListener("click", (clickEvent) => this.handleClick(clickEvent));
  }

  handleClick(clickEvent: Event) {
    const overlay = this.renderRoot.querySelector(".focus-overlay");
    if (clickEvent.composedPath().includes(this)) {
      overlay?.classList.add("has-focus");
    } else {
      overlay?.classList.remove("has-focus");
    }
  }

  setupIframe() {
    const iframe = this.shadowRoot?.querySelector(`#circuitFrame-${this.uuid}`) as HTMLIFrameElement | null;

    const self = this;
    Object.defineProperty(iframe?.contentWindow, 'CircuitJS1', {
      get: function() {
        return _globalCIrcuitJS1[self.uuid];
      },

      set: function(sim) {
        if (_globalCIrcuitJS1[self.uuid] !== sim) {
          _globalCIrcuitJS1[self.uuid] = sim;
        }

        setTimeout(() => {
          sim.setSimRunning(self.autorun);
        });
      }
    });
  }

  render() {
    const remoteURL = new URL(this.src);
    const params = remoteURL.search;
    const localOrigin = window.location.origin;
    const localURL = new URL(`${localOrigin}/js/circuitjs/circuitjs.html${params}`);

    return html`
<iframe id="circuitFrame-${this.uuid}" src="${localURL}" frameborder="0" style="width:100%;height:${this.height}px" @load="${this.setupIframe}"></iframe>
<div class="focus-overlay">
  <div class="bg"></div>
  <div class="fg">Click or tap to interact</div>
</div>
`;
  }
}
