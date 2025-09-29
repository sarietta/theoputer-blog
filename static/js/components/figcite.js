import { i, a as i$1, x, _ as __decorate, n, t } from './property-7fb96a80.js';

let FigCite = class FigCite extends i {
    src = '';
    class = '';
    title = '';
    href = '';
    accessedOn = '';
    static styles = i$1 `
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
        return x `
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
};
__decorate([
    n()
], FigCite.prototype, "src", void 0);
__decorate([
    n()
], FigCite.prototype, "class", void 0);
__decorate([
    n()
], FigCite.prototype, "title", void 0);
__decorate([
    n()
], FigCite.prototype, "href", void 0);
__decorate([
    n()
], FigCite.prototype, "accessedOn", void 0);
FigCite = __decorate([
    t('fig-cite')
], FigCite);

export { FigCite };
//# sourceMappingURL=figcite.js.map
