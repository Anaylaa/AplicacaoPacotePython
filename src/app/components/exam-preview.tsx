import { useState } from 'react';
import { Printer, Shuffle, Plus, Trash2, Settings2 } from 'lucide-react';
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

interface ExamSettings {
  professorName: string;
  universityName: string;
  course: string;
  subject: string;
  date: string;
  duration: string;
  logoUrl: string;
}

interface ExamVersion {
  id: string;
  code: string;
  questions: Question[];
}

type ShuffleMode = 'both' | 'questions' | 'options';

interface ExamPreviewProps {
  questions: Question[];
  settings: ExamSettings;
}

export function ExamPreview({ questions, settings }: ExamPreviewProps) {
  const [versions, setVersions] = useState<ExamVersion[]>([]);
  const [numberOfVersions, setNumberOfVersions] = useState(2);
  const [shuffleMode, setShuffleMode] = useState<ShuffleMode>('both');
  const [showSettings, setShowSettings] = useState(false);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateVersion = (versionIndex: number) => {
    const versionCode = String.fromCharCode(65 + versionIndex); // A, B, C, etc.
    
    let processedQuestions = [...questions];
    
    // Embaralhar questões se necessário
    if (shuffleMode === 'both' || shuffleMode === 'questions') {
      processedQuestions = shuffleArray(processedQuestions);
    }
    
    // Embaralhar alternativas se necessário
    if (shuffleMode === 'both' || shuffleMode === 'options') {
      processedQuestions = processedQuestions.map(q => {
        if (q.type === 'multiple-choice' && q.options) {
          const optionsWithIndex = q.options.map((opt, idx) => ({ opt, idx }));
          const shuffledOptions = shuffleArray(optionsWithIndex);
          const newCorrectOption = shuffledOptions.findIndex(
            item => item.idx === q.correctOption
          );
          return {
            ...q,
            options: shuffledOptions.map(item => item.opt),
            correctOption: newCorrectOption,
          };
        }
        return q;
      });
    } else {
      // Se não embaralhar opções, apenas copiar as questões
      processedQuestions = processedQuestions.map(q => ({ ...q }));
    }

    const newVersion: ExamVersion = {
      id: `${Date.now()}-${versionIndex}`,
      code: versionCode,
      questions: processedQuestions,
    };

    return newVersion;
  };

  const generateMultipleVersions = () => {
    const newVersions: ExamVersion[] = [];
    for (let i = 0; i < numberOfVersions; i++) {
      newVersions.push(generateVersion(i));
    }
    setVersions(newVersions);
  };

  const removeVersion = (id: string) => {
    const newVersions = versions.filter(v => v.id !== id);
    // Renomear os códigos das versões
    const renamedVersions = newVersions.map((v, index) => ({
      ...v,
      code: String.fromCharCode(65 + index),
    }));
    setVersions(renamedVersions);
  };

  const removeAllVersions = () => {
    setVersions([]);
  };

  const handlePrint = () => {
    window.print();
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

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const hasOnlyObjective = questions.length > 0 && questions.every(q => q.type === 'multiple-choice');

  if (questions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md border-2 border-[#1A73E8]/20 text-center">
        <p className="text-gray-500">Adicione questões para visualizar a prova.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="print:hidden mb-6">
        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-[#F29900]/20 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1A73E8]">Gerenciador de Versões</h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-[#1A73E8] hover:text-[#F29900] transition-colors"
            >
              <Settings2 size={20} />
              {showSettings ? 'Ocultar' : 'Configurar'}
            </button>
          </div>

          {showSettings && (
            <div className="mb-6 p-4 bg-[#1A73E8]/5 rounded-lg border-2 border-[#1A73E8]/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#000000] mb-2">
                    Número de versões para gerar
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="26"
                    value={numberOfVersions}
                    onChange={(e) => setNumberOfVersions(Math.min(26, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full p-3 border-2 border-[#1A73E8]/30 rounded-lg focus:border-[#1A73E8] focus:outline-none"
                  />
                  <p className="text-sm text-gray-600 mt-1">Máximo: 26 versões (A-Z)</p>
                </div>

                <div>
                  <label className="block text-[#000000] mb-2">
                    Tipo de embaralhamento
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="both"
                        checked={shuffleMode === 'both'}
                        onChange={(e) => setShuffleMode(e.target.value as ShuffleMode)}
                        className="accent-[#F29900]"
                      />
                      <span>Embaralhar questões E alternativas</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="questions"
                        checked={shuffleMode === 'questions'}
                        onChange={(e) => setShuffleMode(e.target.value as ShuffleMode)}
                        className="accent-[#F29900]"
                      />
                      <span>Apenas questões</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="options"
                        checked={shuffleMode === 'options'}
                        onChange={(e) => setShuffleMode(e.target.value as ShuffleMode)}
                        className="accent-[#F29900]"
                      />
                      <span>Apenas alternativas</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 items-center mb-4">
            <button
              onClick={generateMultipleVersions}
              className="flex items-center gap-2 bg-[#1A73E8] text-white px-6 py-3 rounded-lg hover:bg-[#1557b0] transition-colors font-semibold"
            >
              <Shuffle size={20} />
              Gerar {numberOfVersions} {numberOfVersions === 1 ? 'Versão' : 'Versões'}
            </button>
            {versions.length > 0 && (
              <>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-[#F29900] text-white px-6 py-3 rounded-lg hover:bg-[#d88600] transition-colors font-semibold"
                >
                  <Printer size={20} />
                  Imprimir Todas
                </button>
                <button
                  onClick={removeAllVersions}
                  className="flex items-center gap-2 border-2 border-red-500 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={20} />
                  Limpar Tudo
                </button>
              </>
            )}
          </div>

          {versions.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {versions.length} {versions.length === 1 ? 'versão gerada' : 'versões geradas'}:
              </p>
              <div className="flex flex-wrap gap-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center gap-2 bg-[#F29900]/10 border-2 border-[#F29900] px-4 py-2 rounded-lg"
                  >
                    <span className="font-semibold text-[#1A73E8]">Versão {version.code}</span>
                    <button
                      onClick={() => removeVersion(version.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Remover esta versão"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasOnlyObjective && versions.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
              <p className="text-green-800 font-semibold">
                ✓ Gabaritos serão gerados automaticamente para cada versão
              </p>
              <p className="text-sm text-green-700 mt-1">
                Total de páginas para impressão: {versions.length * 2} ({versions.length} provas + {versions.length} gabaritos)
              </p>
            </div>
          )}

          {!hasOnlyObjective && versions.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
              <p className="text-blue-800">
                ℹ️ Esta prova contém questões subjetivas. Gabaritos não serão gerados automaticamente.
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        {versions.length === 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
            <p className="text-yellow-800">
              <strong>Dica:</strong> Configure o número de versões e o tipo de embaralhamento, depois clique em "Gerar Versões".
              {hasOnlyObjective && ' Gabaritos serão criados automaticamente!'}
            </p>
          </div>
        )}
      </div>

      {/* Print Content */}
      <div className="print:block">
        {versions.map((version, versionIndex) => (
          <div key={version.id}>
            {/* Exam Page */}
            <div className={`bg-white p-8 rounded-lg shadow-md border-2 border-[#1A73E8]/20 mb-8 print:shadow-none print:border-0 ${versionIndex > 0 ? 'print:break-before-page' : ''}`}>
              {/* Header */}
              <div className="border-b-4 border-[#1A73E8] pb-6 mb-8">
                {/* Logo and Institution */}
                <div className="flex items-start gap-6 mb-6">
                  {settings.logoUrl && (
                    <div className="shrink-0">
                      <img
                        src={settings.logoUrl}
                        alt="Logo da Instituição"
                        className="h-24 w-24 object-contain border-2 border-[#1A73E8]/20 rounded-lg p-2"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 text-center">
                    <h1 className="text-2xl text-[#1A73E8] font-bold mb-1 uppercase tracking-wide">
                      {settings.universityName || 'Nome da Instituição'}
                    </h1>
                    <div className="h-1 w-32 bg-[#F29900] mx-auto mb-3"></div>
                    <h2 className="text-lg text-[#000000] font-semibold">
                      {settings.course || 'Curso/Série'}
                    </h2>
                    <h3 className="text-base text-gray-700 mt-1">
                      {settings.subject || 'Disciplina'}
                    </h3>
                  </div>
                  {settings.logoUrl && <div className="h-24 w-24 shrink-0" />}
                </div>

                {/* Version Badge */}
                <div className="text-center mb-6">
                  <span className="inline-block bg-gradient-to-r from-[#F29900] to-[#d88600] text-white px-8 py-3 rounded-full text-2xl font-bold shadow-lg">
                    VERSÃO {version.code}
                  </span>
                </div>

                {/* Exam Info */}
                <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-gray-600">Professor(a)</p>
                    <p className="font-semibold text-[#1A73E8]">{settings.professorName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Data</p>
                    <p className="font-semibold text-[#1A73E8]">
                      {settings.date ? new Date(settings.date).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      }) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duração</p>
                    <p className="font-semibold text-[#1A73E8]">{settings.duration || '-'}</p>
                  </div>
                </div>

                {/* Student Info */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="font-semibold text-gray-700 w-32">Nome do Aluno:</label>
                    <div className="flex-1 border-b-2 border-dotted border-gray-400 pb-1"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="font-semibold text-gray-700 w-32">Matrícula/RA:</label>
                    <div className="w-64 border-b-2 border-dotted border-gray-400 pb-1"></div>
                    <label className="font-semibold text-gray-700 ml-auto mr-3">Pontuação:</label>
                    <div className="w-20 border-2 border-[#F29900] rounded-lg h-10"></div>
                    <span className="text-gray-600">/ {totalPoints.toFixed(1)}</span>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="mt-6 bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
                  <p className="text-red-800 font-bold flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    ATENÇÃO: Marque a VERSÃO <span className="bg-red-600 text-white px-3 py-1 rounded">{version.code}</span> no cartão resposta
                  </p>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-8">
                {version.questions.map((question, index) => (
                  <div key={question.id} className="border-l-4 border-[#1A73E8] pl-4">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        <div className="bg-gradient-to-br from-[#1A73E8] to-[#1557b0] text-white w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg shadow-md">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-[#000000] flex-1 text-base leading-relaxed">
                            {renderLatex(question.text)}
                          </div>
                          <div className="ml-4 shrink-0">
                            <span className="inline-block bg-[#F29900] text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {question.points.toFixed(1)} {question.points === 1 ? 'ponto' : 'pontos'}
                            </span>
                          </div>
                        </div>

                        {question.type === 'multiple-choice' && question.options && (
                          <div className="mt-4 space-y-3">
                            {question.options.map((option, optIndex) => (
                              <div 
                                key={optIndex} 
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                              >
                                <div className="shrink-0 w-8 h-8 rounded-full border-2 border-[#1A73E8] flex items-center justify-center font-bold text-[#1A73E8]">
                                  {String.fromCharCode(65 + optIndex)}
                                </div>
                                <div className="flex-1 pt-1">{renderLatex(option)}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === 'essay' && (
                          <div className="mt-4">
                            <div className="border-2 border-gray-300 rounded-lg p-4 min-h-[200px] bg-gradient-to-br from-white to-gray-50">
                              <div className="space-y-3">
                                {[...Array(8)].map((_, i) => (
                                  <div key={i} className="border-b border-gray-300 h-6"></div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-12 pt-6 border-t-4 border-[#F29900]">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>Total de questões: <strong>{version.questions.length}</strong></p>
                    <p>Pontuação total: <strong>{totalPoints.toFixed(1)} pontos</strong></p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-[#1A73E8]">Boa prova!</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {settings.universityName && `${settings.universityName} - `}
                      {settings.date && new Date(settings.date).getFullYear()}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 text-right">
                    <p>Versão: <strong>{version.code}</strong></p>
                    <p className="text-xs text-gray-500">Não rasure o cartão</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Answer Key (only for objective questions) */}
            {hasOnlyObjective && (
              <div className="bg-white p-8 rounded-lg shadow-md border-2 border-[#F29900]/20 mb-8 print:shadow-none print:border-0 print:break-before-page">
                {/* Header */}
                <div className="border-b-4 border-[#F29900] pb-6 mb-6">
                  <div className="flex items-start gap-6">
                    {settings.logoUrl && (
                      <div className="shrink-0">
                        <img
                          src={settings.logoUrl}
                          alt="Logo da Instituição"
                          className="h-20 w-20 object-contain border-2 border-[#F29900]/20 rounded-lg p-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 text-center">
                      <h1 className="text-2xl text-[#F29900] font-bold mb-2 uppercase tracking-wide">
                        GABARITO OFICIAL
                      </h1>
                      <div className="h-1 w-32 bg-[#1A73E8] mx-auto mb-3"></div>
                      <h2 className="text-xl text-[#1A73E8] font-bold">
                        VERSÃO {version.code}
                      </h2>
                      <h3 className="text-lg text-gray-700 mt-2">{settings.subject}</h3>
                    </div>
                    {settings.logoUrl && <div className="h-20 w-20 shrink-0" />}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-gray-600">Professor(a)</p>
                      <p className="font-semibold text-[#1A73E8]">{settings.professorName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Data</p>
                      <p className="font-semibold text-[#1A73E8]">
                        {settings.date ? new Date(settings.date).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric' 
                        }) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Answer Grid */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#1A73E8] mb-4 flex items-center gap-2">
                    <span className="bg-[#1A73E8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">✓</span>
                    Respostas Corretas
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {version.questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="bg-gradient-to-br from-[#F29900]/10 to-[#F29900]/5 border-2 border-[#F29900] rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                      >
                        <div className="text-xs text-gray-600 mb-1">Questão</div>
                        <div className="bg-[#1A73E8] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">
                          {index + 1}
                        </div>
                        <div className="text-3xl font-bold text-[#F29900]">
                          {String.fromCharCode(65 + (question.correctOption || 0))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Total de Questões</p>
                    <p className="text-3xl font-bold text-blue-600">{version.questions.length}</p>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Pontuação Total</p>
                    <p className="text-3xl font-bold text-orange-600">{totalPoints.toFixed(1)}</p>
                  </div>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Versão da Prova</p>
                    <p className="text-3xl font-bold text-purple-600">{version.code}</p>
                  </div>
                </div>

                {/* Configuration Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Informações da Configuração</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Tipo de embaralhamento:</span>
                      <span className="ml-2 font-semibold text-[#1A73E8]">
                        {shuffleMode === 'both' && 'Questões e Alternativas'}
                        {shuffleMode === 'questions' && 'Apenas Questões'}
                        {shuffleMode === 'options' && 'Apenas Alternativas'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Instituição:</span>
                      <span className="ml-2 font-semibold text-[#1A73E8]">
                        {settings.universityName || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Reference Table */}
                <div className="bg-[#1A73E8]/5 border-2 border-[#1A73E8] rounded-lg p-4">
                  <h4 className="text-[#1A73E8] font-semibold mb-3 flex items-center gap-2">
                    <span>📋</span>
                    Referência Rápida
                  </h4>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2 text-sm">
                    {version.questions.map((_, index) => (
                      <div key={index} className="text-center bg-white rounded p-2 border border-[#1A73E8]/20">
                        <div className="text-xs text-gray-600">{index + 1}</div>
                        <div className="font-bold text-[#F29900]">
                          {String.fromCharCode(65 + (version.questions[index].correctOption || 0))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t-2 border-[#F29900] text-center">
                  <p className="text-xs text-gray-500">
                    Gabarito gerado automaticamente - Versão {version.code} - {settings.universityName}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Preview without versions */}
        {versions.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md border-2 border-[#1A73E8]/20 print:hidden">
            <div className="border-b-2 border-[#1A73E8] pb-6 mb-6">
              <div className="flex justify-between items-start">
                {settings.logoUrl && (
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    className="h-16 w-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 text-center">
                  <h1 className="text-[#1A73E8] mb-2">{settings.universityName}</h1>
                  <h2 className="text-[#000000]">{settings.course}</h2>
                  <h3 className="text-[#000000]">{settings.subject}</h3>
                </div>
                {settings.logoUrl && <div className="h-16 w-16" />}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Professor:</strong> {settings.professorName}</p>
                  <p><strong>Data:</strong> {settings.date ? new Date(settings.date).toLocaleDateString('pt-BR') : '-'}</p>
                </div>
                <div>
                  <p><strong>Duração:</strong> {settings.duration}</p>
                  <p><strong>Pontuação Total:</strong> {totalPoints.toFixed(1)} pontos</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p><strong>Nome do Aluno:</strong> _________________________________________</p>
                <p className="mt-2"><strong>Matrícula:</strong> _____________________</p>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="bg-[#1A73E8] text-white px-3 py-1 rounded-full shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-[#000000] flex-1">{renderLatex(question.text)}</div>
                        <span className="text-[#F29900] ml-4 shrink-0">
                          ({question.points.toFixed(1)} pts)
                        </span>
                      </div>

                      {question.type === 'multiple-choice' && question.options && (
                        <div className="mt-4 space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-start gap-2">
                              <span className="shrink-0 w-6">
                                {String.fromCharCode(65 + optIndex)})
                              </span>
                              <div className="flex-1">{renderLatex(option)}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'essay' && (
                        <div className="mt-4">
                          <div className="border border-gray-300 rounded p-4 min-h-[150px]">
                            <p className="text-gray-400 text-sm">Espaço para resposta</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-[#F29900] text-center text-sm text-gray-600">
              <p>Boa prova!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}