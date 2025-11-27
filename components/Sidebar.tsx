import React, { useState, useEffect, useMemo } from 'react';
import { GraphNode } from '../types';
import { getGroupColor } from '../constants';
import { Network, Sparkles, X, Info, Search, FlaskConical, BookOpen, Menu, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { explainNode } from '../services/geminiService';
import { BIOLOGY_CHAPTERS } from '../data/biologyData';
import { ChapterData } from '../utils/dataTransformers';

interface SidebarProps {
  selectedNode: GraphNode | null;
  onGenerate: (topic: string) => void;
  onSelectChapter: (chapter: ChapterData) => void;
  isGenerating: boolean;
  topic: string;
  data?: { nodes: GraphNode[] };
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedNode, onGenerate, onSelectChapter, isGenerating, topic: currentTopic, data, apiKey, onSaveApiKey }) => {
  const [inputTopic, setInputTopic] = useState("");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTopic.trim()) {
      onGenerate(inputTopic);
    }
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chapterTitle = e.target.value;
    const chapter = BIOLOGY_CHAPTERS.find(c => c.title === chapterTitle);
    if (chapter) {
      onSelectChapter(chapter);
    }
  };
  
  const handleSaveConfig = () => {
    onSaveApiKey(tempKey);
    setIsConfigOpen(false);
  };

  // Sync temp key if prop changes
  useEffect(() => {
    setTempKey(apiKey);
  }, [apiKey]);

  // Dynamically extract unique groups for the legend
  const uniqueGroups = useMemo(() => {
     if (!data?.nodes) return ["ตัวอย่าง"]; 
     return Array.from(new Set(data.nodes.map(n => n.group))).sort();
  }, [data]);

  useEffect(() => {
    if (selectedNode) {
      if (!isOpen) setIsOpen(true);

      setExplanation(null);
      setIsLoadingExplanation(true);
      if (selectedNode.description) {
        setExplanation(selectedNode.description);
        setIsLoadingExplanation(false);
      } else {
        explainNode(selectedNode.id, currentTopic || "General Biology", apiKey).then(text => {
            setExplanation(text);
            setIsLoadingExplanation(false);
        });
      }
    } else {
      setExplanation(null);
    }
  }, [selectedNode, currentTopic, apiKey, isOpen]);

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-8 left-8 z-30 p-4 bg-slate-900/90 text-slate-200 rounded-full shadow-2xl border border-slate-700/50 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 backdrop-blur-md ${isOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'}`}
        aria-label="Open Sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar Container */}
      <div 
        className={`fixed inset-y-0 left-0 z-20 w-[32rem] bg-slate-900/95 backdrop-blur-2xl border-r border-slate-800 shadow-2xl transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute -right-14 top-8 p-3 bg-slate-900/90 border border-slate-700/50 text-slate-400 hover:text-white rounded-r-2xl shadow-lg backdrop-blur-md transition-colors"
          aria-label="Close Sidebar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <div className="pt-12 pb-10 px-12 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-start">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <FlaskConical className="w-7 h-7 text-rose-500" />
              </div>
              <div>
                <h1 className="font-bold text-3xl text-slate-100 tracking-tight">Visual Biology</h1>
                <p className="text-base text-slate-500 font-medium mt-1">Interactive Graph Explorer</p>
              </div>
            </div>
            
            {/* Settings Button */}
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
              title="API Configuration"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-12 py-12 space-y-14">
            
            {/* Curriculum Section */}
            <div className="space-y-6">
              <label className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest opacity-80">
                <BookOpen className="w-4 h-4 text-rose-400" /> 
                Curriculum Module
              </label>
              <div className="relative group">
                <select 
                  onChange={handleChapterChange}
                  className="w-full appearance-none bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-2xl px-6 py-5 text-base text-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all cursor-pointer shadow-sm pr-12"
                  defaultValue=""
                >
                  <option value="" disabled>Select a Learning Chapter...</option>
                  {BIOLOGY_CHAPTERS.map((c, idx) => (
                    <option key={idx} value={c.title}>
                      {c.chapter}: {c.title}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-slate-300 transition-colors">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            {/* AI Search Section */}
            <div className="space-y-6">
              <label className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest opacity-80">
                <Search className="w-4 h-4 text-rose-400" />
                AI Investigation
              </label>
              <form onSubmit={handleGenerate} className="flex gap-4">
                <input
                  type="text"
                  value={inputTopic}
                  onChange={(e) => setInputTopic(e.target.value)}
                  placeholder="E.g., Photosynthesis pathways..."
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-5 text-base text-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-slate-600 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-5 rounded-2xl transition-all shadow-lg shadow-rose-900/20 active:scale-95 flex items-center justify-center min-w-[4rem]"
                >
                  {isGenerating ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-6 h-6" />
                  )}
                </button>
              </form>
            </div>

            <hr className="border-slate-800/60" />

            {/* Entity Details Section */}
            <div className="space-y-6">
              <label className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest opacity-80">
                <Info className="w-4 h-4 text-rose-400" />
                Entity Details
              </label>
              
              {selectedNode ? (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
                  <div className="flex items-start gap-6">
                    <div 
                      className="w-14 h-14 rounded-2xl shadow-lg flex-shrink-0 flex items-center justify-center ring-2 ring-white/5" 
                      style={{ backgroundColor: getGroupColor(selectedNode.group) }}
                    >
                      <Network className="w-7 h-7 text-white/80" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white break-words leading-tight">{selectedNode.id}</h2>
                      <div className="flex items-center gap-3 mt-3">
                         <span 
                            className="inline-block px-4 py-1.5 rounded-full text-xs uppercase font-bold tracking-wider text-white shadow-sm"
                            style={{ backgroundColor: getGroupColor(selectedNode.group) + 'CC' }}
                          >
                          {selectedNode.group}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/40 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                       <Sparkles className="w-16 h-16 text-rose-500" />
                    </div>
                    
                    <h3 className="text-xs font-bold text-rose-400 mb-4 uppercase tracking-wide flex items-center gap-2">
                      AI Analysis
                    </h3>
                    
                    {isLoadingExplanation ? (
                      <div className="space-y-4 animate-pulse py-2">
                        <div className="h-2.5 bg-slate-700/50 rounded-full w-3/4"></div>
                        <div className="h-2.5 bg-slate-700/50 rounded-full w-full"></div>
                        <div className="h-2.5 bg-slate-700/50 rounded-full w-5/6"></div>
                      </div>
                    ) : (
                      <p className="text-base text-slate-300 leading-8 font-light">
                        {explanation}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-600 py-20 border-2 border-dashed border-slate-800/50 rounded-3xl bg-slate-800/20">
                  <Network className="w-14 h-14 mb-5 opacity-30" />
                  <p className="text-base font-medium opacity-60">Select a node to inspect</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer / Legend */}
          <div className="p-12 border-t border-slate-800/60 bg-slate-900/80 backdrop-blur-xl">
             <div className="grid grid-cols-2 gap-y-5 gap-x-8">
              {uniqueGroups.map((group) => {
                const color = getGroupColor(group);
                return (
                  <div key={group} className="flex items-center gap-4 group cursor-help">
                    <div className="w-3 h-3 rounded-full ring-4 ring-transparent group-hover:ring-white/10 transition-all duration-300" style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}60` }} />
                    <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors capitalize tracking-wide truncate">{group}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* API Config Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-10 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsConfigOpen(false)} 
              className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <Settings className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold text-white">API Configuration</h3>
            </div>
            
            <p className="text-slate-400 mb-8 text-base leading-relaxed">
              To use AI Investigation and Analysis features, please provide your Google Gemini API Key. This key is stored locally on your device.
            </p>
            
            <div className="space-y-3 mb-8">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gemini API Key</label>
              <input 
                type="password" 
                value={tempKey} 
                onChange={e => setTempKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="AIzaSy..."
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setIsConfigOpen(false)} 
                className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveConfig} 
                className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-900/20 hover:shadow-rose-900/40 transition-all active:scale-95"
              >
                Save Configuration
              </button>
            </div>
            
             <p className="mt-6 text-center text-xs text-slate-600">
              Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-rose-400 hover:underline">Get one from Google AI Studio</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;