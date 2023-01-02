import { marked } from 'marked';
import type { ComponentPartsType } from './type';

const scriptRE = /<script[^>]*>([\s\S]*)<\/script>/;
const scriptContentRE = /(?<=<script[^>]*>)([\s\S]*)(?=<\/script>)/;
const templateRE = /<template[^>]*>([\s\S]*)<\/template>/;
const templateContentRE = /(?<=<template[^>]*>)([\s\S]*)(?=<\/template>)/;
const styleRE = /<style[^>]*>([\s\S]*)<\/style>/;
const docsRE = /(?<=<docs>)([\s\S]*)(?=<\/docs>)/;
const reObj: Record<string, RegExp> = {
  script: scriptRE,
  style: styleRE,
  docs: docsRE,
  template: templateRE,
  scriptContent: scriptContentRE,
  templateContent: templateContentRE,
};

const demoBlock = `
<template>
  <example-block
    file-name="<!--FILE_NAME-->"
    relative-url="<!--URL-->"
    title="<!--TITLE_SLOT-->"
    highlighted-code="<!--CODE_SLOT-->"
    lang="<!--LANGUAGE_TYPE_SLOT-->"
  >
    <template #content>
      <!-- CONTENT_SLOT -->
    </template>
  </example-block>
</template>

<!-- SCRIPT_SLOT -->

<!-- STYLE_SLOT -->
`;

export function fetchCode(src: string, type: string) {
  const matches = src.match(reObj[type]);
  return matches ? matches[0] : '';
}

export function createRenderer() {
  const renderer = new marked.Renderer();
  const overrides: Partial<marked.Renderer> = {
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
      if (/^(http:|https:)/.test(href as string)) return `<a href="${href}" target="_blank">${text}</a>`;

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
    const newKey = key as keyof marked.Renderer;
    renderer[newKey] = overrides[newKey] as never;
  });

  return renderer;
}

export function genVueComponent(parts: ComponentPartsType, fileName?: string, relativeUrl = '') {
  const fileNameReg = /<!--FILE_NAME-->/g;
  const relativeUrlReg = /<!--URL-->/g;
  const titleReg = /<!--TITLE_SLOT-->/g;
  const codeReg = /<!--CODE_SLOT-->/;
  const contentReg = /<!-- CONTENT_SLOT -->/;
  const scriptReg = /<!-- SCRIPT_SLOT -->/;
  const styleReg = /<!-- STYLE_SLOT -->/;
  const languageTypeReg = /<!--LANGUAGE_TYPE_SLOT-->/;
  let src = demoBlock;
  src = src.replace(relativeUrlReg, relativeUrl);

  if (parts.fileName) src = src.replace(fileNameReg, parts.fileName);

  if (parts.content) src = src.replace(contentReg, parts.content);

  if (parts.title) src = src.replace(titleReg, parts.title);

  if (parts.code) src = src.replace(codeReg, encodeURIComponent(parts.code));

  if (parts.script) src = src.replace(scriptReg, parts.script);

  if (parts.language) src = src.replace(languageTypeReg, parts.language);

  if (parts.style) src = src.replace(styleReg, parts.style);

  return src.trim();
}
