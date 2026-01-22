import { useState } from 'react';
import { Upload, Eye } from 'lucide-react';

interface ExamSettings {
  professorName: string;
  universityName: string;
  course: string;
  subject: string;
  date: string;
  duration: string;
  logoUrl: string;
}

interface ExamSettingsProps {
  settings: ExamSettings;
  onUpdateSettings: (settings: ExamSettings) => void;
}

export function ExamSettingsForm({ settings, onUpdateSettings }: ExamSettingsProps) {
  const [localSettings, setLocalSettings] = useState<ExamSettings>(settings);
  const [showLogoPreview, setShowLogoPreview] = useState(false);

  const handleChange = (field: keyof ExamSettings, value: string) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-[#1A73E8]/20">
      <h2 className="text-[#1A73E8] mb-4">Configurações da Prova</h2>
      
      {/* Logo Section */}
      <div className="mb-6 p-4 bg-gradient-to-br from-[#1A73E8]/5 to-[#F29900]/5 rounded-lg border-2 border-[#1A73E8]/20">
        <label className="block text-[#000000] mb-2 font-semibold">Logo da Instituição</label>
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <input
              type="url"
              value={localSettings.logoUrl}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              className="w-full p-3 border-2 border-[#1A73E8]/30 rounded-lg focus:border-[#1A73E8] focus:outline-none"
              placeholder="https://exemplo.com/logo.png"
            />
            <p className="text-sm text-gray-600 mt-1">
              Cole a URL da imagem do logo (PNG, JPG ou SVG)
            </p>
          </div>
          {localSettings.logoUrl && (
            <button
              onClick={() => setShowLogoPreview(!showLogoPreview)}
              className="flex items-center gap-2 px-4 py-3 bg-[#F29900] text-white rounded-lg hover:bg-[#d88600] transition-colors"
            >
              <Eye size={20} />
              {showLogoPreview ? 'Ocultar' : 'Prévia'}
            </button>
          )}
        </div>
        {showLogoPreview && localSettings.logoUrl && (
          <div className="mt-4 p-4 bg-white border-2 border-[#1A73E8]/20 rounded-lg flex items-center justify-center">
            <img
              src={localSettings.logoUrl}
              alt="Logo Preview"
              className="max-h-32 max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '';
                e.currentTarget.alt = 'Erro ao carregar imagem';
              }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#000000] mb-2">Nome da Instituição</label>
          <input
            type="text"
            value={localSettings.universityName}
            onChange={(e) => handleChange('universityName', e.target.value)}
            className="w-full p-3 border-2 border-[#1A73E8]/30 rounded-lg focus:border-[#1A73E8] focus:outline-none"
            placeholder="Universidade Federal / Colégio..."
          />
        </div>

        <div>
          <label className="block text-[#000000] mb-2">Nome do Professor</label>
          <input
            type="text"
            value={localSettings.professorName}
            onChange={(e) => handleChange('professorName', e.target.value)}
            className="w-full p-3 border-2 border-[#1A73E8]/30 rounded-lg focus:border-[#1A73E8] focus:outline-none"
            placeholder="Prof. João Silva"
          />
        </div>

        <div>
          <label className="block text-[#000000] mb-2">Curso / Série</label>
          <input
            type="text"
            value={localSettings.course}
            onChange={(e) => handleChange('course', e.target.value)}
            className="w-full p-3 border-2 border-[#1A73E8]/30 rounded-lg focus:border-[#1A73E8] focus:outline-none"
            placeholder="Engenharia / 3º Ano..."
          />
        </div>

        <div>
          <label className="block text-[#000000] mb-2">Disciplina</label>
          <input
            type="text"
            value={localSettings.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="w-full p-3 border-2 border-[#1A73E8]/30 rounded-lg focus:border-[#1A73E8] focus:outline-none"
            placeholder="Cálculo I / Matemática..."
          />
        </div>

        <div>
          <label className="block text-[#000000] mb-2">Data da Prova</label>
          <input
            type="date"
            value={localSettings.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full p-3 border-2 border-[#1A73E8]/30 rounded-lg focus:border-[#1A73E8] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[#000000] mb-2">Duração</label>
          <input
            type="text"
            value={localSettings.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            className="w-full p-3 border-2 border-[#1A73E8]/30 rounded-lg focus:border-[#1A73E8] focus:outline-none"
            placeholder="120 minutos / 2 horas..."
          />
        </div>
      </div>
    </div>
  );
}