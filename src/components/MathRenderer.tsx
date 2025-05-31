import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  latex: string;
  block?: boolean;
  className?: string;
  errorColor?: string;
  renderError?: (error: Error) => React.ReactNode;
  settings?: {
    throwOnError: boolean;
    errorColor: string;
    macros: Record<string, string>;
    colorIsTextColor: boolean;
    maxSize: number;
    maxExpand: number;
    minRuleThickness: number;
    strict: boolean;
  };
}

const defaultSettings = {
  throwOnError: false,
  errorColor: '#cc0000',
  macros: {
    '\\RR': '\\mathbb{R}',
    '\\NN': '\\mathbb{N}',
    '\\ZZ': '\\mathbb{Z}',
    '\\QQ': '\\mathbb{Q}',
    '\\CC': '\\mathbb{C}',
    '\\vec': '\\mathbf',
    '\\mat': '\\mathbf',
    '\\diff': '\\mathrm{d}',
    '\\degree': '^\\circ',
    '\\eps': '\\varepsilon',
    '\\phi': '\\varphi',
    '\\ket': '|#1\\rangle',
    '\\bra': '\\langle#1|',
    '\\braket': '\\langle#1|#2\\rangle',
    '\\ketbra': '|#1\\rangle\\langle#2|',
    '\\trace': '\\mathrm{Tr}',
    '\\expect': '\\langle#1\\rangle',
    '\\complex': '{\\mathbb{C}}',
    '\\real': '{\\mathbb{R}}',
    '\\integer': '{\\mathbb{Z}}',
    '\\natural': '{\\mathbb{N}}',
    '\\rational': '{\\mathbb{Q}}'
  },
  colorIsTextColor: false,
  maxSize: 500,
  maxExpand: 1000,
  minRuleThickness: 0.05,
  strict: false
};

export function MathRenderer({ 
  latex, 
  block = false, 
  className = '',
  errorColor = '#cc0000',
  renderError,
  settings = defaultSettings
}: MathRendererProps) {
  if (!latex) return null;
  
  const handleError = (error: Error) => {
    console.error('LaTeX rendering error:', error);
    if (renderError) {
      return renderError(error);
    }
    return (
      <span style={{ color: errorColor }}>
        Failed to render equation: {error.message}
      </span>
    );
  };
  
  try {
    const mathProps = {
      math: latex,
      errorColor,
      renderError: handleError,
      settings: {
        ...defaultSettings,
        ...settings,
      }
    };

    return block ? (
      <div className={`my-2 ${className}`}>
        <BlockMath {...mathProps} />
      </div>
    ) : (
      <span className={`inline-block align-middle ${className}`}>
        <InlineMath {...mathProps} />
      </span>
    );
  } catch (error) {
    return handleError(error as Error);
  }
}