'use client';

import DOMPurify from 'isomorphic-dompurify';
import parse, { Element } from 'html-react-parser';
import React from 'react';
import { 
  secureLinksPlugin, 
  intelligentImagePlugin, 
  secureVideoPlugin 
} from './rich-text-plugins/plugins';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

const activePlugins = [
  secureLinksPlugin,
  intelligentImagePlugin,
  secureVideoPlugin,
];

export default function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  
  const DOMPURIFY_CONFIG = {
    ADD_TAGS: ['iframe', 'oembed'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'url', 'target', 'rel'],
    // 🚨 HARDENED: Explicitly allow http, https, mailto, tel, and relative paths. 
    // This absolutely kills `javascript:alert(1)` payloads.
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/\/|\/)/i, 
  };

  const cleanContent = DOMPurify.sanitize(content || '', DOMPURIFY_CONFIG);

  const parsedContent = parse(cleanContent, {
    replace: (domNode) => {
      if (domNode.type === 'tag') {
        const element = domNode as Element;

        for (const plugin of activePlugins) {
          const result = plugin(element);
          if (result !== undefined) {
            return result;
          }
        }
      }
    }
  });

  return (
    <div className={className}>
      {parsedContent}
    </div>
  );
}
