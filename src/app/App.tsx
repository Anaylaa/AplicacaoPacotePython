import { useState } from 'react';
import { FileText, ListChecks, Settings, Eye } from 'lucide-react';
import { QuestionForm } from './components/question-form';
import { QuestionList } from './components/question-list';
import { ExamSettingsForm } from './components/exam-settings';
import { ExamPreview } from './components/exam-preview';
import '../styles/katex.css';

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

type Tab = 'create' | 'questions' | 'settings' | 'preview';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examSettings, setExamSettings] = useState<ExamSettings>({
    professorName: '',
    universityName: '',
    course: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    duration: '120 minutos',
    logoUrl: '',
  });

  const handleAddQuestion = (question: Question) => {
    setQuestions([...questions, question]);
    setActiveTab('questions');
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const tabs = [
    { id: 'create' as Tab, label: 'Criar Questão', icon: FileText },
    { id: 'questions' as Tab, label: 'Banco de Questões', icon: ListChecks, badge: questions.length },
    { id: 'settings' as Tab, label: 'Configurações', icon: Settings },
    { id: 'preview' as Tab, label: 'Visualizar Prova', icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A73E8]/10 via-white to-[#F29900]/10">
      <div className="print:hidden">
        {/* Header */}
        <header className="bg-white border-b-4 border-[#F29900] shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#1A73E8] p-3 rounded-lg">
                <FileText className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-[#1A73E8]">Sistema de Criação de Provas</h1>
                <p className="text-gray-600 text-sm">
                  Crie questões objetivas e subjetivas com suporte a LaTeX
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-4 transition-colors relative ${
                      activeTab === tab.id
                        ? 'border-[#F29900] text-[#1A73E8] bg-[#F29900]/5'
                        : 'border-transparent text-gray-600 hover:text-[#1A73E8] hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#F29900] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <QuestionForm onAddQuestion={handleAddQuestion} />
              <div className="bg-gradient-to-br from-[#1A73E8]/5 to-[#F29900]/5 p-8 rounded-lg border-2 border-dashed border-[#1A73E8]/30">
                <h3 className="text-[#1A73E8] mb-4">Como usar LaTeX</h3>
                <div className="space-y-4 text-sm">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 mb-2">Inline (dentro do texto):</p>
                    <code className="block bg-gray-100 p-2 rounded text-[#F29900]">
                      $x^2 + y^2 = r^2$
                    </code>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 mb-2">Display (centralizado):</p>
                    <code className="block bg-gray-100 p-2 rounded text-[#F29900]">
                      $$\int_0^\infty e^{"{-x^2}"} dx = \frac{"{\\sqrt{\\pi}}"}{"{2}"}$$
                    </code>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 mb-2">Exemplos comuns:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Frações: <code className="text-[#F29900]">$\frac{"{a}"}{"{b}"}$</code></li>
                      <li>Raiz: <code className="text-[#F29900]">$\sqrt{"{x}"}$</code></li>
                      <li>Somatório: <code className="text-[#F29900]">$\sum_{"{i=1}"}^{"{n}"}$</code></li>
                      <li>Integral: <code className="text-[#F29900]">$\int_a^b f(x)dx$</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <QuestionList questions={questions} onDeleteQuestion={handleDeleteQuestion} />
          )}

          {activeTab === 'settings' && (
            <ExamSettingsForm settings={examSettings} onUpdateSettings={setExamSettings} />
          )}

          {activeTab === 'preview' && (
            <ExamPreview questions={questions} settings={examSettings} />
          )}
        </main>
      </div>

      {/* Print View */}
      <div className="hidden print:block">
        <ExamPreview questions={questions} settings={examSettings} />
      </div>
    </div>
  );
}
