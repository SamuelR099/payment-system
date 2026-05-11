import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export function renderPdfTemplate<T>(
  TemplateToUse: React.ComponentType<T>,
  props: T,
): string {
  return renderToStaticMarkup(<TemplateToUse {...props} />);
}
