import { html, css, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('fig-cite')
export class FigCite extends LitElement {
  @property() src: string = '';
  @property() class: string = '';
  @property() title: string = '';
  @property() href: string = '';
  @property() accessedOn: string = '';

    static styles = css`
        .center, .center div {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        }

        .center div {
        flex: 1 0 100%;
        }

        .small {
        img {
        width: 50%;
        }
        }

        .padded-white {
        img {
        padding: 1.5em;
        background-color: #fff;
        }
        }

        .small {
        img {
        max-width: 50%;
        }
        }

        .medium {
        img {
        max-width: 75%;
        }
        }

        citation {
        font-size: 0.8em;
        max-width: 80%;
        line-height: 1.3em;
        margin-top: 1rem;
        }

        citation a {
        color: unset;
        }

        citation accessed {
        display: none;
        }
    `;

    render() {
      return html`
        <div class="center">
          <div class="${this.class}">
            <img src="${this.src}" loading="lazy" alt="${this.title}">
          </div>
          <citation>
            Figure referenced from: <a href="${this.href}">${this.title}</a>
            <accessed>${this.accessedOn}</accessed>
          </citation>
        </div>
      `;
  }
}
