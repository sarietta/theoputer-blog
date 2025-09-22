import { html, css, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('falstad-circuit')
export class FalstadCircuit extends LitElement {
  @property() src: string = '';
  @property() height: number = 600;

  static styles = css``;

  render() {
    return html`<iframe src="${this.src}" frameborder="0" style="width:100%;height:${this.height}px"></iframe>`;
  }
}
