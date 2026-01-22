import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

type QuestionType = 'multiple-choice' | 'essay';

interface QuestionFormProps {
  onAddQuestion: (question: any) => void;
}

export function QuestionForm({ onAddQuestion }: QuestionFormProps) {
  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice');
  const [questionText, setQuestionText] = useState('');
  const [points, setPoints] = useState('1.0');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState<number>(0);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctOption >= newOptions.length) {
        setCorrectOption(newOptions.length - 1);
      }
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const question = {
      id: Date.now().toString(),
      type: questionType,
      text: questionText,
      points: parseFloat(points),
      options: questionType === 'multiple-choice' ? options.filter(o => o.trim() !== '') : undefined,
      correctOption: questionType === 'multiple-choice' ? correctOption : undefined,
    };

    onAddQuestion(question);
    
    // Reset form
    setQuestionText('');
    setPoints('1.0');
    setOptions(['', '', '', '']);
    setCorrectOption(0);
  };

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

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border-2 border-[#F29900]/20">
      <h2 className="text-[#1A73E8] mb-4">Nova Questão</h2>
      
      <div className="mb-4">
        <label className="block text-[#000000] mb-2">Tipo de Questão</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="multiple-choice"
              checked={questionType === 'multiple-choice'}
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
              className="accent-[#1A73E8]"
            />
            <span>Múltipla Escolha</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="essay"
              checked={questionType === 'essay'}
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
              className="accent-[#1A73E8]"
            />
            <span>Dissertativa</span>
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[#000000] mb-2">
          Enunciado da Questão
          <span className="text-sm text-[#F29900] ml-2">(Use $ para LaTeX: $x^2$)</span>
        </label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full p-3 border-2 border-[#1A73E8]/30 rounded-lg focus:border-[#1A73E8] focus:outline-none min-h-[100px]"
          placeholder="Ex: Calcule a raiz quadrada de $x^2 + 2x + 1$"
          required
        />
        {questionText && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Preview:</p>
            <div className="text-[#000000]">{renderLatex(questionText)}</div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-[#000000] mb-2">Pontuação</label>
        <input
          type="number"
          step="0.5"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="w-32 p-3 border-2 border-[#1A73E8]/30 rounded-lg focus:border-[#1A73E8] focus:outline-none"
          min="0"
          required
        />
      </div>

      {questionType === 'multiple-choice' && (
        <div className="mb-4">
          <label className="block text-[#000000] mb-2">Alternativas</label>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="radio"
                checked={correctOption === index}
                onChange={() => setCorrectOption(index)}
                className="mt-3 accent-[#F29900]"
                title="Marcar como correta"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 p-3 border-2 border-[#1A73E8]/30 rounded-lg focus:border-[#1A73E8] focus:outline-none"
                placeholder={`Alternativa ${String.fromCharCode(65 + index)} (use $ para LaTeX)`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-2 text-[#1A73E8] hover:text-[#F29900] mt-2"
          >
            <Plus size={20} />
            Adicionar Alternativa
          </button>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-[#F29900] text-white py-3 rounded-lg hover:bg-[#d88600] transition-colors"
      >
        Adicionar Questão
      </button>
    </form>
  );
}
