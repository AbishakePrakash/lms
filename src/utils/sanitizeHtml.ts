import * as sanitizeHtml from 'sanitize-html';
import { BadRequestException } from '@nestjs/common';

const minLength = 5;
const maxLength = 7000;

export function purifyHtml(richText: string) {
  if (typeof richText !== 'string' || !richText.trim()) {
    return null;

    // throw new BadRequestException('RichText must be a non-empty string');
  }

  if (/<html.*?>|<head.*?>/i.test(richText)) {
    return null;
    // throw new BadRequestException(
    //   'RichText should not contain a full HTML page',
    // );
  }

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
    allowedTags: ['p', 'b', 'i', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'a'],
    allowedAttributes: { a: ['href', 'target'] },
  });

  if (cleanHtml !== richText) {
    return null;
    // throw new BadRequestException(
    //   'RichText contains disallowed HTML tags or attributes',
    // );
  }

  return cleanHtml;
}
