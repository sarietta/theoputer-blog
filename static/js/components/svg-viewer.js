import { n, i, a as i$1, x, _ as __decorate, t } from './property-7fb96a80.js';

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:!0,attribute:!1})}

let SvgViewer = class SvgViewer extends i {
    static styles = i$1 `
:host, div, object {
      display: block;
      width: 100%;
      height: 100%;
}

.instructions {
position: relative;
    bottom: 31px;
    height: 32px;
background: #33333399;
border-radius: 0 10px 0 0;
max-width: 300px;
}

.instructions span {
padding-left: 15px;
font-size: 90%;
}
  `;
    src;
    isPanning = false;
    lastMouseX = 0;
    lastMouseY = 0;
    svgElement;
    viewBox = this.buildViewBoxString();
    viewBoxX = 0;
    viewBoxY = 0;
    viewBoxWidth = 0;
    viewBoxHeight = 0;
    buildViewBoxString() {
        return `${this.viewBoxX} ${this.viewBoxY} ${this.viewBoxWidth} ${this.viewBoxHeight}`;
    }
    _onSvgLoad(event) {
        this._updateViewBox(event.target);
    }
    _updateViewBox(objectElement) {
        if (!this.viewBox || !objectElement)
            return;
        const svgDocument = objectElement.contentDocument;
        if (svgDocument) {
            const svgElement = svgDocument.querySelector('svg');
            if (svgElement) {
                this.svgElement = svgElement;
                this.viewBoxWidth = this.viewBoxWidth > 0 ? this.viewBoxWidth : this.svgElement.getBoundingClientRect().width;
                this.viewBoxHeight = this.viewBoxHeight > 0 ? this.viewBoxHeight : this.svgElement.getBoundingClientRect().height;
                this.viewBox = this.buildViewBoxString();
                this.svgElement.setAttribute('viewBox', this.viewBox);
                this.svgElement.addEventListener('mousemove', this.onMouseMove.bind(this));
                // Attach wheel listener to SVG for zooming
                this.svgElement.addEventListener('wheel', this.onMouseWheel.bind(this), { passive: false });
                // Attach mouse down, move, and up listeners for panning
                this.svgElement.addEventListener('mousedown', this.onMouseDown.bind(this));
                this.svgElement.addEventListener('mouseup', this.onMouseUp.bind(this));
                this.svgElement.addEventListener('mouseleave', this.onMouseUp.bind(this)); // Stop panning if mouse leaves SVG
            }
        }
    }
    updated(changedProperties) {
        if (changedProperties.has('viewBox')) {
            const objectElement = this.shadowRoot?.querySelector('object');
            this._updateViewBox(objectElement);
        }
    }
    willUpdate(changedProperties) {
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
        return x `
<div class="svg-viewer">
      <object
        data="${this.src}"
        type="image/svg+xml"
        @load=${this._onSvgLoad}
></object>
<div class="instructions">
<span>You can pan/zoom this document.</span>
</div>
</div>
    `;
    }
    onMouseMove(event) {
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
            if (!CTM)
                return;
            const svgDeltaX = dx / CTM.a; // CTM.a is the scale factor for x
            const svgDeltaY = dy / CTM.d; // CTM.d is the scale factor for y
            this.viewBoxX = this.viewBoxX - svgDeltaX;
            this.viewBoxY = this.viewBoxY - svgDeltaY;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
        this.requestUpdate();
    }
    onMouseDown(event) {
        if (event.shiftKey) {
            console.log(`viewBoxX="${this.viewBoxX}" viewBoxY="${this.viewBoxY}" viewBoxWidth="${this.viewBoxWidth}" viewBoxHeight="${this.viewBoxHeight}"`);
        }
        this.isPanning = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.requestUpdate();
    }
    onMouseUp(event) {
        this.isPanning = false;
        this.requestUpdate();
    }
    onMouseWheel(event) {
        event.preventDefault(); // Prevent page scrolling
        const svg = this.svgElement;
        if (!svg) {
            return;
        }
        const CTM = svg.getScreenCTM();
        if (!CTM)
            return;
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
        }
        else { // Zoom out
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
};
__decorate([
    n()
], SvgViewer.prototype, "src", void 0);
__decorate([
    r()
], SvgViewer.prototype, "isPanning", void 0);
__decorate([
    r()
], SvgViewer.prototype, "lastMouseX", void 0);
__decorate([
    r()
], SvgViewer.prototype, "lastMouseY", void 0);
__decorate([
    r()
], SvgViewer.prototype, "svgElement", void 0);
__decorate([
    r()
], SvgViewer.prototype, "viewBox", void 0);
__decorate([
    n()
], SvgViewer.prototype, "viewBoxX", void 0);
__decorate([
    n()
], SvgViewer.prototype, "viewBoxY", void 0);
__decorate([
    n()
], SvgViewer.prototype, "viewBoxWidth", void 0);
__decorate([
    n()
], SvgViewer.prototype, "viewBoxHeight", void 0);
SvgViewer = __decorate([
    t('svg-viewer')
], SvgViewer);

export { SvgViewer };
//# sourceMappingURL=svg-viewer.js.map
