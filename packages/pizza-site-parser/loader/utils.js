import { marked } from 'marked';

const scriptRE = /<script[^>]*>([\s\S]*)<\/script>/;
const scriptContentRE = /(?<=<script[^>]*>)([\s\S]*)(?=<\/script>)/;
const templateRE = /<template[^>]*>([\s\S]*)<\/template>/;
const styleRE = /<style[^>]*>([\s\S]*)<\/style>/;
const docsRE = /(?<=<docs>)([\s\S]*)(?=<\/docs>)/;
const reObj = {
  script: scriptRE,
  style: styleRE,
  docs: docsRE,
  template: templateRE,
  scriptContent: scriptContentRE,
};

export function fetchCode(src, type) {
  const matches = src.match(reObj[type]);
  return matches ? matches[0] : '';
}

export function createRenderer(wrapCodeWithCard = true) {
  const renderer = new marked.Renderer();
  const overrides = {
    table(header, body) {
      if (body) body = `<tbody>${body}</tbody>`;
      return (
        '<div class="md-table-wrapper"><table single-column class="md-table">\n'
        + `<thead>\n${
          header
        }</thead>\n${
          body
        }</table>\n`
        + '</div>'
      );
    },

    tablerow(content) {
      return `<tr>\n${content}</tr>\n`;
    },

    tablecell(content, flags) {
      const type = flags.header ? 'th' : 'td';
      const tag = flags.align
        ? `<${type} align="${flags.align}">`
        : `<${type}>`;
      return `${tag + content}</${type}>\n`;
    },

    code: (code, language) => {
      if (language.startsWith('__'))
        language = language.replace('__', '');

      const isLanguageValid = !!(language && hljs.getLanguage(language));
      if (!isLanguageValid)
        throw new Error(`MdRendererError: ${language} is not valid for code - ${code}`);

      const highlighted = hljs.highlight(code, { language }).value;
      const content = `<code><pre v-pre>${highlighted}</pre></code>`;
      return wrapCodeWithCard
        ? `<card embedded :bordered="false" class="md-card" content-style="padding: 0;">
            <scrollbar x-scrollable content-style="padding: 16px;">
              ${content}
            </scrollbar>
          </card>`
        : content;
    },
    heading: (text, level) => {
      const id = text.replace(/ /g, '-');
      return `<h${level} id="${id}">${text}</h${level}>`;
    },
    blockquote: (quote) => {
      return `<blockquote>${quote}</blockquote>`;
    },
    hr: () => '<hr />',
    paragraph: (text) => {
      return `<p>${text}</p>`;
    },
    link(href, title, text) {
      if (/^(http:|https:)/.test(href))
        return `<a href="${href}" target="_blank">${text}</a>`;

      return `<router-link to="${href}" #="{ navigate, href }" custom><a :href="href" @click="navigate">${text}</a></router-link>`;
    },
    list(body, ordered, start) {
      const type = ordered ? 'ol' : 'ul';
      const startatt = ordered && start !== 1 ? ` start="${start}"` : '';
      return `<${type}${startatt}>\n${body}</${type}>\n`;
    },
    listitem(text) {
      return `<li>${text}</li>`;
    },
    codespan(code) {
      return `<text code>${code}</text>`;
    },
    strong(text) {
      return `<text strong>${text}</text>`;
    },
    checkbox(checked) {
      return `<checkbox :checked="${checked}" style="vertical-align: -2px; margin-right: 8px;" />`;
    },
  };

  Object.keys(overrides).forEach((key) => {
    renderer[key] = overrides[key];
  });
  return renderer;
}
