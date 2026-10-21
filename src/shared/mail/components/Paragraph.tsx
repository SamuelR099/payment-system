import type {
  CSSProperties,
  ReactNode,
  TableHTMLAttributes,
} from 'react';

type ParagraphProps = Partial<
  TableHTMLAttributes<HTMLTableCellElement> & CSSProperties
> & {
  children?: ReactNode;
};

export function Paragraph({
  children,
  paddingBottom,
  paddingTop,
  textDecoration,
  fontWeight,
  fontSize,
  textAlign,
  style = {},
  ...restProps
}: ParagraphProps) {
  return (
    <tr>
      <td
        {...restProps}
        style={{
          paddingBottom,
          paddingTop,
          fontWeight,
          textDecoration,
          fontSize,
          textAlign,
          ...style,
        }}
      >
        {children}
      </td>
    </tr>
  );
}
