import { Trash2, Edit2 } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface Question {
  id: string;
  type: 'multiple-choice' | 'essay';
  text: string;
  points: number;
  options?: string[];
  correctOption?: number;
}

interface QuestionListProps {
  questions: Question[];
  onDeleteQuestion: (id: string) => void;
}

export function QuestionList({ questions, onDeleteQuestion }: QuestionListProps) {
  const renderLatex = (text: string) => {
    const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return (
          <div key={index} className="my-2">
            <InlineMath math={part.slice(2, -2)} />
          </div>
        );
      } else if (part.startsWith('$') && part.endsWith('$')) {
        return <InlineMath key={index} math={part.slice(1, -1)} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md border-2 border-[#1A73E8]/20 text-center">
        <p className="text-gray-500">Nenhuma questão adicionada ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="bg-white p-6 rounded-lg shadow-md border-2 border-[#F29900]/20 hover:border-[#F29900]/50 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#1A73E8] text-white px-3 py-1 rounded-full">
                  Q{index + 1}
                </span>
                <span className="bg-[#F29900] text-white px-3 py-1 rounded-full">
                  {question.points} pts
                </span>
                <span className="text-sm text-gray-600">
                  {question.type === 'multiple-choice' ? 'Múltipla Escolha' : 'Dissertativa'}
                </span>
              </div>
              <div className="text-[#000000] mt-3">{renderLatex(question.text)}</div>
            </div>
            <button
              onClick={() => onDeleteQuestion(question.id)}
              className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
              title="Excluir questão"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {question.type === 'multiple-choice' && question.options && (
            <div className="mt-4 space-y-2">
              {question.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`p-3 rounded-lg border-2 ${
                    optIndex === question.correctOption
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="font-semibold mr-2">
                    {String.fromCharCode(65 + optIndex)})
                  </span>
                  {renderLatex(option)}
                  {optIndex === question.correctOption && (
                    <span className="ml-2 text-green-600 text-sm">✓ Correta</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
