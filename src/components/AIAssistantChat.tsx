import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  Compass, 
  LineChart, 
  Flame, 
  GitCompare, 
  Layers, 
  ShieldCheck, 
  CornerDownLeft,
  ChevronRight,
  Terminal,
  FileWarning,
  Zap,
  Minimize2
} from 'lucide-react';
import { SimulationConfig } from '../types/federated';
import { MODEL_SPECS } from '../services/trafficDataService';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    action: () => void;
  };
}

interface AIAssistantChatProps {
  currentConfig: SimulationConfig;
  onNavigateTab: (tab: 'predictions' | 'heatmap' | 'comparison' | '3d-twin' | 'flower-llm') => void;
  onOpenBenchmark: () => void;
  onOpenReport: () => void;
  onPinRun: () => void;
  onOpenColab?: () => void;
  onTriggerError?: (type: '404' | 'security' | 'downtime') => void;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  currentConfig,
  onNavigateTab,
  onOpenBenchmark,
  onOpenReport,
  onPinRun,
  onOpenColab,
  onTriggerError
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your AIORI Research Assistant. I can navigate you through the 3D Digital Twin View, Live Forecast Dashboard, Research Heatmap & Shard Studio, and Simulation Comparison Studio, or explain Dirichlet α non-IID client drift and Colab GPU training. How can I assist you?',
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickQuestions = [
    { text: '3D Digital Twin & RSU Studio', tab: '3d-twin' as const },
    { text: '1. Live Forecast Dashboard', tab: 'predictions' as const },
    { text: '2. Heatmap & Dirichlet Shards', tab: 'heatmap' as const },
    { text: '3. Simulation Comparison Studio', tab: 'comparison' as const },
    { text: 'Colab Backend Script & CLI', colab: true },
    { text: 'Explain Dirichlet α and client drift', query: 'explain drift' },
    { text: 'How does INT8 save 75% bytes?', query: 'explain quantization' },
    { text: 'Simulate 404 detector error', errorType: '404' as const }
  ];

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Generate intelligent response based on domain queries
    setTimeout(async () => {
      const q = userText.toLowerCase();
      let reply = '';
      let action: { label: string; action: () => void } | undefined = undefined;

      if (q.includes('3d') || q.includes('twin') || q.includes('explod') || q.includes('rsu') || q.includes('viewport')) {
        reply = 'The 3D Digital Twin partition renders an interactive procedural Three.js WebGL model of the METR-LA RSU Edge Station #405 with PBR materials, dynamic exploded-view expansion, camera director presets, and highway traffic flow.';
        action = {
          label: 'Launch 3D Digital Twin View',
          action: () => { onNavigateTab('3d-twin'); setIsOpen(false); }
        };
      } else if (q.includes('colab') || q.includes('cli') || q.includes('backend') || q.includes('.venv')) {
        reply = 'The ML model runs internally via backend automation and can be synchronized with Google Colab GPU via the Colab CLI runner (/backend/colab_cli_runner.py). You can inspect the Colab script and PyTorch FL pipeline directly.';
        if (onOpenColab) {
          action = {
            label: 'Open Colab Backend Link',
            action: () => { onOpenColab(); setIsOpen(false); }
          };
        }
      } else if (q.includes('compar') || q.includes('pin') || q.includes('diff') || q.includes('studio 3')) {
        reply = 'Landing Page 3 (Simulation Comparison Studio) allows you to pin Run A as baseline, adjust hyperparameters, and observe exact deltas in MAE, RMSE, and transmission bytes. Pinned runs are backed by Google Cloud SQL & Firestore.';
        action = {
          label: 'Navigate to Simulation Comparison',
          action: () => { onNavigateTab('comparison'); setIsOpen(false); }
        };
      } else if (q.includes('drift') || q.includes('dirichlet') || q.includes('alpha') || q.includes('non-iid') || q.includes('shard')) {
        reply = 'Under non-IID partitioning, clients receive skewed shards governed by Dirichlet parameter α. As documented by Efthymiadis et al. (2024), lower α (e.g. 0.2) causes severe client weight divergence (||∇F_k - ∇F|| > 0). You can inspect the new Dirichlet Shard Bar Chart in Landing Page 2.';
        action = {
          label: 'Inspect Dirichlet Shard Bar Chart',
          action: () => { onNavigateTab('heatmap'); setIsOpen(false); }
        };
      } else if (q.includes('heat') || q.includes('density') || q.includes('spatial') || q.includes('page 2')) {
        reply = 'Landing Page 2 features the Spatial Traffic Density Matrix (Heatmap) with 12 diurnal time slots, plus the Non-IID Dirichlet Shard and Sensor Volume allocation bar chart across each edge RSU node.';
        action = {
          label: 'Switch to Heatmap & Shard Studio',
          action: () => { onNavigateTab('heatmap'); setIsOpen(false); }
        };
      } else if (q.includes('forecast') || q.includes('live') || q.includes('dashboard') || q.includes('page 1') || q.includes('prediction')) {
        reply = 'Landing Page 1 is the Live Traffic Forecast Dashboard. It streams 15 to 60-min horizon traffic predictions on METR-LA across Los Angeles highway corridors with residual error shockwave analysis.';
        action = {
          label: 'Switch to Live Forecast Dashboard',
          action: () => { onNavigateTab('predictions'); setIsOpen(false); }
        };
      } else if (q.includes('quant') || q.includes('byte') || q.includes('bandwidth') || q.includes('int8') || q.includes('fp16')) {
        reply = 'Standard FP32 weights use 4 bytes/param (246.8 KB per model update). INT8 quantization compresses each weight to 1 byte, slashing round transmission bytes by 75% down to 61.7 KB with minimal accuracy loss (<0.18 km/h MAE).';
      } else if (q.includes('benchmark') || q.includes('seed') || q.includes('c8') || q.includes('c9')) {
        reply = 'PS-003 requires evaluation across 3 random seeds (42, 101, 2024). Click below to view the Multi-Seed Verification matrix comparing IID vs Non-IID with FedAvg.';
        action = {
          label: 'Open 3-Seed Benchmark Modal',
          action: () => { onOpenBenchmark(); setIsOpen(false); }
        };
      } else if (q.includes('flower') || q.includes('llm') || q.includes('dropout') || q.includes('resilience') || q.includes('lora') || q.includes('incident')) {
        reply = 'Partition 5 is the Flower Federated LLM Studio (powered by flwrlabs/flower). It performs decentralized instruction fine-tuning of LLaMA-3/Gemma-2 models with PEFT/LoRA adapters, demonstrates FedProx resilience against periodic 5G client dropouts, and executes AI traffic dispatch reasoning.';
        action = {
          label: 'Open Flower FedLLM Studio',
          action: () => { onNavigateTab('flower-llm'); setIsOpen(false); }
        };
      } else if (q.includes('error') || q.includes('404') || q.includes('security') || q.includes('downtime')) {
        reply = 'System error pages (404 Not Found, DPDP 2025 Security Alert, and Server Downtime) are triggered dynamically when operational errors occur. I can simulate a 404 detector fault for testing.';
        if (onTriggerError) {
          action = {
            label: 'Trigger 404 Error State',
            action: () => { onTriggerError('404'); setIsOpen(false); }
          };
        }
      } else {
        // Fallback to server-side Gemini generation
        try {
          const prompt = `You are the AI Assistant for the AIORI Intelligent Transportation Systems (ITS) Federated Traffic Forecasting Platform (METR-LA dataset, Caltrans District 7).
Current Simulation Config:
- Model Architecture: ${currentConfig.modelArchitecture}
- Distribution: ${currentConfig.distribution} (Dirichlet α=${currentConfig.dirichletAlpha})
- Client Count: ${currentConfig.clientCount} RSUs
- Algorithm: ${currentConfig.algorithm}
- Quantization: ${currentConfig.quantization}

User query: "${userText}"
Provide a helpful, technically precise 2-3 sentence response grounded in federated learning traffic forecasting.`;

          const res = await fetch('/api/gemini/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.text) {
              reply = data.text;
            }
          }
        } catch (e) {
          console.warn('Server-side Gemini generation fallback:', e);
        }

        if (!reply) {
          reply = `Under your active ${currentConfig.distribution.toUpperCase()} setup (Dirichlet α=${currentConfig.dirichletAlpha}, ${currentConfig.clientCount} RSUs), FedAvg achieves balanced convergence on METR-LA. Use the quick action buttons to explore different pages.`;
        }
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: action
      };

      setMessages(prev => [...prev, aiMsg]);
    }, 350);
  };

  return (
    <>
      {/* Floating Trigger Button positioned above Contact Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-5 sm:right-7 z-50 flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20 active:scale-95"
      >
        <div className="relative">
          <Bot className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <span className="tracking-wide">AI Research Assistant</span>
      </button>

      {/* Floating Chat Window with Smooth Enter/Exit Animations */}
      <div 
        className={`fixed bottom-36 right-4 sm:right-7 w-[94vw] sm:w-[420px] h-[520px] max-h-[75vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col z-50 overflow-hidden transform transition-all duration-300 ease-out origin-bottom-right ${
          isOpen 
            ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto shadow-indigo-900/15' 
            : 'scale-90 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Chat Window Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <span>AIORI Research Navigator</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </h4>
              <p className="text-[10px] text-cyan-100 font-medium">
                FedAvg, METR-LA & Colab AI Companion
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer text-white"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-xs font-medium'
                    : 'bg-white text-slate-800 border border-slate-200/90 shadow-2xs rounded-tl-none font-normal'
                }`}
              >
                {msg.text}
              </div>

              {/* In-Chat Interactive Action Navigation Button */}
              {msg.actionButton && (
                <button
                  onClick={msg.actionButton.action}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                >
                  <span>{msg.actionButton.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                </button>
              )}

              <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question / Navigation Chips */}
        <div className="p-2.5 bg-white border-t border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (q.tab) {
                  onNavigateTab(q.tab);
                  setIsOpen(false);
                } else if (q.colab && onOpenColab) {
                  onOpenColab();
                  setIsOpen(false);
                } else if (q.errorType && onTriggerError) {
                  onTriggerError(q.errorType);
                  setIsOpen(false);
                } else if (q.query) {
                  handleSend(q.text);
                }
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer shrink-0 border border-slate-200/60"
            >
              {q.text}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything or request page navigation..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer disabled:opacity-40 transition-colors shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
};
