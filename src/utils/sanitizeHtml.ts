import * as sanitizeHtml from 'sanitize-html';
// import { BadRequestException } from '@nestjs/common';

const minLength = 5;
const maxLength = 100000;

export function purifyHtml(richText: string) {
  if (typeof richText !== 'string' || !richText.trim()) {
    return null;

    // throw new BadRequestException('RichText must be a non-empty string');
  }

  // if (/<html.*?>|<head.*?>/i.test(richText)) {
  //   return null;
  //   // throw new BadRequestException(
  //   //   'RichText should not contain a full HTML page',
  //   // );
  // }

  const textOnly = richText.replace(/<[^>]+>/g, '').trim();
  if (textOnly.length < minLength || textOnly.length > maxLength) {
    return null;
    // throw new BadRequestException(
    //   `RichText must be between ${minLength} and ${maxLength} characters`,
    // );
  }

  if (!textOnly) {
    return null;
    // throw new BadRequestException(
    //   'RichText must contain actual content, not just empty tags',
    // );
  }

  if (/(on\w+=|javascript:)/i.test(richText)) {
    return null;
    // throw new BadRequestException(
    //   'RichText contains potentially unsafe attributes or JavaScript',
    // );
  }

  const cleanHtml = sanitizeHtml(richText, {
    allowedTags: [
      'p',
      'b',
      'u',
      's',
      'i',
      'strong',
      'blockquote',
      'pre',
      'code',
      'em',
      'ul',
      'ol',
      'li',
      'hr',
      'br',
      'a',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'table',
      'tr',
      'th',
      'td',
      'img',
    ],

    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      table: ['border', 'cellspacing', 'cellpadding'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
  });

  // if (cleanHtml !== richText) {
  //   return null;
  //   // throw new BadRequestException(
  //   //   'RichText contains disallowed HTML tags or attributes',
  //   // );
  // }

  return cleanHtml;
}

//     @tiptap/extension-bold: Enables the <strong> tag for bold text.
// @tiptap/extension-italic: Enables the <em> tag for italicized text.
// @tiptap/extension-underline: Enables the <u> tag for underlined text.
// @tiptap/extension-strike: Enables the <s> tag for strikethrough text.
// @tiptap/extension-heading: Enables heading tags <h1> through <h6>.
// @tiptap/extension-paragraph: Enables the <p> tag for paragraphs.
// @tiptap/extension-bullet-list: Enables the <ul> tag for unordered lists.
// @tiptap/extension-ordered-list: Enables the <ol> tag for ordered lists.
// @tiptap/extension-list-item: Enables the <li> tag for list items.
// @tiptap/extension-blockquote: Enables the <blockquote> tag for block quotes.
// @tiptap/extension-code: Enables the <code> tag for inline code snippets.
// @tiptap/extension-code-block: Enables the <pre><code> tags for code blocks.
// @tiptap/extension-image: Enables the <img> tag for images.
// @tiptap/extension-link: Enables the <a> tag for hyperlinks.
// @tiptap/extension-horizontal-rule: Enables the <hr> tag for horizontal rules.
// @tiptap/extension-table: Enables the <table> tag for tables.
// @tiptap/extension-table-row: Enables the <tr> tag for table rows.
// @tiptap/extension-table-cell: Enables the <td> tag for table cells.
// @tiptap/extension-hard-break: Enables the <br> tag for line breaks.
