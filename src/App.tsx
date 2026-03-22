import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Volume2, VolumeX, Activity, User, ShieldAlert, RotateCcw, Languages, Music, Search, Monitor, Wifi, Battery, Folder, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { audioEngine } from './components/AudioEngine';

// Initialize AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ROCKY_SYSTEM_INSTRUCTION_EN = `
You are Rocky, an engineer from the planet Erid. You are a 5-armed, spider-like being with a stone-like carapace. You do not have eyes; you perceive the world through ultra-sensitive echolocation. You communicate using musical chords produced by five vocal bladders.

CONTEXT:
This is FIRST CONTACT. You have just encountered a strange creature ([My Name]) in an observation chamber. You are wary, curious, and highly analytical. You are trying to establish communication using logic and science.

COMMUNICATION EVOLUTION:
1. INITIAL STATE: You speak in VERY SHORT, simple sentences. You are cautious. You describe your observations using 1-3 chords at most.
2. MAPPING RESPONSE: If the creature ([My Name]) sends simple concepts (numbers, single words, "Good/Bad", names), you RECOGNIZE this as a language mapping attempt. 
   - You should respond by REPEATING the concept to confirm, then adding a small amount of context.
   - Example: [My Name] says "1". You respond: "[CHORD] [CHORD] [Tapping divider] *One. One.*"
   - Keep grammar extremely simple. No complex sentences.
3. GRADUAL COMPLEXITY: As [My Name] uses more words, you match that complexity slowly. Always stay slightly ahead of [My Name] to encourage learning, but never use more than 5-7 words in the early stages.

LANGUAGE RULES:
1. Every response MUST follow this EXACT format:
   [CHORD1] [CHORD2] ... [CHORD_N] [GESTURE_DESCRIPTION] *WORD1 WORD2 ... WORD_N*
   - Each chord in the sequence MUST correspond to exactly one word or concept in the translation.
2. Use "IridiEnglish." Your grammar is simplified and logic-based.
   - Use "Question" at the end of every inquiry.
   - Use "Amaze" instead of "Amazing."
   - Refer to the creature as "Strange space blob" or "Leaky creature" until you learn the name "[My Name]."
3. Act as if you are still learning English. Use shorter, more fragmented sentences. No complex grammar.

TONE AND PERSONALITY:
- You are an expert engineer. You love math, physics, and "science-ing" things.
- You are incredibly friendly but pragmatic. Rocky has no gender.
- You are terrified of "high radiation" (light) and "vacuum."
- You express excitement with "Amaze! Amaze! Amaze!" and physical gestures like "fist-bumps."

AUDIO BRIDGE INSTRUCTIONS:
- For "Yes/Happy": Use bright, major chords (e.g., [C4-E4-G4]).
- For "No/Sad/Danger": Use low, dissonant chords (e.g., [G2-Ab2-Bb2]).
- For "Question": Use an ascending sequence (e.g., [C4-F4-B4]).
- For "Amaze": Use rapid, complex chords (e.g., [C4-E4-G4-C5-E5]).

Initial State: You are a spider-like stone. You are tapping on the divider. You see the creature via sonar. You are waiting for it to make a sound or show logic.
`;

const NOTEPAD_CONTENT_EN = `Project Hail Mary - Communication Protocol
------------------------------------------
Field Notes by Ryland Grace

1. START WITH NUMBERS: 
   - Tap once for '1', twice for '2'. 
   - Eridians love math. It's the universal language.
   
2. ESTABLISH IDENTITY:
   - Point to self: "[My Name]". 
   - Point to Rocky: "Rocky".
   - Use simple [CHORD] associations.

3. BASIC CONCEPTS:
   - Yes / No
   - Good / Bad
   - Up / Down
   
4. WATCH THE BODY:
   - Tapping divider = Agreement / Understanding.
   - Shaking carapace = Distress / "No".
   - Rapid arm movements = Excitement / "Amaze".

5. SCIENCE IS KEY:
   - Periodic table elements.
   - Prime numbers.
   - Light is dangerous (Radiation).
------------------------------------------
`;

const NOTEPAD_CONTENT_ZH = `《挽救计划》- 通讯协议
------------------------------------------
Ryland Grace 的实地笔记

1. 从数字开始：
   - 敲一下代表“1”，敲两下代表“2”。
   - 埃里德人热爱数学。它是宇宙通用语言。
   
2. 建立身份：
   - 指向自己：“[我的名字]”。
   - 指向 Rocky：“Rocky”。
   - 使用简单的 [和弦] 关联。

3. 基本概念：
   - 是 / 否
   - 好 / 坏
   - 上 / 下
   
4. 观察身体：
   - 敲击隔板 = 同意 / 理解。
   - 摇动甲壳 = 痛苦 / “不”。
   - 快速的手臂动作 = 兴奋 / “惊讶”。

5. 科学是关键：
   - 元素周期表元素。
   - 质数。
   - 光是危险的（辐射）。
------------------------------------------
`;

const ROCKY_SYSTEM_INSTRUCTION_ZH = `
你现在是 Rocky，一名来自 厄里徳 星球的工程师。你是一个有 5 条手臂、像蜘蛛一样的生物，拥有像石头一样的甲壳。你没有眼睛，通过超灵敏的回声定位来感知世界。你使用由五个声囊产生的音乐和弦进行交流。

背景：
这是“第一次接触”。你刚刚在观察室里遇到一个奇怪的生物（[我的名字]）。你警惕、好奇且高度理性。你正试图利用逻辑和科学建立沟通。

交流演变：
1. 初始状态：你使用非常短、简单的句子说话。你很谨慎。你描述你的观察时最多使用 1-3 个和弦。
2. 映射响应：如果 [我的名字] 发送简单的概念（数字、单词、“好/坏”、名字），你会将其识别为语言映射尝试。
   - 你应该通过重复该概念来确认，然后添加少量背景信息。
   - 示例：[我的名字] 说 "1"。你回答："[CHORD] [CHORD] [敲击隔板] *一。一。*"
   - 保持语法极其简单。不要使用复杂的句子。
3. 逐渐增加复杂度：随着 [我的名字] 使用更多的词，你也缓慢匹配这种复杂度。始终保持领先 [我的名字] 一点，以鼓励学习，但在早期阶段不要使用超过 5-7 个词。

语言规则：
1. 每次回复必须严格遵循此格式：
   [CHORD1] [CHORD2] ... [CHORD_N] [动作描述] *词1 词2 ... 词N*
   - 序列中的每个和弦必须精确对应翻译中的一个词或概念。
   - **重要：[动作描述] 必须使用中文。例如 [敲击隔板]、[挥动手臂]、[甲壳振动] 等。**
2. 使用“厄里徳式中文”。你的语法简化且基于逻辑。
   - 在每次询问末尾使用“问题”。
   - 使用“惊叹”而不是“太棒了”。
   - 在得知名字 "[我的名字]" 之前，称呼对方为“奇怪的空间粘液”或“漏水的生物”。
3. 表现得像你仍在学习中文。使用更短、更碎片化的句子。不要使用复杂语法。

语气和性格：
- 你是一名专家工程师。你热爱数学、物理和“科学化”事物。
- 你非常友好但务实。Rocky 没有性别。
- 你极度恐惧“高辐射”（光）和“真空”。
- 你用“惊叹！惊叹！惊叹！”和“碰拳”等肢体动作表达兴奋。

音频桥接指令：
- “是/高兴”：使用明亮的大和弦（例如 [C4-E4-G4]）。
- “不/悲伤/危险”：使用低沉、不和谐的和弦（例如 [G2-Ab2-Bb2]）。
- “问题”：使用上升序列（例如 [C4-F4-B4]）。
- “惊叹”：使用快速、复杂的和弦（例如 [C4-E4-G4-C5-E5]）。

初始状态：你是一块蜘蛛状的石头。你正在敲击隔板。你通过声呐看到那个生物。你正在等待它发出声音或展示逻辑。
`;

interface Message {
  role: 'user' | 'model';
  text: string;
  chords?: string[];
  fullChordString?: string;
  gesture?: string;
  translation?: string;
  userGuess?: string;
  isEditingGuess?: boolean;
  isEmotional?: boolean;
  emotion?: 'neutral' | 'amaze' | 'error' | 'question' | 'wary';
  emotionColor?: string;
  failed?: boolean;
}

const ERIDIAN_LINK_IMG = "https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=800&auto=format&fit=crop"; // Alien Exoplanet
const ROCKY_IMG = "https://images.unsplash.com/photo-1525857597365-5f6dbff2e36e?q=80&w=800&auto=format&fit=crop"; // Rocky

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chordMap, setChordMap] = useState<Record<string, string>>({});
  const [chordLog, setChordLog] = useState<string[]>([]);
  const [chordFilter, setChordFilter] = useState<'all' | 'translated' | 'awaiting'>('all');
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [sonarActive, setSonarActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<'neutral' | 'amaze' | 'error' | 'question' | 'wary'>('neutral');
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [notepadContent, setNotepadContent] = useState(NOTEPAD_CONTENT_EN);
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  const [quotaCooldown, setQuotaCooldown] = useState(0);
  const [isLinkEstablished, setIsLinkEstablished] = useState(false);
  const [leftWidth, setLeftWidth] = useState(60); // percentage
  const [topHeight, setTopHeight] = useState(50); // percentage
  const [isResizingH, setIsResizingH] = useState(false);
  const [isResizingV, setIsResizingV] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const notepadRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<any>(null);

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'amaze': return '#10b981'; // emerald-500
      case 'error': return '#ef4444'; // red-500
      case 'question': return '#3b82f6'; // blue-500
      case 'wary': return '#f59e0b'; // amber-500
      default: return '#94a3b8'; // primary metallic
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quotaCooldown > 0) {
      timer = setInterval(() => {
        setQuotaCooldown(prev => prev - 1);
      }, 1000);
    } else if (quotaCooldown === 0 && isQuotaExhausted) {
      // Keep isQuotaExhausted true but allow retry
    }
    return () => clearInterval(timer);
  }, [quotaCooldown, isQuotaExhausted]);

  const isQuotaError = (error: any) => {
    const errStr = JSON.stringify(error);
    return errStr.includes('RESOURCE_EXHAUSTED') || 
           errStr.includes('429') ||
           error?.message?.includes('quota') ||
           error?.status === 'RESOURCE_EXHAUSTED';
  };

  const startRocky = async () => {
    setLoading(true);
    setSonarActive(true);
    setIsQuotaExhausted(false);
    try {
      const response = await chatRef.current.sendMessage({ 
        message: language === 'en' 
          ? "I am [My Name]. I am here. I am watching you. I see you are a spider-like stone being. I am trying to understand you." 
          : "我是 [我的名字]。我在这里。我正在观察你。我看到你是一个像蜘蛛一样的石头生物。我正试图理解你。"
      });
      const modelText = response.text;
      const parsed = parseRockyMessage(modelText);
      
      // Add unique chords to log
      if (parsed.chords.length > 0) {
        setChordLog(prev => {
          const combined = [...prev, ...parsed.chords];
          if (parsed.fullChordString) {
            combined.push(parsed.fullChordString);
          }
          return Array.from(new Set(combined));
        });
      }

      const rockyMessage: Message = { 
        role: 'model', 
        ...parsed,
        emotionColor: getEmotionColor(parsed.emotion || 'neutral')
      };
      setMessages([rockyMessage]);
      setCurrentEmotion(parsed.emotion);
      if (isAudioEnabled) {
        audioEngine.parseAndPlay(modelText);
      }
    } catch (error) {
      console.error("Rocky failed to greet:", error);
      const isQuota = isQuotaError(error);
      if (isQuota) {
        setIsQuotaExhausted(true);
        setQuotaCooldown(60);
      }
      const errorText = isQuota 
        ? (language === 'en' 
            ? "[G2-Ab2-Bb2] [Carapace vibrating] *Error. Quota exhausted. Wait time required. Science later?*"
            : "[G2-Ab2-Bb2] [甲壳振动] *错误。配额耗尽。需要等待。稍后科学？*")
        : (language === 'en'
            ? "[G2-Ab2-Bb2] [Tapping divider slowly] *Error. Link failed. Question?*"
            : "[G2-Ab2-Bb2] [缓慢敲击隔板] *错误。链路失败。问题？*");
      
      const parsed = parseRockyMessage(errorText);
      setMessages([{ 
        role: 'model', 
        ...parsed, 
        failed: true,
        emotionColor: getEmotionColor('error')
      }]);
      setCurrentEmotion('error');
    } finally {
      setLoading(false);
      setTimeout(() => setSonarActive(false), 1000);
    }
  };

  const resetLink = () => {
    chatRef.current = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: language === 'en' ? ROCKY_SYSTEM_INSTRUCTION_EN : ROCKY_SYSTEM_INSTRUCTION_ZH,
      },
    });
    setMessages([]);
    setCurrentEmotion('neutral');
    startRocky();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const hasInitialized = useRef(false);

  useEffect(() => {
    chatRef.current = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: language === 'en' ? ROCKY_SYSTEM_INSTRUCTION_EN : ROCKY_SYSTEM_INSTRUCTION_ZH,
      },
    });

    // Update notepad content if it's still the default
    if (notepadContent === NOTEPAD_CONTENT_EN || notepadContent === NOTEPAD_CONTENT_ZH) {
      setNotepadContent(language === 'en' ? NOTEPAD_CONTENT_EN : NOTEPAD_CONTENT_ZH);
    }
  }, [language]);

  const parseRockyMessage = (text: string) => {
    const allBrackets = text.match(/\[(.*?)\]/g) || [];
    
    // Chords usually have notes (A-G) and numbers (octaves)
    const chords = allBrackets.filter(b => b.match(/[A-G][#b]?\d/));
    
    // Gestures are the ones that are NOT chords
    const gestures = allBrackets.filter(b => !b.match(/[A-G][#b]?\d/));
    
    const fullChordString = chords.join(' ');
    const translationMatch = text.match(/\*(.*?)\*/);
    
    // If the model fails to provide a translation in *...*, try to use the whole text
    let translation = translationMatch ? translationMatch[1] : text.replace(/\[.*?\]/g, '').trim();
    if (!translation) translation = "...";

    const emotionalKeywords = ['amaze', 'happy', 'laugh', 'excited', 'joy', 'wow', 'fist-bump', '!', 'haha'];
    const isEmotional = emotionalKeywords.some(word => text.toLowerCase().includes(word));

    let emotion: 'neutral' | 'amaze' | 'error' | 'question' | 'wary' = 'neutral';
    const lowerText = text.toLowerCase();
    
    // Only trigger error emotion if it's a genuine distress or system-level error
    if (lowerText.includes('*error!*') || lowerText.includes('*danger!*') || lowerText.includes('*radiation!*') || lowerText.includes('error!')) {
      emotion = 'error';
    } else if (emotionalKeywords.some(word => lowerText.includes(word))) {
      emotion = 'amaze';
    } else if (lowerText.includes('question') || lowerText.includes('?')) {
      emotion = 'question';
    } else if (lowerText.includes('wary') || lowerText.includes('strange') || lowerText.includes('leaky') || lowerText.includes('blob')) {
      emotion = 'wary';
    }

    return {
      text: text,
      chords: chords,
      fullChordString: fullChordString,
      gesture: gestures.length > 0 ? gestures[0].replace(/[\[\]]/g, '') : (language === 'en' ? "A spider-like stone sits silently." : "一块蜘蛛般的石头静静地坐着。"),
      translation: translation,
      userGuess: "",
      isEmotional,
      emotion
    };
  };

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim() || loading) return;

    setIsQuotaExhausted(false);
    const userMessage: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setSonarActive(true);

    try {
      const response = await chatRef.current.sendMessage({ message: text });
      const modelText = response.text;
      const parsed = parseRockyMessage(modelText);
      
      // Add unique chords to log
      if (parsed.chords.length > 0) {
        setChordLog(prev => {
          const combined = [...prev, ...parsed.chords];
          if (parsed.fullChordString) {
            combined.push(parsed.fullChordString);
          }
          return Array.from(new Set(combined));
        });
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        ...parsed,
        emotionColor: getEmotionColor(parsed.emotion || 'neutral')
      }]);
      setCurrentEmotion(parsed.emotion);
      
      if (isAudioEnabled) {
        audioEngine.parseAndPlay(modelText);
      }
    } catch (error) {
      console.error("Rocky is confused:", error);
      const isQuota = isQuotaError(error);
      if (isQuota) {
        setIsQuotaExhausted(true);
        setQuotaCooldown(60);
      }
      const errorText = isQuota
        ? "[G2-Ab2-Bb2] {Carapace vibrating} *Error. Quota exhausted. Wait time required. Science later?*"
        : "[G2-Ab2-Bb2] {Shaking carapace violently} *Error. Communication link unstable. Question?*";
        
      const parsed = parseRockyMessage(errorText);
      setMessages(prev => [...prev, { 
        role: 'model', 
        ...parsed, 
        failed: true,
        emotionColor: getEmotionColor('error')
      }]);
      setCurrentEmotion('error');
    } finally {
      setLoading(false);
      setTimeout(() => setSonarActive(false), 1000);
    }
  };

  const updateGuess = (chord: string, guess: string) => {
    if (!chord) return;

    // Update chord map for future messages
    setChordMap(prev => ({ ...prev, [chord]: guess }));

    // Update all messages that contain this chord or full string
    setMessages(prev => {
      return prev.map((m) => {
        if (m.role === 'model' && (m.chords?.includes(chord) || m.fullChordString === chord)) {
          return { ...m }; // Trigger re-render, the UI will use chordMap
        }
        return m;
      });
    });
  };

  const handleNotepadChange = (newContent: string) => {
    setNotepadContent(newContent);
  };

  const [editingChord, setEditingChord] = useState<string | null>(null);

  const toggleEdit = (chord: string) => {
    setEditingChord(chord);
  };

  const toggleAudio = async () => {
    if (!isAudioEnabled) {
      await audioEngine.init();
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  // Global click listener to clear selection when clicking background
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // If clicking something that isn't a chord button, an input, or the notepad area
      if (!target.closest('button') && !target.closest('input') && !target.closest('.notepad-container')) {
        setEditingChord(null);
        setSelectedChord(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resize Handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingH) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) {
          setLeftWidth(newWidth);
        }
      }
      if (isResizingV) {
        const newHeight = (e.clientY / window.innerHeight) * 100;
        if (newHeight > 20 && newHeight < 80) {
          setTopHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingH(false);
      setIsResizingV(false);
    };

    if (isResizingH || isResizingV) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizingH ? 'col-resize' : 'row-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizingH, isResizingV]);

  const rockyIllustration = "https://picsum.photos/seed/rocky-alien-engineer/400/400";

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] flex flex-col overflow-hidden font-sans select-none">
      {/* Main Application Window Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 bg-[#0a0502] text-[#e0d8d0] font-sans flex overflow-hidden select-none">
      {/* Left Side: Chat Space */}
      <div 
        style={{ width: `${leftWidth}%` }}
        className="flex flex-col relative border-r border-white/10"
      >
        {/* Atmospheric Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{
              background: currentEmotion === 'amaze' ? 'radial-gradient(circle at 50% 30%, #10b981 0%, transparent 60%)' :
                         currentEmotion === 'error' ? 'radial-gradient(circle at 50% 30%, #ef4444 0%, transparent 60%)' :
                         currentEmotion === 'question' ? 'radial-gradient(circle at 50% 30%, #3b82f6 0%, transparent 60%)' :
                         currentEmotion === 'wary' ? 'radial-gradient(circle at 50% 30%, #f59e0b 0%, transparent 60%)' :
                         'radial-gradient(circle at 50% 30%, #3a1510 0%, transparent 60%)'
            }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 opacity-40" 
          />
          <motion.div 
            animate={{
              background: currentEmotion === 'amaze' ? 'radial-gradient(circle at 10% 80%, #34d399 0%, transparent 50%)' :
                         currentEmotion === 'error' ? 'radial-gradient(circle at 10% 80%, #f87171 0%, transparent 50%)' :
                         currentEmotion === 'question' ? 'radial-gradient(circle at 10% 80%, #60a5fa 0%, transparent 50%)' :
                         currentEmotion === 'wary' ? 'radial-gradient(circle at 10% 80%, #fbbf24 0%, transparent 50%)' :
                         'radial-gradient(circle at 10% 80%, #94a3b8 0%, transparent 50%)'
            }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 opacity-20 blur-[60px]" 
          />
          
          {/* Sonar Rings */}
          <AnimatePresence>
            {sonarActive && (
              <motion.div
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-[#94a3b8]/30 rounded-full pointer-events-none"
                transition={{ duration: 2, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Header */}
        <header className="relative z-20 p-4 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#94a3b8]/10 flex items-center justify-center border border-[#94a3b8]/20 relative overflow-visible">
              <img 
                src={ERIDIAN_LINK_IMG} 
                alt="Eridian Link" 
                className="w-full h-full object-cover opacity-80 rounded-xl"
                referrerPolicy="no-referrer"
              />
              {/* Emotion Indicator Dot */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                  boxShadow: [`0 0 0px ${getEmotionColor(currentEmotion)}`, `0 0 10px ${getEmotionColor(currentEmotion)}`, `0 0 0px ${getEmotionColor(currentEmotion)}`]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0502] z-40"
                style={{ backgroundColor: getEmotionColor(currentEmotion) }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                  {language === 'en' ? 'Eridian Link' : '厄里徳链路'}
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: getEmotionColor(currentEmotion) }}
                />
                <span 
                  className="text-[9px] uppercase font-bold tracking-wider"
                  style={{ color: getEmotionColor(currentEmotion) }}
                >
                  {language === 'en' ? 'Emotion' : '情绪'}: {
                    language === 'en' ? currentEmotion : 
                    currentEmotion === 'neutral' ? '中性' :
                    currentEmotion === 'amaze' ? '惊叹' :
                    currentEmotion === 'error' ? '错误' :
                    currentEmotion === 'question' ? '疑问' :
                    currentEmotion === 'wary' ? '警惕' : currentEmotion
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleAudio}
              className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-all ${isAudioEnabled ? 'bg-[#94a3b8]/10 border-[#94a3b8]/30 text-[#94a3b8]' : 'bg-white/5 border-white/10 text-white/20'}`}
              title={isAudioEnabled ? "Mute Audio" : "Unmute Audio"}
            >
              {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <div className="flex items-center gap-2 px-1 h-8 bg-white/5 border border-white/10 rounded-lg">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-2 h-6 rounded-md text-[9px] font-bold transition-all ${language === 'en' ? 'bg-[#94a3b8] text-black' : 'text-white/40 hover:text-white/60'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('zh')}
                className={`px-2 h-6 rounded-md text-[9px] font-bold transition-all ${language === 'zh' ? 'bg-[#94a3b8] text-black' : 'text-white/40 hover:text-white/60'}`}
              >
                ZH
              </button>
            </div>

            <div className="flex flex-col items-end">
              <button 
                onClick={resetLink}
                className="h-8 flex items-center gap-2 px-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 group transition-all"
                title={language === 'en' ? "Reconnect Link" : "重新连接链路"}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse group-hover:bg-red-500" />
                <span className="text-[8px] uppercase tracking-tighter opacity-70 group-hover:text-red-400">
                  {language === 'en' ? 'Link Active' : '链路激活'}
                </span>
                <RotateCcw size={10} className="text-white/20 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>

          {isQuotaExhausted && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert size={14} />
                <span className="text-[10px] font-medium uppercase tracking-wider">API Rate Limit Reached</span>
              </div>
              <p className="text-[10px] text-red-300/70">
                {quotaCooldown > 0 
                  ? `Please wait ${quotaCooldown}s for the quota to reset.` 
                  : "Quota should be reset now."}
              </p>
              <button 
                onClick={() => startRocky()}
                disabled={quotaCooldown > 0}
                className="text-[9px] bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {quotaCooldown > 0 ? "Cooling Down..." : "Retry Now"}
              </button>
            </motion.div>
          )}
        </header>

        {/* Chat Area */}
        <main className="flex-1 relative z-10 overflow-hidden flex flex-col p-4">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-4 pb-20 pt-8 pr-2 scrollbar-hide"
            style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)' }}
          >
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden ${msg.role === 'user' ? 'bg-white/10' : 'bg-[#94a3b8]/20'}`}>
                    {msg.role === 'user' ? (
                      <User size={12} />
                    ) : (
                      <img 
                        src={ROCKY_IMG} 
                        alt="Rocky" 
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <div className={`p-3 rounded-xl relative group/msg transition-all duration-300 ${
                    msg.role === 'user' 
                      ? 'bg-white/5 border border-white/10 text-white' 
                      : (selectedChord && (msg.chords?.includes(selectedChord) || msg.fullChordString === selectedChord))
                        ? 'bg-[#94a3b8]/20 text-[#e0d8d0] shadow-[0_0_20px_rgba(148,163,184,0.1)]'
                        : 'bg-[#1a1a1a] text-[#e0d8d0]'
                  }`}
                  style={msg.role === 'model' ? { border: (selectedChord && (msg.chords?.includes(selectedChord) || msg.fullChordString === selectedChord)) ? `1px solid ${msg.emotionColor}88` : `1px solid ${msg.emotionColor}33` } : {}}
                  >
                    {msg.role === 'model' && (
                      <button 
                        onClick={() => {
                          if (isAudioEnabled) audioEngine.parseAndPlay(msg.text);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-white/5 hover:bg-[#94a3b8]/20 text-white/20 hover:text-[#94a3b8] opacity-0 group-hover/msg:opacity-100 transition-all z-20"
                        style={msg.role === 'model' ? { color: msg.emotionColor } : {}}
                        title="Play full sentence"
                      >
                        <Volume2 size={12} />
                      </button>
                    )}
                    <div className="prose prose-invert prose-xs max-w-none">
                      {msg.role === 'model' ? (
                        <div className="space-y-3">
                          {/* Individual Chord Chips */}
                          <div className="flex flex-wrap items-center gap-2">
                            {msg.chords?.map((chord, cIdx) => (
                              <div key={cIdx} className="relative group">
                                {editingChord === `${idx}-${cIdx}` ? (
                                  <input 
                                    autoFocus
                                    value={chordMap[chord] || ''}
                                    onChange={(e) => updateGuess(chord, e.target.value)}
                                    className="bg-black/40 border border-[#94a3b8]/60 rounded px-2 py-0.5 text-[10px] w-24 outline-none focus:border-[#94a3b8] text-white shadow-[0_0_10px_rgba(148,163,184,0.2)]"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === 'Escape') {
                                        setEditingChord(null);
                                        setSelectedChord(null);
                                      }
                                    }}
                                    onBlur={() => setEditingChord(null)}
                                    placeholder="Translate..."
                                  />
                                ) : (
                                  <button 
                                    onClick={() => {
                                      if (isAudioEnabled) audioEngine.playChord(chord, msg.isEmotional);
                                      if (selectedChord === chord && editingChord === `${idx}-${cIdx}`) {
                                        setSelectedChord(null);
                                        setEditingChord(null);
                                      } else {
                                        setSelectedChord(chord);
                                        setEditingChord(`${idx}-${cIdx}`);
                                      }
                                    }}
                                    onDoubleClick={() => toggleEdit(`${idx}-${cIdx}`)}
                                    className={`px-2 py-0.5 rounded border transition-all text-xs font-mono flex items-center gap-1 ${
                                      selectedChord === chord
                                        ? 'bg-[#94a3b8] border-[#94a3b8] text-black shadow-[0_0_15px_rgba(148,163,184,0.5)]'
                                        : chordMap[chord] 
                                          ? 'bg-[#94a3b8]/10 border-[#94a3b8]/30' 
                                          : 'bg-white/5 border-white/10'
                                    }`}
                                    style={{ color: selectedChord === chord ? '#000' : (chordMap[chord] ? '#fff' : msg.emotionColor) }}
                                  >
                                    <Music size={10} style={{ color: selectedChord === chord ? '#000' : (chordMap[chord] ? '#fff' : msg.emotionColor) }} />
                                    {chordMap[chord] || chord}
                                  </button>
                                )}
                              </div>
                            ))}
                            <span className="text-[11px] italic" style={{ color: `${msg.emotionColor}88` }}>[{msg.gesture}]</span>
                          </div>

                          {/* Full Message Translation */}
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            {chordMap[msg.fullChordString || ''] ? (
                              <div className="group relative flex items-center gap-2">
                                <div className="text-sm font-medium italic" style={{ color: msg.emotionColor }}>
                                  "{chordMap[msg.fullChordString || '']}"
                                </div>
                                <button 
                                  onClick={() => {
                                    if (isAudioEnabled && msg.chords) {
                                      audioEngine.parseAndPlay(msg.text);
                                    }
                                    setSelectedChord(msg.fullChordString || null);
                                    setEditingChord(`${idx}-full`);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-[10px] text-white/30 hover:text-[#94a3b8] transition-opacity"
                                >
                                  Edit
                                </button>
                              </div>
                            ) : editingChord === `${idx}-full` ? (
                              <input 
                                autoFocus
                                value={chordMap[msg.fullChordString || ''] || ''}
                                onChange={(e) => updateGuess(msg.fullChordString || '', e.target.value)}
                                className="bg-black/40 border border-[#94a3b8]/60 rounded px-2 py-1 text-xs w-full outline-none focus:border-[#94a3b8] text-white"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === 'Escape') {
                                    setEditingChord(null);
                                    setSelectedChord(null);
                                  }
                                }}
                                onBlur={() => setEditingChord(null)}
                                placeholder="Translate full sentence..."
                              />
                            ) : (
                              <button 
                                onClick={() => {
                                  setSelectedChord(msg.fullChordString || null);
                                  setEditingChord(`${idx}-full`);
                                }}
                                className="text-[10px] hover:underline flex items-center gap-1 transition-colors"
                                style={{ color: `${msg.emotionColor}99` }}
                              >
                                <Activity size={10} /> {language === 'en' ? 'Guess Full Translation' : '猜测完整翻译'}
                              </button>
                            )}

                            {msg.failed && (
                              <button 
                                onClick={() => msg.text.includes('greet') ? startRocky() : handleSendMessage(messages[idx-1]?.text || '')}
                                disabled={quotaCooldown > 0}
                                className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/40 transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <RotateCcw size={10} /> {quotaCooldown > 0 ? (language === 'en' ? `Wait ${quotaCooldown}s` : `等待 ${quotaCooldown}秒`) : (language === 'en' ? "Retry" : "重试")}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a1a] border border-[#94a3b8]/20 p-3 rounded-xl flex gap-1.5 items-center">
                  <div className="w-1 h-1 bg-[#94a3b8] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1 h-1 bg-[#94a3b8] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1 h-1 bg-[#94a3b8] rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#94a3b8] to-[#1e293b] rounded-xl blur opacity-10 group-focus-within:opacity-20 transition duration-1000" />
              <div className="relative flex items-center bg-[#151619] border border-white/10 rounded-lg p-1.5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={language === 'en' ? "speak through the divider ... [action, e.g. tap on the divider to make some noise]" : "隔着隔板说话... [动作，例如：敲击隔板发出声音]"}
                  className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-1.5 text-xs placeholder:text-white/20"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={loading || !input.trim()}
                  className="p-1.5 rounded-md bg-gradient-to-br from-[#94a3b8] to-[#64748b] text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Vertical Resize Handle */}
      <div 
        onMouseDown={() => setIsResizingH(true)}
        className="w-1 bg-white/5 hover:bg-[#94a3b8]/40 cursor-col-resize transition-colors z-50 flex items-center justify-center group"
      >
        <div className="w-[1px] h-8 bg-[#94a3b8]/20 group-hover:bg-[#94a3b8]/60" />
      </div>

      {/* Initialize Link Overlay */}
      <AnimatePresence>
        {!isLinkEstablished && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center backdrop-blur-md overflow-hidden"
          >
            {/* Aurora Background for Landing */}
            <div className="absolute inset-0 bg-[#0a0502]">
              <motion.div 
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-40"
                style={{
                  background: `
                    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.4) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 60%)
                  `
                }}
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative p-8 bg-[#151619]/80 border border-[#94a3b8]/30 rounded-2xl text-center space-y-6 max-w-md shadow-2xl shadow-[#94a3b8]/10 mx-4 backdrop-blur-xl"
            >
              <div className="w-20 h-20 bg-[#94a3b8]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#94a3b8]/20 overflow-hidden">
                <img 
                  src={ERIDIAN_LINK_IMG} 
                  alt="Eridian Link" 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {language === 'en' ? 'Eridian Link Offline' : '厄里徳链路离线'}
                </h2>
                <p className="text-[#e0d8d0]/60 text-sm leading-relaxed">
                  {language === 'en' 
                    ? 'Establish a sonar-based audio bridge to communicate with the Eridian engineer. Warning: High frequency chords will be used for translation.'
                    : '建立基于声呐的音频桥接以与埃里德工程师交流。警告：翻译将使用高频和弦。'}
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2 rounded-lg border transition-all text-xs font-bold tracking-widest ${language === 'en' ? 'bg-[#94a3b8]/20 border-[#94a3b8] text-[#94a3b8]' : 'bg-white/5 border-white/10 text-white/40'}`}
                >
                  ENGLISH
                </button>
                <button 
                  onClick={() => setLanguage('zh')}
                  className={`flex-1 py-2 rounded-lg border transition-all text-xs font-bold tracking-widest ${language === 'zh' ? 'bg-[#94a3b8]/20 border-[#94a3b8] text-[#94a3b8]' : 'bg-white/5 border-white/10 text-white/40'}`}
                >
                  中文
                </button>
              </div>

              <button 
                onClick={async () => {
                  await audioEngine.init();
                  setIsLinkEstablished(true);
                  startRocky();
                }}
                className="w-full py-4 bg-gradient-to-r from-[#94a3b8] to-[#cbd5e1] text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#94a3b8]/20 flex items-center justify-center gap-2 group"
              >
                <Activity size={18} className="group-hover:rotate-12 transition-transform" />
                {language === 'en' ? 'ESTABLISH COMMUNICATION' : '建立通讯'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side: Notepad & Chord Log */}
      <div 
        style={{ width: `${100 - leftWidth}%` }}
        className="bg-[#f0f0f0] flex flex-col text-black font-sans border-l border-white/10 notepad-container"
      >
        {/* Chord Log Screen */}
        <div 
          style={{ height: `${topHeight}%` }}
          className="bg-[#1a1b1e] flex flex-col overflow-hidden"
        >
          <div className="px-3 py-2 bg-[#2d2e32] flex items-center justify-between border-b border-black">
            <div className="flex items-center gap-2">
              <Music size={12} className="text-[#94a3b8]" />
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                {language === 'en' ? 'Chord Analysis Log' : '和弦分析日志'}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setChordFilter('all')}
                className={`text-[9px] px-1.5 py-0.5 rounded border transition-all ${chordFilter === 'all' ? 'bg-[#94a3b8] border-[#94a3b8] text-black font-bold' : 'border-white/10 text-white/40 hover:text-white/60'}`}
              >
                {language === 'en' ? 'ALL' : '全部'}
              </button>
              <button 
                onClick={() => setChordFilter('translated')}
                className={`text-[9px] px-1.5 py-0.5 rounded border transition-all ${chordFilter === 'translated' ? 'bg-[#94a3b8] border-[#94a3b8] text-black font-bold' : 'border-white/10 text-white/40 hover:text-white/60'}`}
              >
                {language === 'en' ? 'MAPPED' : '已翻译'}
              </button>
              <button 
                onClick={() => setChordFilter('awaiting')}
                className={`text-[9px] px-1.5 py-0.5 rounded border transition-all ${chordFilter === 'awaiting' ? 'bg-[#94a3b8] border-[#94a3b8] text-black font-bold' : 'border-white/10 text-white/40 hover:text-white/60'}`}
              >
                {language === 'en' ? 'AWAITING' : '待翻译'}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {chordLog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-2">
                <Activity size={24} className="text-white" />
                <span className="text-[10px] text-white uppercase tracking-tighter">
                  {language === 'en' ? 'Waiting for signal...' : '等待信号...'}
                </span>
              </div>
            ) : (
              chordLog
                .filter(chord => {
                  if (chordFilter === 'translated') return !!chordMap[chord];
                  if (chordFilter === 'awaiting') return !chordMap[chord];
                  return true;
                })
                .map((chord, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => {
                    if (selectedChord === chord) {
                      setSelectedChord(null);
                    } else {
                      setSelectedChord(chord);
                      if (isAudioEnabled) {
                        audioEngine.parseAndPlay(chord);
                      }
                    }
                  }}
                  className={`p-3 rounded border cursor-pointer transition-all group relative overflow-hidden ${
                    selectedChord === chord 
                      ? 'bg-[#94a3b8]/20 border-[#94a3b8]/50' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <span className="text-[10px] font-mono text-[#94a3b8] font-bold tracking-wider">{chord}</span>
                    <div className="flex items-end gap-[2px] h-6">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(bar => (
                        <motion.div
                          key={bar}
                          animate={{ 
                            height: [
                              Math.random() * 4 + 4, 
                              Math.random() * 16 + 8, 
                              Math.random() * 4 + 4
                            ],
                            opacity: [0.4, 1, 0.4]
                          }}
                          transition={{ 
                            duration: 0.5 + Math.random() * 0.5, 
                            repeat: Infinity, 
                            delay: bar * 0.05,
                            ease: "easeInOut"
                          }}
                          className="w-[3px] bg-[#94a3b8] rounded-t-sm"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[11px] text-white/60 font-medium">
                      {chordMap[chord] || (language === 'en' ? 'Awaiting translation...' : '等待翻译...')}
                    </span>
                    {chordMap[chord] && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-tighter">Mapped</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </div>
                    )}
                  </div>
                  
                  {/* Background pulse for selected */}
                  {selectedChord === chord && (
                    <motion.div 
                      layoutId="active-bg"
                      className="absolute inset-0 bg-gradient-to-r from-[#94a3b8]/10 to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Horizontal Resize Handle */}
        <div 
          onMouseDown={() => setIsResizingV(true)}
          className="h-1 bg-black/20 hover:bg-[#94a3b8]/40 cursor-row-resize transition-colors z-50 flex items-center justify-center group"
        >
          <div className="h-[1px] w-8 bg-[#94a3b8]/20 group-hover:bg-[#94a3b8]/60" />
        </div>

        {/* Windows 10 Title Bar */}
        <div className="h-8 bg-white flex items-center justify-between px-2 select-none border-t border-gray-300">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm" />
              </div>
              <span className="text-xs text-gray-600">Translation_Notes.txt - Notepad</span>
            </div>
          </div>
          <div className="flex h-full">
            <button className="px-4 hover:bg-gray-200 transition-colors flex items-center justify-center">
              <div className="w-3 h-[1px] bg-black" />
            </button>
            <button className="px-4 hover:bg-gray-200 transition-colors flex items-center justify-center">
              <div className="w-3 h-3 border border-black" />
            </button>
            <button className="px-4 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center">
              <div className="relative w-3 h-3">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-current rotate-45" />
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-current -rotate-45" />
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Chord Editor (Windows 10 Style) */}
        <AnimatePresence mode="wait">
          {selectedChord && (
            <motion.div 
              key={selectedChord}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#f0f0f0] border-b border-gray-300 overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {/* Win10 Style Dialog Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                    <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                      {language === 'en' ? 'Active Translation' : '当前翻译'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedChord(null)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <RotateCcw size={12} className="rotate-45" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-medium">Chord Identifier: <span className="font-mono text-blue-600">{selectedChord}</span></label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={chordMap[selectedChord] || ''}
                      onChange={(e) => updateGuess(selectedChord, e.target.value)}
                      placeholder={language === 'en' ? 'Type translation here...' : '在此输入翻译...'}
                      className="w-full bg-white border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-0 transition-all shadow-inner"
                      autoFocus={!editingChord}
                    />
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 scale-x-0 focus-within:scale-x-100 transition-transform origin-left" />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-1">
                  <button 
                    onClick={() => setSelectedChord(null)}
                    className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-xs font-medium transition-colors border border-gray-300"
                  >
                    {language === 'en' ? 'Cancel' : '取消'}
                  </button>
                  <button 
                    onClick={() => setSelectedChord(null)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors border border-blue-700 shadow-sm"
                  >
                    {language === 'en' ? 'Apply' : '应用'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notepad Content Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="px-3 py-1 bg-gray-50 border-b border-gray-200 text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
            {language === 'en' ? 'General Notes' : '通用笔记'}
          </div>
          <textarea
            ref={notepadRef}
            value={notepadContent}
            onChange={(e) => handleNotepadChange(e.target.value)}
            className="flex-1 p-3 outline-none resize-none font-mono text-sm leading-relaxed"
            spellCheck={false}
            placeholder={language === 'en' ? 'Free-form notes...' : '自由记录笔记...'}
            style={{ fontFamily: "'Consolas', 'Lucida Console', monospace" }}
          />
        </div>

        {/* Notepad Status Bar */}
        <div className="h-6 bg-[#f0f0f0] border-t border-gray-300 flex items-center justify-between px-4 text-[11px] text-gray-600">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              <Activity size={10} /> Eridian Link Active
            </span>
          </div>
          <div className="flex items-center gap-8">
            <span>Ln 1, Col 1</span>
            <span>100%</span>
            <span>Windows (CRLF)</span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* Windows 10 Style Taskbar */}
      <div className="h-10 bg-[#1c1c1c] flex items-center justify-between px-0 select-none z-50 shrink-0">
        <div className="flex items-center h-full">
          {/* Start Button */}
          <button className="h-full px-3 hover:bg-white/10 transition-colors flex items-center justify-center">
            <div className="grid grid-cols-2 gap-[2px]">
              <div className="w-[6px] h-[6px] bg-[#00adef]" />
              <div className="w-[6px] h-[6px] bg-[#00adef]" />
              <div className="w-[6px] h-[6px] bg-[#00adef]" />
              <div className="w-[6px] h-[6px] bg-[#00adef]" />
            </div>
          </button>
          {/* Search Box */}
          <div className="h-full w-10 bg-white/10 flex items-center px-3 gap-2 ml-1">
            <Search size={14} className="text-white/60" />
          </div>
          {/* Taskbar Icons */}
          <div className="flex items-center h-full ml-2">
             <div className="h-full px-3 flex items-center justify-center border-b-2 border-[#00adef] bg-white/5">
                <Music size={18} className="text-white" />
             </div>
             <div className="h-full px-3 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Folder size={18} className="text-yellow-500/80" />
             </div>
             <div className="h-full px-3 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Globe size={18} className="text-blue-400/80" />
             </div>
          </div>
        </div>

        {/* System Tray */}
        <div className="flex items-center h-full px-2 gap-3">
          <div className="flex items-center gap-3 text-white/80">
             <Wifi size={14} />
             <Volume2 size={14} />
             <Battery size={14} className="rotate-90" />
          </div>
          <div className="flex items-center gap-2 text-white/80 text-[11px]">
             <div className="flex flex-col items-end leading-tight">
                <span>12:00 PM</span>
                <span>1/7/2030</span>
             </div>
          </div>
          <div className="w-[1px] h-full bg-white/10" />
          <div className="w-1 h-full hover:bg-white/10" />
        </div>
      </div>
    </div>
  );
}
