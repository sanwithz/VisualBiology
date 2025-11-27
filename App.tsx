import React, { useState, useCallback } from 'react';
import StickyGraph from './components/StickyGraph';
import Sidebar from './components/Sidebar';
import { GraphData, GraphNode } from './types';
import { INITIAL_GRAPH_DATA } from './constants';
import { generateBioGraph } from './services/geminiService';
import { transformBiologyData, ChapterData } from './utils/dataTransformers';

const App: React.FC = () => {
  const [data, setData] = useState<GraphData>(INITIAL_GRAPH_DATA);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("Glycolysis");
  const [error, setError] = useState<string | null>(null);
  
  // Initialize API Key from localStorage or environment variable
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("gemini_api_key") || process.env.API_KEY || "";
  });

  const handleSaveApiKey = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
  }, []);

  const handleGenerate = async (topic: string) => {
    if (!apiKey) {
      setError("Please configure your API Key in settings first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const newData = await generateBioGraph(topic, apiKey);
      setData(newData);
      setCurrentTopic(topic);
      setSelectedNode(null);
    } catch (err) {
      console.error(err);
      setError("Failed to generate graph. Please check your API Key or try a different topic.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectChapter = useCallback((chapter: ChapterData) => {
    const transformedData = transformBiologyData(chapter);
    setData(transformedData);
    setCurrentTopic(chapter.title);
    setSelectedNode(null);
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans selection:bg-rose-500/30">
      
      {/* Layer 0: Full Screen Graph */}
      <div className="absolute inset-0 z-0">
        <StickyGraph 
          data={data} 
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* Layer 1: Floating UI Elements */}
      <Sidebar 
        selectedNode={selectedNode} 
        onGenerate={handleGenerate} 
        onSelectChapter={handleSelectChapter}
        isGenerating={isGenerating}
        topic={currentTopic}
        data={data} 
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
      
      {/* Error Notification */}
      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-rose-500/90 text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 flex items-center gap-3">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;