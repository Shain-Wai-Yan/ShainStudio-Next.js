import sanitizeHtml from 'sanitize-html';

// CMS descriptions are untrusted HTML, including when truncated mid-tag.
export function sanitizeDescription(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: { a: ['href', 'target', 'rel', 'class'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: { a: sanitizeHtml.simpleTransform('a', {
      target: '_blank', rel: 'noopener noreferrer', class: 'desc-link',
    }) },
  });
}

