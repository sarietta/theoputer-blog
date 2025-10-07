import { html, css, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('svg-viewer')
export class SvgViewer extends LitElement {
  static styles = css`
:host, div, object {
    position: relative;
    // aspect-ratio: 3;
    background-color: #f5f4ee;
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

  @property() src?: string;

  @state() isPanning: boolean = false;
  @state() lastMouseX: number = 0;
  @state() lastMouseY: number = 0;

  @state() svgElement?: SVGSVGElement;
  @state() viewBox: string = this.buildViewBoxString();
  @property() viewBoxX: number = 0;
  @property() viewBoxY: number = 0;
  @property() viewBoxWidth: number = 0;
  @property() viewBoxHeight: number = 0;

  private buildViewBoxString(): string {
    return `${this.viewBoxX} ${this.viewBoxY} ${this.viewBoxWidth} ${this.viewBoxHeight}`
  }

  private _onSvgLoad(event: Event) {
    this._updateViewBox(event.target as HTMLObjectElement);

    const overlay = this.renderRoot.querySelector(".focus-overlay");
    document.addEventListener("click", (clickEvent) => {
      if (clickEvent.composedPath().includes(this)) {
        overlay?.classList.add("has-focus");
        this.setupSVGEventListeners();
      } else {
        overlay?.classList.remove("has-focus");
      }
    });

    // document.addEventListener("click", () => {
    //   overlay?.classList.remove("has-focus");
    // });
  }

  private _updateViewBox(objectElement: HTMLObjectElement | null | undefined) {
    if (!this.viewBox || !objectElement) return;

    const svgDocument = objectElement.contentDocument;
    if (svgDocument) {
      const svgElement = svgDocument.querySelector('svg');
      if (svgElement) {
        this.svgElement = svgElement;
        this.viewBoxWidth = this.viewBoxWidth > 0 ? this.viewBoxWidth : this.svgElement.getBoundingClientRect().width;
        this.viewBoxHeight = this.viewBoxHeight > 0 ? this.viewBoxHeight : this.svgElement.getBoundingClientRect().height;

        this.viewBox = this.buildViewBoxString();
        this.svgElement.setAttribute('viewBox', this.viewBox);
      }
    }
  }

  private setupSVGEventListeners() {
    this.svgElement?.addEventListener('mousemove', this.onMouseMove.bind(this));
    // Attach wheel listener to SVG for zooming
    this.svgElement?.addEventListener('wheel', this.onMouseWheel.bind(this), { passive: false });
    // Attach mouse down, move, and up listeners for panning
    this.svgElement?.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.svgElement?.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.svgElement?.addEventListener('mouseleave', this.onMouseUp.bind(this)); // Stop panning if mouse leaves SVG
  }

  updated(changedProperties: Map<string | symbol, unknown>) {
    if (changedProperties.has('viewBox')) {
      const objectElement = this.shadowRoot?.querySelector('object');
      this._updateViewBox(objectElement);
    }
  }

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('viewBoxWidth')
      || changedProperties.has('viewBoxY')
      || changedProperties.has('viewBoxHeight')
      || changedProperties.has('viewBoxX')) {
      this.viewBox = this.buildViewBoxString();
      if (this.svgElement) {
        this.svgElement.setAttribute('viewBox', this.viewBox);
      }
    }
  }

  render() {
    this.viewBox = this.buildViewBoxString();
    if (this.svgElement) {
      this.svgElement.setAttribute('viewBox', this.viewBox);
    }

    return html`
<div class="svg-viewer">
      <object
        data="${this.src}"
        type="image/svg+xml"
        @load=${this._onSvgLoad}
      ></object>
</div>
<div class="focus-overlay">
  <div class="bg"></div>
  <div class="fg">Click or tap to interact</div>
</div>
    `;
  }

  onMouseMove(event: MouseEvent) {
    const svg = this.svgElement;
    if (!svg) {
      return;
    }

    // Panning logic
    if (this.isPanning) {
      const dx = event.clientX - this.lastMouseX;
      const dy = event.clientY - this.lastMouseY;

      // Convert screen delta to SVG delta
      const CTM = svg.getScreenCTM();
      if (!CTM) return;

      const svgDeltaX = dx / CTM.a; // CTM.a is the scale factor for x
      const svgDeltaY = dy / CTM.d; // CTM.d is the scale factor for y

      this.viewBoxX = this.viewBoxX - svgDeltaX;
      this.viewBoxY = this.viewBoxY - svgDeltaY;

      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }

    this.requestUpdate();
  }

  onMouseDown(event: MouseEvent) {
    if (event.shiftKey) {
      console.log(`viewBoxX="${this.viewBoxX}" viewBoxY="${this.viewBoxY}" viewBoxWidth="${this.viewBoxWidth}" viewBoxHeight="${this.viewBoxHeight}"`);
    }

    this.isPanning = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    this.requestUpdate();
  }

  onMouseUp(event: MouseEvent) {
    this.isPanning = false;
    this.requestUpdate();
  }

  onMouseWheel(event: WheelEvent) {
    event.preventDefault(); // Prevent page scrolling

    const svg = this.svgElement;
    if (!svg) {
      return;
    }

    const CTM = svg.getScreenCTM();
    if (!CTM) return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Convert mouse coordinates to SVG coordinates
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = mouseX;
    svgPoint.y = mouseY;
    const transformedPoint = svgPoint.matrixTransform(CTM.inverse());

    const zoomFactor = 1.01; // How much to zoom in/out
    let newWidth = this.viewBoxWidth;
    let newHeight = this.viewBoxHeight;
    let newX = this.viewBoxX;
    let newY = this.viewBoxY;

    if (event.deltaY < 0) { // Zoom in
      newWidth /= zoomFactor;
      newHeight /= zoomFactor;
    } else { // Zoom out
      newWidth *= zoomFactor;
      newHeight *= zoomFactor;
    }

    // Calculate new viewBox position to zoom towards the mouse pointer
    newX = transformedPoint.x - (transformedPoint.x - newX) * (newWidth / this.viewBoxWidth);
    newY = transformedPoint.y - (transformedPoint.y - newY) * (newHeight / this.viewBoxHeight);

    this.viewBoxWidth = newWidth;
    this.viewBoxHeight = newHeight;
    this.viewBoxX = newX;
    this.viewBoxY = newY;

    this.requestUpdate();
  }

}
