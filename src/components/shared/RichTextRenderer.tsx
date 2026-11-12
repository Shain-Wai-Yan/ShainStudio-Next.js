import {sanitizeRichText} from '@/lib/utils/sanitize-rich-text';
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
  
  const cleanContent=sanitizeRichText(content);

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
