import React, { useState } from 'react';
import { MathRenderer } from './MathRenderer';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface LatexHelperProps {
  onInsert: (latex: string) => void;
}

interface LatexTemplate {
  category: string;
  items: {
    name: string;
    latex: string;
    description?: string;
  }[];
}

const templates: LatexTemplate[] = [
  {
    category: 'Basic Math',
    items: [
      { name: 'Fraction', latex: '\\frac{a}{b}', description: 'Basic fraction' },
      { name: 'Square Root', latex: '\\sqrt{x}', description: 'Square root' },
      { name: 'Nth Root', latex: '\\sqrt[n]{x}', description: 'Nth root' },
      { name: 'Power', latex: 'x^{n}', description: 'Power/exponent' },
      { name: 'Subscript', latex: 'x_{i}', description: 'Subscript' },
      { name: 'Sum', latex: '\\sum_{i=1}^{n} x_i', description: 'Summation' },
      { name: 'Product', latex: '\\prod_{i=1}^{n} x_i', description: 'Product' },
    ]
  },
  {
    category: 'Calculus',
    items: [
      { name: 'Derivative', latex: '\\frac{\\diff y}{\\diff x}', description: 'Basic derivative' },
      { name: 'Partial Derivative', latex: '\\frac{\\partial f}{\\partial x}', description: 'Partial derivative' },
      { name: 'Integral', latex: '\\int_{a}^{b} f(x) \\diff x', description: 'Definite integral' },
      { name: 'Double Integral', latex: '\\iint_{D} f(x,y) \\diff x\\diff y', description: 'Double integral' },
      { name: 'Triple Integral', latex: '\\iiint_{V} f(x,y,z) \\diff x\\diff y\\diff z', description: 'Triple integral' },
      { name: 'Limit', latex: '\\lim_{x \\to a} f(x)', description: 'Limit' },
    ]
  },
  {
    category: 'Linear Algebra',
    items: [
      { name: 'Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', description: '2x2 matrix' },
      { name: 'Determinant', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', description: 'Determinant' },
      { name: 'Vector', latex: '\\vec{v} = \\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}', description: 'Column vector' },
      { name: 'Inner Product', latex: '\\langle \\vec{u}, \\vec{v} \\rangle', description: 'Inner product' },
    ]
  },
  {
    category: 'Sets and Logic',
    items: [
      { name: 'Set', latex: '\\{x \\in \\RR : x > 0\\}', description: 'Set definition' },
      { name: 'Union', latex: 'A \\cup B', description: 'Set union' },
      { name: 'Intersection', latex: 'A \\cap B', description: 'Set intersection' },
      { name: 'Subset', latex: 'A \\subseteq B', description: 'Subset' },
      { name: 'For All', latex: '\\forall x \\in X', description: 'Universal quantifier' },
      { name: 'Exists', latex: '\\exists x \\in X', description: 'Existential quantifier' },
    ]
  },
  {
    category: 'Greek Letters',
    items: [
      { name: 'Alpha', latex: '\\alpha', description: 'α' },
      { name: 'Beta', latex: '\\beta', description: 'β' },
      { name: 'Gamma', latex: '\\gamma', description: 'γ' },
      { name: 'Delta', latex: '\\delta', description: 'δ' },
      { name: 'Epsilon', latex: '\\epsilon', description: 'ε' },
      { name: 'Theta', latex: '\\theta', description: 'θ' },
      { name: 'Pi', latex: '\\pi', description: 'π' },
      { name: 'Sigma', latex: '\\sigma', description: 'σ' },
      { name: 'Phi', latex: '\\phi', description: 'φ' },
      { name: 'Omega', latex: '\\omega', description: 'ω' },
    ]
  },
  {
    category: 'Physics',
    items: [
      { name: 'Vector Field', latex: '\\vec{E}(\\vec{r})', description: 'Vector field' },
      { name: 'Gradient', latex: '\\nabla f', description: 'Gradient' },
      { name: 'Divergence', latex: '\\nabla \\cdot \\vec{F}', description: 'Divergence' },
      { name: 'Curl', latex: '\\nabla \\times \\vec{F}', description: 'Curl' },
      { name: 'Laplacian', latex: '\\nabla^2 f', description: 'Laplacian' },
      { name: 'Quantum State', latex: '|\\psi\\rangle', description: 'Quantum state (ket)' },
      { name: 'Expectation', latex: '\\langle \\hat{A} \\rangle', description: 'Quantum expectation value' },
    ]
  }
];

export function LatexHelper({ onInsert }: LatexHelperProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleCopy = async (latex: string) => {
    try {
      await navigator.clipboard.writeText(latex);
      setCopiedStates(prev => ({ ...prev, [latex]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [latex]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const filteredTemplates = templates.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.latex.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search LaTeX templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="space-y-4">
        {filteredTemplates.map((category) => (
          <div key={category.category} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleCategory(category.category)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg"
            >
              <span className="font-medium text-gray-900">{category.category}</span>
              {expandedCategories[category.category] ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {expandedCategories[category.category] && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 gap-3">
                  {category.items.map((item) => (
                    <div
                      key={item.latex}
                      className="border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCopy(item.latex)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Copy LaTeX"
                          >
                            {copiedStates[item.latex] ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => onInsert(item.latex)}
                            className="px-2 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                          >
                            Insert
                          </button>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        {item.description}
                      </div>

                      <div className="bg-gray-50 p-2 rounded">
                        <MathRenderer latex={item.latex} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}