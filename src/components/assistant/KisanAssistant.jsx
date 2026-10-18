import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, ChevronDown, Leaf, MessageCircle, Send, X, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import './KisanAssistant.css';
import { SCHEME_CATALOG } from '../../../server/scheme-catalog.mjs';
import { processFarmingQuery } from '../../services/farmingAiService';

const VIEWS = {
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  mandi: { en: 'Smart Mandi', hi: 'स्मार्ट मंडी' },
  farming: { en: 'Crop Health & Farming', hi: 'फसल स्वास्थ्य और खेती' },
  schemes: { en: 'Government Schemes', hi: 'सरकारी योजनाएँ' },
  advisors: { en: 'Farm Advisors', hi: 'खेती सलाहकार' },
  weather: { en: 'Weather Forecast', hi: 'मौसम पूर्वानुमान' },
  land: { en: 'Land Calculator', hi: 'भूमि क्षेत्रफल कैलकुलेटर' },
  account: { en: 'Account', hi: 'खाता' },
  settings: { en: 'Settings & Sync', hi: 'सेटिंग्स और सिंक' }
};

const getSaved = (key) => {
  try { return JSON.parse(localStorage.getItem(`kisanpulse_${key}`) || '[]'); }
  catch { return []; }
};

function answerQuestion(question, language) {
  const q = question.toLowerCase();
  const isHi = language === 'hi';
  const reply = (en, hi, page, labelEn, labelHi) => ({ text: isHi ? hi : en, page, label: isHi ? labelHi : labelEn });
  if (/^(hi|hello|hey|namaste|नमस्ते|हेलो)[!.\s]*$/.test(q)) return reply('Namaste! Ask me how to use KisanPulse or about the farming tools and guidance available here.', 'नमस्ते! KisanPulse इस्तेमाल करने या खेती के औज़ारों के बारे में पूछें।');
  if (/what can you|help|where|how do i|how can i|कहाँ|कैसे|मदद/.test(q)) return reply('I can guide you to mandi prices and profit estimates, crop observations, irrigation and weather guidance, government schemes, and app settings. Tell me what you want to do.', 'मैं मंडी भाव और लाभ अनुमान, फसल निरीक्षण, सिंचाई और मौसम मार्गदर्शन, सरकारी योजनाओं और ऐप सेटिंग्स में मदद कर सकता हूँ। बताइए आप क्या करना चाहते हैं।');
  if (/marketplace|buyer|trade|crop post|buying demand|खरीदार|व्यापार|खरीद मांग/.test(q)) return reply('Open Kisan Vyapar to publish a crop listing or buyer demand. Posts are stored by this app server and can be seen by users of the same running project. Matching uses the listed crop, price range, quantity and location; contact and agree terms carefully before making a deal.', 'फसल की सूची या खरीदार की मांग पोस्ट करने के लिए किसान व्यापार खोलें। पोस्ट ऐप सर्वर पर सहेजी जाती हैं और इसी चल रहे प्रोजेक्ट के उपयोगकर्ताओं को दिखती हैं। मिलान फसल, कीमत, मात्रा और स्थान के आधार पर होता है; सौदा करने से पहले जानकारी जाँचें और शर्तें तय करें।', 'marketplace', 'Open Kisan Vyapar', 'किसान व्यापार खोलें');
  if (/mandi|price|rate|sell|profit|भाव|मंडी|लाभ|बेच/.test(q)) return reply('Open Smart Mandi to compare market rates and estimate net proceeds after transport and other costs. Check the data source and timestamp; benchmark prices are not guaranteed live quotes.', 'भावों की तुलना और खर्च घटाकर शुद्ध आय का अनुमान लगाने के लिए स्मार्ट मंडी खोलें। डेटा का स्रोत और समय जाँचें; बेंचमार्क भाव लाइव भाव की गारंटी नहीं हैं।', 'mandi', 'Open Smart Mandi', 'स्मार्ट मंडी खोलें');
  if (/crop|disease|pest|leaf|symptom|plant|फसल|रोग|कीट|पत्ती/.test(q)) return reply('Open Crop Health & Farming to record symptoms and a photo, review saved observations, and get cautious next-step guidance. Similar symptoms can have different causes, so this tool does not confirm a disease; consult your local KVK or agriculture officer for diagnosis.', 'लक्षण और फोटो दर्ज करने, निरीक्षण देखने और सावधानीपूर्वक अगले कदम जानने के लिए फसल स्वास्थ्य और खेती खोलें। एक जैसे लक्षणों के अलग कारण हो सकते हैं; यह रोग की पुष्टि नहीं करता। जाँच के लिए स्थानीय कृषि विज्ञान केंद्र या कृषि अधिकारी से संपर्क करें।', 'farming', 'Open Crop Health', 'फसल स्वास्थ्य खोलें');
  if (/irrigat|water|rain|सिंचाई|पानी|बारिश/.test(q)) return reply('The farming module offers stage based irrigation guidance using recent rain, soil hand feel, and days since watering. A phone cannot measure soil moisture; check the soil in the field before acting.', 'खेती मॉड्यूल हाल की बारिश, मिट्टी की नमी को हाथ से जाँचने और पिछली सिंचाई के दिनों के आधार पर मार्गदर्शन देता है। फोन मिट्टी की नमी नहीं माप सकता; निर्णय से पहले खेत की मिट्टी जाँचें।', 'farming', 'Open Farming Tools', 'खेती के औज़ार खोलें');
  if (/weather|spray|wind|मौसम|छिड़काव|हवा/.test(q)) return reply('Open Weather Forecast for a seven-day view, or Crop Health & Farming for its weather and spray guidance. Forecasts can change; verify local conditions before spraying.', 'सात दिनों का पूर्वानुमान देखने के लिए मौसम पूर्वानुमान खोलें, या छिड़काव सलाह के लिए फसल स्वास्थ्य और खेती खोलें। पूर्वानुमान बदल सकता है; छिड़काव से पहले स्थानीय स्थिति जाँचें।', 'weather', 'Open Weather Forecast', 'मौसम पूर्वानुमान खोलें');
  if (/sell first|which crop|stored crop|alternate crop|what to grow|advis(or|er)|पहले बेच|क्या उगाएं|कौन सी फसल/.test(q)) return reply('Open Farm Advisors to rank stored crops by urgency or explore short-duration crop ideas. The recommendations use transparent rules and are planning aids, not guaranteed yields or prices.', 'भंडारित फसलों की प्राथमिकता या कम अवधि वाली फसलों के सुझाव देखने के लिए खेती सलाहकार खोलें। सुझाव नियमों पर आधारित योजना सहायता हैं, पैदावार या कीमत की गारंटी नहीं।', 'advisors', 'Open Farm Advisors', 'खेती सलाहकार खोलें');
  if (/land area|acre|hectare|guntha|measure.*field|भूमि|एकड़|हेक्टेयर|गुंठा|खेत का माप/.test(q)) return reply('Open Land Calculator, enter the length and width, and choose feet or metres to see area conversions.', 'भूमि क्षेत्रफल कैलकुलेटर खोलें, लंबाई-चौड़ाई दर्ज करें और फुट या मीटर चुनकर क्षेत्रफल का रूपांतरण देखें।', 'land', 'Open Land Calculator', 'भूमि कैलकुलेटर खोलें');
  if (/account|sign in|register|login|खाता|लॉग ?इन|पंजीकरण/.test(q)) return reply('Open Account to create a KisanPulse account or sign in. Your account is separate from scheme-admin access.', 'KisanPulse खाता बनाने या साइन इन करने के लिए खाता खोलें। यह खाता योजना एडमिन पहुँच से अलग है।', 'account', 'Open Account', 'खाता खोलें');
  if (/scheme|subsid|pm.?kisan|insurance|योजना|सब्सिडी|बीमा|किसान सम्मान|योजन/.test(q)) {
    let catalog = SCHEME_CATALOG;
    try { catalog = JSON.parse(localStorage.getItem('kisanpulse_schemes_cache') || '[]'); } catch { /* Keep the assistant usable if browser data is unavailable. */ }
    const words = q.split(/[^\p{L}\p{N}-]+/u).filter((word) => word.length > 2 && !/scheme|schemes|about|what|tell|eligibility|benefit|योजना|बताओ|क्या|किसान|के|लिए/.test(word));
    const ranked = catalog.map((scheme) => {
      const searchable = `${scheme.nameEn || ''} ${scheme.nameHi || ''} ${scheme.category || ''} ${scheme.categoryHi || ''} ${(scheme.tags || []).join(' ')}`.toLowerCase();
      return { scheme, score: words.reduce((total, word) => total + (searchable.includes(word) ? 2 : 0), 0) };
    }).sort((a, b) => b.score - a.score);
    const match = ranked[0]?.score > 0 ? ranked[0].scheme : null;
    if (match) {
      const text = isHi
        ? `${match.nameHi}: ${match.summaryHi || match.benefitHi} पात्रता: ${match.eligibilityHi} ${match.launchDate ? `शुरुआत/घोषणा: ${match.launchDate}. ` : ''}आवेदन से पहले आधिकारिक स्रोत पर वर्तमान शर्तें जाँचें।`
        : `${match.nameEn}: ${match.summary || match.benefit} Eligibility: ${match.eligibility} ${match.launchDate ? `Launch/announcement: ${match.launchDate}. ` : ''}Check current terms on the official source before applying.`;
      return { text, page: 'schemes', label: isHi ? 'योजनाओं में खोलें' : 'Open in Schemes', externalUrl: match.sourceUrl || match.portalUrl, externalLabel: isHi ? 'आधिकारिक स्रोत' : 'Official source' };
    }
    return reply('Open Government Schemes to browse the bilingual catalogue and eligibility guidance. Check current rules and application dates on the linked official source.', 'हिंदी-अंग्रेज़ी योजना सूची और पात्रता जानकारी के लिए सरकारी योजनाएँ खोलें। मौजूदा नियम और आवेदन तारीखें आधिकारिक स्रोत पर जाँचें।', 'schemes', 'Explore Schemes', 'योजनाएँ देखें');
  }
  if (/mkisan|m.?kisan|sms advis|text advis|mobile advis|किसान एसएमएस|कृषि एसएमएस/.test(q)) return { text: isHi ? 'mKisan भारत सरकार का मोबाइल कृषि सलाह पोर्टल है। वहाँ अपने क्षेत्र और रुचि के अनुसार कृषि एवं संबद्ध क्षेत्रों की सलाह देखें। सेवा की उपलब्धता और पंजीकरण के मौजूदा निर्देश आधिकारिक पोर्टल पर जाँचें।' : 'mKisan is the Government of India’s mobile agriculture advisory portal. Visit it for agriculture and allied-sector advisories relevant to your area and interests. Check the official portal for current service availability and registration instructions.', externalUrl: 'https://mkisan.gov.in/', label: isHi ? 'mKisan पोर्टल खोलें' : 'Open mKisan portal' };
  if (/language|hindi|english|भाषा|हिंदी|अंग्रेज़ी/.test(q)) return reply('Use the language control in the header or Settings to switch between English and Hindi.', 'अंग्रेज़ी और हिंदी बदलने के लिए हेडर में भाषा नियंत्रण या सेटिंग्स का उपयोग करें।', 'settings', 'Open Settings', 'सेटिंग्स खोलें');
  if (/offline|internet|sync|ऑफलाइन|इंटरनेट|सिंक/.test(q)) return reply('KisanPulse shows the current connection state in the header. Crop calculations, irrigation guidance, saved observations, and buyer drafts work locally; live weather requires an internet connection.', 'KisanPulse हेडर में कनेक्शन स्थिति दिखाता है। फसल गणना, सिंचाई मार्गदर्शन, सहेजे गए निरीक्षण और खरीदार ड्राफ्ट डिवाइस पर चलते हैं; लाइव मौसम के लिए इंटरनेट चाहिए।', 'settings', 'Open Settings', 'सेटिंग्स खोलें');
  if (/dashboard|home|डैशबोर्ड|होम/.test(q)) return reply('The Dashboard summarizes farm indicators and offers shortcuts to the main tools.', 'डैशबोर्ड खेत के संकेतकों का सार और मुख्य औज़ारों के शॉर्टकट दिखाता है।', 'dashboard', 'Open Dashboard', 'डैशबोर्ड खोलें');
  return reply('I’m the KisanPulse guide. Ask me about mandi rates, profit estimates, crop observations, irrigation, weather, schemes, or app settings.', 'मैं KisanPulse मार्गदर्शक हूँ। मंडी भाव, लाभ अनुमान, फसल निरीक्षण, सिंचाई, मौसम, योजनाओं या ऐप सेटिंग्स के बारे में पूछें।');
}

export default function KisanAssistant({ onNavigate, language = 'en' }) {
  const isHi = language === 'hi';
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [tab, setTab] = useState('guide');
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [history, setHistory] = useState(() => [{ role: 'assistant', text: isHi ? 'नमस्ते! मैं KisanPulse मार्गदर्शक हूँ। आप खेती और ऐप के बारे में मुझसे पूछ सकते हैं।' : 'Namaste! I’m your KisanPulse guide. Ask me about farming or how to use the app.' }]);
  const [activity, setActivity] = useState({ reports: [], drafts: [] });
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const labels = useMemo(() => isHi ? { title: 'KisanPulse सहायक', subtitle: 'खेती और ऐप मार्गदर्शन', guide: 'मार्गदर्शक', updates: 'मेरी गतिविधि', ask: 'अपना सवाल लिखें…', send: 'भेजें', crop: 'फसल निरीक्षण', drafts: 'खरीदार ड्राफ्ट', none: 'अभी इस डिवाइस पर कुछ सहेजा नहीं गया है।', intro: 'मंडी, फसल, सिंचाई, मौसम या योजनाओं के बारे में पूछें।', mic: 'आवाज़ से सवाल बोलें', stopMic: 'आवाज़ सुनना रोकें', speaker: 'जवाब सुनें', autoVoiceOn: 'बोलकर जवाब चालू', autoVoiceOff: 'बोलकर जवाब बंद', voiceUnavailable: 'इस ब्राउज़र में आवाज़ की सुविधा उपलब्ध नहीं है।' } : { title: 'KisanPulse Assistant', subtitle: 'Farm help and app guide', guide: 'Guide', updates: 'My activity', ask: 'Ask about your farm…', send: 'Send', crop: 'Crop observations', drafts: 'Buyer enquiry drafts', none: 'Nothing saved on this device yet.', intro: 'Ask about mandi, crops, irrigation, weather, or schemes.', mic: 'Speak your question', stopMic: 'Stop listening', speaker: 'Read this reply aloud', autoVoiceOn: 'Turn voice replies on', autoVoiceOff: 'Turn voice replies off', voiceUnavailable: 'Voice features are not available in this browser.' }, [isHi]);

  useEffect(() => { if (open) { setActivity({ reports: getSaved('crop_reports'), drafts: getSaved('market_drafts') }); } }, [open, tab]);
  useEffect(() => {
    if (!open) return;
    fetch('/api/schemes').then((response) => response.ok ? response.json() : null).then((data) => {
      if (Array.isArray(data?.schemes)) localStorage.setItem('kisanpulse_schemes_cache', JSON.stringify(data.schemes));
    }).catch(() => {});
  }, [open]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [history]);
  useEffect(() => () => {
    clearTimeout(recordingTimerRef.current);
    if (mediaRecorderRef.current?.state && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const speak = (text) => {
    const spokenText = String(text || '').trim();
    if (!('speechSynthesis' in window) || !spokenText) { setVoiceNotice(labels.voiceUnavailable); return; }
    window.speechSynthesis.cancel();
    const hasDevanagari = /[\u0900-\u097F]/.test(spokenText);
    const hasLatin = /[A-Za-z]/.test(spokenText);
    const voiceLanguage = hasDevanagari ? 'hi-IN' : hasLatin ? 'en-IN' : (isHi ? 'hi-IN' : 'en-IN');
    const languagePrefix = voiceLanguage.slice(0, 2).toLowerCase();
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = voiceLanguage;
    utterance.rate = 0.96;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((voice) => voice.lang.toLowerCase() === voiceLanguage.toLowerCase())
      || voices.find((voice) => voice.lang.toLowerCase().startsWith(languagePrefix));
    const fallbackVoice = preferred || voices.find((voice) => voice.lang.toLowerCase().startsWith('en')) || voices[0];
    if (fallbackVoice) {
      utterance.voice = fallbackVoice;
      if (!preferred) utterance.lang = fallbackVoice.lang;
    }
    utterance.onstart = () => setVoiceNotice('');
    utterance.onerror = (event) => setVoiceNotice(event.error === 'voice-unavailable'
      ? (isHi ? 'इस डिवाइस में हिंदी आवाज़ उपलब्ध नहीं है। Windows की Speech settings में Hindi voice जोड़ें।' : 'No matching voice is installed. Check your device speech settings.')
      : (isHi ? 'आवाज़ नहीं चल पाई। फिर से स्पीकर दबाएँ।' : 'Could not play the voice. Press the speaker button to try again.'));
    if (!fallbackVoice) {
      setVoiceNotice(isHi ? 'इस डिवाइस में कोई आवाज़ उपलब्ध नहीं है। Windows की Speech settings जाँचें।' : 'No speech voice is installed on this device. Check Windows speech settings.');
      return;
    }
    setVoiceNotice('');
    window.speechSynthesis.speak(utterance);
  };
  const toggleListening = async () => {
    if (listening) {
      clearTimeout(recordingTimerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      return;
    }
    if (voiceBusy) return;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setVoiceNotice(isHi
        ? 'इस ब्राउज़र में रिकॉर्डिंग उपलब्ध नहीं है। Chrome या Edge में localhost पर खोलें।'
        : 'Audio recording is not available here. Open the app on localhost in Chrome or Edge.');
      return;
    }
    setVoiceBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
        .find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data?.size) audioChunksRef.current.push(event.data); };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        microphoneStreamRef.current = null;
        mediaRecorderRef.current = null;
        setListening(false);
        setVoiceBusy(false);
        setVoiceNotice(isHi ? 'माइक रिकॉर्डिंग में समस्या आई। अनुमति जाँचकर फिर प्रयास करें।' : 'Microphone recording failed. Check permission and try again.');
      };
      recorder.onstop = async () => {
        clearTimeout(recordingTimerRef.current);
        stream.getTracks().forEach((track) => track.stop());
        microphoneStreamRef.current = null;
        setListening(false);
        setVoiceBusy(true);
        setVoiceNotice(isHi ? 'आवाज़ लिखी जा रही है…' : 'Transcribing your recording…');
        try {
          const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          audioChunksRef.current = [];
          if (!blob.size) throw new Error(isHi ? 'कोई आवाज़ रिकॉर्ड नहीं हुई। फिर प्रयास करें।' : 'No audio was recorded. Please try again.');
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Could not read the recording.'));
            reader.readAsDataURL(blob);
          });
          const [dataHeader, audioBase64] = dataUrl.split(',', 2);
          const contentType = (dataHeader.match(/^data:([^;]+)/)?.[1] || blob.type.split(';')[0] || 'audio/webm').toLowerCase();
          const response = await fetch('/api/ai/assistant-transcribe', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ audioBase64, mimeType: contentType, language })
          });
          const result = await response.json();
          if (!response.ok || !result.transcript) throw new Error(result.error || 'Could not transcribe the recording.');
          setQuestion(result.transcript);
          setVoiceNotice(isHi ? 'आवाज़ लिख दी गई है। भेजने से पहले जाँच लें।' : 'Transcript ready. Review it, then press Send.');
        } catch (error) {
          setVoiceNotice(error.message || (isHi ? 'आवाज़ लिखी नहीं जा सकी। फिर प्रयास करें।' : 'Could not transcribe your recording. Please try again.'));
        } finally {
          setVoiceBusy(false);
          mediaRecorderRef.current = null;
        }
      };
      recorder.start();
      setListening(true);
      setVoiceBusy(false);
      setVoiceNotice(isHi ? 'अब बोलें; रोकने के लिए माइक फिर दबाएँ।' : 'Speak now; press the mic again when finished.');
      recordingTimerRef.current = setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 15000);
    } catch (error) {
      microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
      microphoneStreamRef.current = null;
      setListening(false);
      setVoiceBusy(false);
      setVoiceNotice(error.name === 'NotAllowedError'
        ? (isHi ? 'माइक की अनुमति नहीं मिली। ब्राउज़र में localhost के लिए माइक अनुमति दें।' : 'Microphone permission was denied. Allow microphone access for localhost in your browser.')
        : (isHi ? 'माइक शुरू नहीं हुआ। माइक कनेक्शन और अनुमति जाँचें।' : 'Could not start the microphone. Check its connection and permission.'));
    }
  };  const submit = async (event) => {
    event.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    setVoiceNotice('');
    setHistory((items) => [...items, { role: 'user', text }]);
    setQuestion('');
    setBusy(true);
    try {
      let response = await processFarmingQuery(text, language);
      const needsOpenAiHelp = /couldn.t find this exact detail|सटीक विवरण साइट डेटा में नहीं मिला/i.test(response.text || '');
      if (needsOpenAiHelp) {
        try {
          const apiResponse = await fetch('/api/ai/assistant-chat', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              question: text,
              language,
              history: history.slice(-8).map(({ role, text: message }) => ({ role, text: message }))
            })
          });
          const data = await apiResponse.json();
          if (!apiResponse.ok || !data.answer) throw new Error(data.error || 'Groq did not return an answer.');
          response = { text: data.answer };
        } catch {
          response = {
            ...response,
            text: `${response.text} ${language === 'hi' ? 'Groq AI अभी उपलब्ध नहीं है; यह जवाब स्थानीय गाइड से दिया गया है।' : 'Groq AI is unavailable right now; this reply is from the built-in guide.'}`
          };
        }
      }
      setHistory((items) => [...items, { ...response, role: 'assistant' }]);
      if (speakReplies) speak(response.text);
    } catch {
      const response = answerQuestion(text, language);
      setHistory((items) => [...items, { ...response, role: 'assistant' }]);
      if (speakReplies) speak(response.text);
    } finally { setBusy(false); }
  };  return <aside className="kp-assistant" aria-label={labels.title}>
    {open && !minimized && <section className="kp-assistant-panel" role="dialog" aria-modal="false" aria-labelledby="kp-assistant-title">
      <header className="kp-assistant-head"><span className="kp-assistant-avatar"><Bot size={22} /></span><span className="kp-assistant-title"><strong id="kp-assistant-title">{labels.title}</strong><small>{labels.subtitle}</small></span><button type="button" className="kp-assistant-icon-button" onClick={() => setMinimized(true)} aria-label={isHi ? 'छोटा करें' : 'Minimize'}><ChevronDown size={18}/></button><button type="button" className="kp-assistant-icon-button" onClick={() => setOpen(false)} aria-label={isHi ? 'बंद करें' : 'Close'}><X size={18}/></button></header>
      <div className="kp-assistant-tabs" role="tablist"><button type="button" role="tab" aria-selected={tab === 'guide'} className={tab === 'guide' ? 'active' : ''} onClick={() => setTab('guide')}><MessageCircle size={15}/>{labels.guide}</button><button type="button" role="tab" aria-selected={tab === 'activity'} className={tab === 'activity' ? 'active' : ''} onClick={() => setTab('activity')}><Leaf size={15}/>{labels.updates}</button></div>
      {tab === 'guide' ? <><div className="kp-assistant-messages" aria-live="polite">{history.map((item, index) => <div key={`${index}-${item.role}`} className={`kp-assistant-message ${item.role}`}><p>{item.text}</p>{item.role === 'assistant' && <button type="button" className="kp-assistant-voice-button" onClick={() => speak(item.text)} aria-label={labels.speaker} title={labels.speaker}><Volume2 size={14}/></button>}{item.page && <button type="button" className="kp-assistant-link" onClick={() => { onNavigate(item.page); setOpen(false); }}>{item.label} →</button>}{item.externalUrl && <a className="kp-assistant-link" href={item.externalUrl} target="_blank" rel="noreferrer">{item.externalLabel || item.label} ↗</a>}</div>)}{busy && <div className="kp-assistant-message assistant"><p>{isHi ? 'सोच रहा हूँ…' : 'Thinking…'}</p></div>}<div ref={bottomRef}/></div><form className="kp-assistant-form" onSubmit={submit}><input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={500} placeholder={labels.ask} aria-label={labels.ask}/><button type="button" className={`kp-assistant-voice-control${listening ? ' listening' : ''}`} onClick={toggleListening} disabled={voiceBusy} aria-label={voiceBusy ? (isHi ? 'आवाज़ लिखी जा रही है…' : 'Transcribing…') : listening ? labels.stopMic : labels.mic} title={listening ? labels.stopMic : labels.mic}>{listening ? <MicOff size={17}/> : <Mic size={17}/>}</button><button type="submit" aria-label={labels.send} disabled={!question.trim() || busy}><Send size={17}/></button></form><div className="kp-assistant-voice-options"><button type="button" onClick={() => { setSpeakReplies((value) => !value); if (speakReplies && 'speechSynthesis' in window) window.speechSynthesis.cancel(); }} aria-pressed={speakReplies} title={speakReplies ? labels.autoVoiceOff : labels.autoVoiceOn}>{speakReplies ? <VolumeX size={14}/> : <Volume2 size={14}/>} {speakReplies ? labels.autoVoiceOff : labels.autoVoiceOn}</button>{voiceNotice && <span role="status">{voiceNotice}</span>}</div><p className="kp-assistant-note">{labels.intro}</p></> : <div className="kp-assistant-activity">
        <h3>{labels.crop}</h3>{activity.reports.length ? activity.reports.slice(0, 4).map((item, index) => <article key={item.id || index}><strong>{item.crop || item.cropName || (isHi ? 'फसल निरीक्षण' : 'Crop observation')}</strong><p>{item.symptoms || item.notes || item.description || (isHi ? 'निरीक्षण सहेजा गया' : 'Observation saved')}</p></article>) : <p className="kp-assistant-empty">{labels.none}</p>}
        <h3>{labels.drafts}</h3>{activity.drafts.length ? activity.drafts.slice(0, 4).map((item, index) => <article key={item.id || index}><strong>{item.cropName || item.targetMarket || item.crop || item.market || (isHi ? 'खरीदार ड्राफ्ट' : 'Buyer draft')}</strong><p>{item.notes || item.message || item.buyer || (isHi ? 'ड्राफ्ट इस डिवाइस पर सहेजा गया' : 'Draft saved on this device')}</p></article>) : <p className="kp-assistant-empty">{labels.none}</p>}
        <p className="kp-assistant-note">{isHi ? 'यह गतिविधि केवल इसी ब्राउज़र में सहेजी गई है।' : 'This activity is stored in this browser on this device.'}</p>
      </div>}
    </section>}
    {open && minimized && <div className="kp-assistant-mini"><span>{labels.title}</span><button type="button" onClick={() => setMinimized(false)}>{isHi ? 'फिर खोलें' : 'Restore'}</button></div>}
    <button type="button" className="kp-assistant-fab" onClick={() => { setOpen((value) => !value); setMinimized(false); }} aria-expanded={open && !minimized} aria-label={open ? (isHi ? 'सहायक बंद करें' : 'Close assistant') : (isHi ? 'सहायक खोलें' : 'Open assistant')}><span className="kp-assistant-bot"><span className="kp-assistant-antenna"/><span className="kp-assistant-eyes"><i/><i/></span></span><span className="kp-assistant-fab-label">{open ? <X size={18}/> : <MessageCircle size={18}/>}</span></button>
  </aside>;
}



