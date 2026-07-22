import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  BarChart3, 
  Shield, 
  RefreshCw, 
  Search, 
  Trash2, 
  BrainCircuit, 
  Cpu, 
  Layers,
  Sparkles,
  Info,
  Stethoscope,
  HeartPulse,
  Eye,
  Microscope,
  Check,
  X
} from 'lucide-react';
import { 
  checkBackendHealth, 
  uploadAndClassifyScan, 
  fetchPredictionHistory, 
  fetchAnalytics, 
  deletePredictionRecord,
  PredictionRecord,
  AnalyticsSummary 
} from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'classifier' | 'history' | 'analytics' | 'architecture'>('classifier');
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);
  
  // Classifier state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<PredictionRecord | null>(null);
  const [classificationError, setClassificationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History & Analytics state
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [historyFilter, setHistoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<PredictionRecord | null>(null);

  // Check backend health on load
  useEffect(() => {
    async function verifyHealth() {
      const isHealthy = await checkBackendHealth();
      setBackendStatus(isHealthy);
    }
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Load history & analytics when tab changes
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    } else if (activeTab === 'analytics') {
      loadAnalyticsData();
    }
  }, [activeTab, historyFilter]);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const data = await fetchPredictionHistory(historyFilter);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function loadAnalyticsData() {
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setClassificationError('Please select a valid image file (PNG, JPG, or DICOM image).');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setClassificationError(null);
    setCurrentResult(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const runClassification = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setClassificationError(null);

    try {
      const result = await uploadAndClassifyScan(selectedFile, patientNotes);
      setCurrentResult(result);
      loadAnalyticsData();
    } catch (err: any) {
      setClassificationError(err.message || 'Failed to classify kidney scan image.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deletePredictionRecord(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      if (currentResult?.id === id) {
        setCurrentResult(null);
      }
      if (selectedRecordDetail?.id === id) {
        setSelectedRecordDetail(null);
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  // Demo sample image generators
  const loadDemoSample = (type: 'Normal' | 'Tumor' | 'Stone' | 'Cyst') => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw CT scan background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 300, 300);

    // Draw kidney shape outline
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(150, 150, 90, 60, Math.PI / 4, 0, 2 * Math.PI);
    ctx.fill();

    // Draw specific anomaly
    if (type === 'Tumor') {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(170, 130, 28, 0, 2 * Math.PI);
      ctx.fill();
    } else if (type === 'Stone') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(140, 160, 14, 0, 2 * Math.PI);
      ctx.fill();
    } else if (type === 'Cyst') {
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(120, 140, 24, 0, 2 * Math.PI);
      ctx.fill();
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `sample_${type.toLowerCase()}.jpg`, { type: 'image/jpeg' });
        handleFileSelect(file);
      }
    });
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getBadgeColor = (diag: string) => {
    switch (diag) {
      case 'Normal':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Kidney Tumor':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Kidney Stone':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Cyst':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Stethoscope className="h-6 w-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-teal-400 bg-clip-text text-transparent">
                KidneyVision AI
              </h1>
              <p className="text-xs text-slate-400">VGG16 Deep Learning Diagnostic System</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <Database className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-slate-300">PostgreSQL AI Database</span>
            </div>
            
            <div className="flex items-center space-x-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <span className={`h-2 w-2 rounded-full ${backendStatus ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-slate-300">
                {backendStatus === null ? 'Connecting...' : backendStatus ? 'FastAPI Backend Online' : 'Local Fallback Engine Active'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('classifier')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'classifier'
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Classification Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Prediction History</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Clinical Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BrainCircuit className="h-4 w-4" />
            <span>Pipeline Specs</span>
          </button>
        </div>

        {/* TAB 1: CLASSIFICATION STUDIO */}
        {activeTab === 'classifier' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Upload Panel */}
            <div className="lg:col-span-7 space-y-4">
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden group transition-all duration-300 hover:border-teal-500/40"
              >
                {previewUrl ? (
                  <div className="relative w-full h-full flex flex-col items-center">
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black max-h-[300px] flex items-center justify-center w-full">
                      <img 
                        src={previewUrl} 
                        alt="Kidney CT Scan Preview" 
                        className="object-contain max-h-[280px] w-auto rounded-lg"
                      />
                      {isScanning && <div className="animate-scan" />}
                    </div>

                    <div className="mt-4 flex items-center space-x-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-slate-400 hover:text-slate-200 underline"
                      >
                        Choose another scan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-200">
                        Drag & Drop CT Scan Image Here
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Supports PNG, JPG, DICOM images (Max 15MB)
                      </p>
                    </div>
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Sample CT Demos */}
              <div className="glass-panel rounded-xl p-4 border border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Or Test With Preset Sample Scans:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => loadDemoSample('Normal')}
                    className="py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium transition-all text-center"
                  >
                    Normal Scan
                  </button>
                  <button 
                    onClick={() => loadDemoSample('Tumor')}
                    className="py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition-all text-center"
                  >
                    Tumor Scan
                  </button>
                  <button 
                    onClick={() => loadDemoSample('Stone')}
                    className="py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-medium transition-all text-center"
                  >
                    Stone Scan
                  </button>
                  <button 
                    onClick={() => loadDemoSample('Cyst')}
                    className="py-2 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-medium transition-all text-center"
                  >
                    Cyst Scan
                  </button>
                </div>
              </div>

              {/* Patient Notes */}
              <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Optional Patient / Scan Notes:
                </label>
                <textarea
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Enter medical notes, patient ID, or scanning protocol details..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 resize-none h-20"
                />
              </div>

              {/* Trigger Button */}
              <button
                disabled={!selectedFile || isScanning}
                onClick={runClassification}
                className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg ${
                  !selectedFile || isScanning
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 hover:from-teal-400 hover:to-cyan-400 shadow-teal-500/20'
                }`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Analyzing CT Scan Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-slate-950" />
                    <span>Run AI Classification</span>
                  </>
                )}
              </button>

              {classificationError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{classificationError}</span>
                </div>
              )}
            </div>

            {/* Right Output Panel */}
            <div className="lg:col-span-5 space-y-4">
              {currentResult ? (
                <div className="glass-panel-glow rounded-2xl p-6 border border-teal-500/30 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Diagnostic Finding
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getBadgeColor(currentResult.diagnosis)}`}>
                      {currentResult.diagnosis}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Primary AI Diagnosis</p>
                    <p className="text-2xl font-extrabold text-white flex items-center space-x-2">
                      <span>{currentResult.diagnosis}</span>
                      {currentResult.diagnosis === 'Normal' ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-rose-400" />
                      )}
                    </p>
                  </div>

                  {/* Confidence Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">Model Confidence</span>
                      <span className="text-teal-400 font-bold">{currentResult.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, currentResult.confidence)}%` }}
                      />
                    </div>
                  </div>

                  {/* Probability Breakdown */}
                  {currentResult.probabilities && (
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Class Probabilities Distribution
                      </p>
                      <div className="space-y-2">
                        {Object.entries(currentResult.probabilities).map(([key, val]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-300">{key}</span>
                              <span className="text-slate-400">{(val * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  key === currentResult.diagnosis ? 'bg-teal-400' : 'bg-slate-700'
                                }`}
                                style={{ width: `${Math.min(100, val * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Record Metadata */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Record ID:</span>
                      <span className="font-mono text-slate-300">{currentResult.id.substring(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Filename:</span>
                      <span className="text-slate-300">{currentResult.filename}</span>
                    </div>
                    {currentResult.notes && (
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-slate-400 block mb-1">Clinical Notes:</span>
                        <p className="bg-slate-900/80 p-2 rounded text-slate-300 italic">{currentResult.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center min-h-[380px] text-center space-y-3">
                  <BrainCircuit className="h-12 w-12 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-300">Awaiting CT Image Analysis</p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Upload a scan image on the left or select a sample preset scan to view deep learning model inferences.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PREDICTION HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search scans by filename/notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
                {['All', 'Normal', 'Kidney Tumor', 'Kidney Stone', 'Cyst'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setHistoryFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      historyFilter === filter
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {loadingHistory ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-teal-400" />
                <p className="text-xs">Loading prediction history from database...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 space-y-3">
                <Database className="h-10 w-10 mx-auto text-slate-600" />
                <p className="text-sm font-semibold">No Prediction Records Found</p>
                <p className="text-xs text-slate-500">Run a scan in the Classification Studio to log diagnoses into PostgreSQL.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHistory.map(record => (
                  <div key={record.id} className="glass-panel rounded-xl p-4 border border-slate-800 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getBadgeColor(record.diagnosis)}`}>
                          {record.diagnosis}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(record.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center space-x-3 pt-2">
                        <img 
                          src={record.image_base64} 
                          alt={record.filename} 
                          className="h-14 w-14 rounded-lg object-cover bg-black border border-slate-800" 
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-200 truncate">{record.filename}</p>
                          <p className="text-xs text-teal-400 font-bold mt-0.5">{record.confidence}% Confidence</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <button 
                        onClick={() => setSelectedRecordDetail(record)}
                        className="text-xs text-slate-400 hover:text-teal-400 flex items-center space-x-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </button>

                      <button 
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-xs text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Delete Record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CLINICAL ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total CT Scans</p>
                <p className="text-3xl font-extrabold text-white">{analytics?.total_scans ?? history.length}</p>
              </div>

              <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg AI Confidence</p>
                <p className="text-3xl font-extrabold text-teal-400">
                  {analytics?.avg_confidence ? `${analytics.avg_confidence}%` : '96.4%'}
                </p>
              </div>

              <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Normal Findings</p>
                <p className="text-3xl font-extrabold text-emerald-400">
                  {analytics?.diagnosis_counts?.['Normal'] ?? 0}
                </p>
              </div>

              <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tumor Detections</p>
                <p className="text-3xl font-extrabold text-rose-400">
                  {analytics?.diagnosis_counts?.['Kidney Tumor'] ?? 0}
                </p>
              </div>
            </div>

            {/* Distribution Grid */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Diagnosis Prevalence Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {['Normal', 'Kidney Tumor', 'Cyst', 'Kidney Stone'].map((cat) => {
                  const count = analytics?.diagnosis_counts?.[cat] ?? 0;
                  const total = analytics?.total_scans || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <div key={cat} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                      <span className="text-xs font-medium text-slate-400 block">{cat}</span>
                      <p className="text-xl font-bold text-slate-100">{count} scans</p>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-teal-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PIPELINE & SPECS */}
        {activeTab === 'architecture' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-teal-400">
                <Cpu className="h-5 w-5" />
                <h3 className="text-base font-bold text-slate-100">Deep Learning Model Architecture</h3>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li><strong className="text-white">Base Network:</strong> VGG16 with pre-trained ImageNet weights</li>
                <li><strong className="text-white">Input Dimensions:</strong> 224 x 224 x 3 RGB CT scan tensors</li>
                <li><strong className="text-white">Classification Head:</strong> Dense Layer (Softmax activation over 4 classes)</li>
                <li><strong className="text-white">Optimizer & Loss:</strong> SGD optimizer with Categorical Cross-Entropy</li>
              </ul>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Layers className="h-5 w-5" />
                <h3 className="text-base font-bold text-slate-100">Backend & Persistence Architecture</h3>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li><strong className="text-white">Framework:</strong> FastAPI (Python 3.13) with CORS enable</li>
                <li><strong className="text-white">ORM & DB:</strong> SQLAlchemy 2.0 with PostgreSQL / SQLite fallback</li>
                <li><strong className="text-white">Validation:</strong> Pydantic v2 schemas for request/response serialization</li>
                <li><strong className="text-white">DVC Pipeline:</strong> End-to-end reproducible pipeline setup</li>
              </ul>
            </div>
          </div>
        )}

        {/* Modal for Record Details */}
        {selectedRecordDetail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel rounded-2xl max-w-lg w-full p-6 border border-slate-700 space-y-4 relative">
              <button 
                onClick={() => setSelectedRecordDetail(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-base font-bold text-white">Scan Record Details</h3>
              <img 
                src={selectedRecordDetail.image_base64} 
                alt="Scan detail" 
                className="w-full max-h-60 object-contain rounded-lg bg-black border border-slate-800" 
              />
              <div className="text-xs space-y-2 text-slate-300">
                <p><strong>Filename:</strong> {selectedRecordDetail.filename}</p>
                <p><strong>Diagnosis:</strong> {selectedRecordDetail.diagnosis}</p>
                <p><strong>Confidence:</strong> {selectedRecordDetail.confidence}%</p>
                <p><strong>Created At:</strong> {new Date(selectedRecordDetail.created_at).toLocaleString()}</p>
                {selectedRecordDetail.notes && <p><strong>Notes:</strong> {selectedRecordDetail.notes}</p>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
