import { html, css, LitElement } from 'lit';

import { customElement, state } from 'lit/decorators.js';


@customElement('code-block')
export class CodeBlock extends LitElement {
  static styles = css`
  pre {
    overflow-x: auto;
    font-size: 0.875em;
    line-height: 1.7142857;
    margin-top: 0;
    margin-bottom: 1.7142857em;
    border-radius: 0.375rem;
    border-top-left-radius: 0;
    padding-top: 0.8571429em;
    padding-right: 1.1428571em;
    padding-bottom: 0.8571429em;
    padding-left: 1.1428571em;
  }

  button {
    background: none;
    background-color: #686a76;
    color: #f8f8f2;
    border: none;
    font: inherit;
    cursor: pointer;
    outline: inherit;
    border: 1px solid black;
    padding: 8px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    opacity: 0.6;
  }

  button.selected {
    background: #282a36;
    opacity: 1.0;
    border-bottom: 1px solid transparent;
  }
  `;

  @state()
  private selected: number = 0;

  @state()
  private originalChildren: Array<Element> = [];

  connectedCallback() {
    super.connectedCallback();
    this.originalChildren = [...this.shadowRoot?.host.children ?? []];
  }

  render() {
    const tabs = this.originalChildren.map((e) => (e.firstChild?.firstChild as HTMLElement).dataset['lang']);

    return html`<div>
        <div class="tabs">
            ${tabs.map((tab, index) => html`
                <button class="${this.selected == index ? "selected" : ""}" @click=${() => this.selected = index}>
                    <span>
                        ${tab}
                    </span>
                </button>
            `)}
        </div>
        ${this.originalChildren[this.selected]}
    </div>`;
  }
}
