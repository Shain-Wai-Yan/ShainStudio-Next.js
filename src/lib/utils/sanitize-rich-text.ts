import sanitizeHtml from 'sanitize-html';

/** Shared policy for server rendering and authenticated preview client props. */
export function sanitizeRichText(content:string):string {
  return sanitizeHtml(content || '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'oembed', 'figure']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'loading', 'decoding', 'style', 'class'],
      figure: ['class'],
      oembed: ['url', 'src']
    },
    allowedSchemesByTag: {
      img: ['http', 'https', 'data']
    }
  });
}
