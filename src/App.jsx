import React, { useState, useEffect } from 'react';
import { BookOpen, Send, Loader2, Heart, User, Calendar, Share2, Star, BookMarked, Plus, X, Menu, Home, Crown, Users } from 'lucide-react';

export default function BiblicalGuidanceApp() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [userTier, setUserTier] = useState('free');
  const [questionsToday, setQuestionsToday] = useState(0);
  const [lastQuestionDate, setLastQuestionDate] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [churchCode, setChurchCode] = useState('');
  const [churchName, setChurchName] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '', email: '', phone: '', churchName: '', message: ''
  });
  const [stripeLoading, setStripeLoading] = useState(false);
  
  const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SmIS3BrYJWG1fHoknt8tWaPGaKTxxOI9YRkXgce6fjHzZfQam3MiRAGxW0dwkhkoNT1xXVGPEeYFuvz1SqY7HB200waXtmSzp';
  const STRIPE_PRICE_ID_MONTHLY = 'price_1SmKbEBrYJWG1fHopEY2owKh';
  const STRIPE_PRICE_ID_ANNUAL = 'price_1SmKbEBrYJWG1fHo3DZ8Kw9L';
  
  const [currentView, setCurrentView] = useState('home');
  const [showMenu, setShowMenu] = useState(false);
  
  const [savedResponses, setSavedResponses] = useState([]);
  const [prayerJournal, setPrayerJournal] = useState([]);
  const [newPrayerEntry, setNewPrayerEntry] = useState('');
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [shareToCommunity, setShareToCommunity] = useState(false);
  const [prayerCategory, setPrayerCategory] = useState('');
  
  const [communityPrayers, setCommunityPrayers] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [prayedForIds, setPrayedForIds] = useState([]);
  const [savedDailyVerse, setSavedDailyVerse] = useState(false);
  const [sharedPrayerIds, setSharedPrayerIds] = useState([]);
  const [showVerseNotification, setShowVerseNotification] = useState(false);
  
  const [bibleBook, setBibleBook] = useState('Genesis');
  const [bibleChapter, setBibleChapter] = useState(1);
  const [bibleText, setBibleText] = useState(null);
  const [loadingBible, setLoadingBible] = useState(false);
  const [readingPlan, setReadingPlan] = useState([]);
  const [completedReadings, setCompletedReadings] = useState([]);
  
  const [dailyVerse, setDailyVerse] = useState(null);
  const [showDailyVerse, setShowDailyVerse] = useState(false);

  const prayerCategories = [
    { value: 'health', label: 'Health & Healing', emoji: '🏥' },
    { value: 'family', label: 'Family & Relationships', emoji: '👨‍👩‍👧‍👦' },
    { value: 'work', label: 'Work & Career', emoji: '💼' },
    { value: 'financial', label: 'Financial Needs', emoji: '💰' },
    { value: 'spiritual', label: 'Spiritual Growth', emoji: '✝️' },
    { value: 'guidance', label: 'Guidance & Decisions', emoji: '🧭' },
    { value: 'thanksgiving', label: 'Thanksgiving', emoji: '🙏' },
    { value: 'other', label: 'Other', emoji: '💭' }
  ];

  const bibleBooks = [
    { name: 'Genesis', chapters: 50 }, { name: 'Exodus', chapters: 40 }, { name: 'Leviticus', chapters: 27 },
    { name: 'Numbers', chapters: 36 }, { name: 'Deuteronomy', chapters: 34 }, { name: 'Joshua', chapters: 24 },
    { name: 'Judges', chapters: 21 }, { name: 'Ruth', chapters: 4 }, { name: '1 Samuel', chapters: 31 },
    { name: '2 Samuel', chapters: 24 }, { name: '1 Kings', chapters: 22 }, { name: '2 Kings', chapters: 25 },
    { name: '1 Chronicles', chapters: 29 }, { name: '2 Chronicles', chapters: 36 }, { name: 'Ezra', chapters: 10 },
    { name: 'Nehemiah', chapters: 13 }, { name: 'Esther', chapters: 10 }, { name: 'Job', chapters: 42 },
    { name: 'Psalms', chapters: 150 }, { name: 'Proverbs', chapters: 31 }, { name: 'Ecclesiastes', chapters: 12 },
    { name: 'Song of Solomon', chapters: 8 }, { name: 'Isaiah', chapters: 66 }, { name: 'Jeremiah', chapters: 52 },
    { name: 'Lamentations', chapters: 5 }, { name: 'Ezekiel', chapters: 48 }, { name: 'Daniel', chapters: 12 },
    { name: 'Hosea', chapters: 14 }, { name: 'Joel', chapters: 3 }, { name: 'Amos', chapters: 9 },
    { name: 'Obadiah', chapters: 1 }, { name: 'Jonah', chapters: 4 }, { name: 'Micah', chapters: 7 },
    { name: 'Nahum', chapters: 3 }, { name: 'Habakkuk', chapters: 3 }, { name: 'Zephaniah', chapters: 3 },
    { name: 'Haggai', chapters: 2 }, { name: 'Zechariah', chapters: 14 }, { name: 'Malachi', chapters: 4 },
    { name: 'Matthew', chapters: 28 }, { name: 'Mark', chapters: 16 }, { name: 'Luke', chapters: 24 },
    { name: 'John', chapters: 21 }, { name: 'Acts', chapters: 28 }, { name: 'Romans', chapters: 16 },
    { name: '1 Corinthians', chapters: 16 }, { name: '2 Corinthians', chapters: 13 }, { name: 'Galatians', chapters: 6 },
    { name: 'Ephesians', chapters: 6 }, { name: 'Philippians', chapters: 4 }, { name: 'Colossians', chapters: 4 },
    { name: '1 Thessalonians', chapters: 5 }, { name: '2 Thessalonians', chapters: 3 }, { name: '1 Timothy', chapters: 6 },
    { name: '2 Timothy', chapters: 4 }, { name: 'Titus', chapters: 3 }, { name: 'Philemon', chapters: 1 },
    { name: 'Hebrews', chapters: 13 }, { name: 'James', chapters: 5 }, { name: '1 Peter', chapters: 5 },
    { name: '2 Peter', chapters: 3 }, { name: '1 John', chapters: 5 }, { name: '2 John', chapters: 1 },
    { name: '3 John', chapters: 1 }, { name: 'Jude', chapters: 1 }, { name: 'Revelation', chapters: 22 }
  ];

  useEffect(() => {
    loadUserData();
    loadCommunityPrayers();
    checkDailyVerse();
    generateReadingPlan();
  }, [isLoggedIn, username]);

  const loadUserData = async () => {
    if (!isLoggedIn || !username) return;
    try {
      const savedData = await window.storage.get(`saved_${username}`);
      const journalData = await window.storage.get(`journal_${username}`);
      const readingsData = await window.storage.get(`completed_readings_${username}`);
      const userData = await window.storage.get(`user_data_${username}`);
      
      if (savedData) setSavedResponses(JSON.parse(savedData.value));
      if (journalData) setPrayerJournal(JSON.parse(journalData.value));
      if (readingsData) setCompletedReadings(JSON.parse(readingsData.value));
      if (userData) {
        const parsed = JSON.parse(userData.value);
        setUserTier(parsed.tier || 'free');
        setQuestionsToday(parsed.questionsToday || 0);
        setLastQuestionDate(parsed.lastQuestionDate || '');
        setChurchCode(parsed.churchCode || '');
        setChurchName(parsed.churchName || '');
      }
    } catch (err) {
      console.log('No saved data found');
    }
  };

  const loadCommunityPrayers = async () => {
    try {
      const result = await window.storage.get('community_prayers', true);
      if (result) setCommunityPrayers(JSON.parse(result.value));
    } catch (err) {
      setCommunityPrayers([]);
    }
  };

  const generateReadingPlan = () => {
    const plan = [];
    let dayCount = 0;
    const totalChapters = bibleBooks.reduce((sum, book) => sum + book.chapters, 0);
    const chaptersPerDay = Math.ceil(totalChapters / 365);
    
    let currentDay = [];
    bibleBooks.forEach(book => {
      for (let ch = 1; ch <= book.chapters; ch++) {
        currentDay.push({ book: book.name, chapter: ch });
        if (currentDay.length === chaptersPerDay) {
          dayCount++;
          plan.push({ day: dayCount, readings: [...currentDay] });
          currentDay = [];
        }
      }
    });
    
    if (currentDay.length > 0) {
      dayCount++;
      plan.push({ day: dayCount, readings: currentDay });
    }
    
    setReadingPlan(plan);
  };

  const fetchBibleChapter = async (book, chapter) => {
    setLoadingBible(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `Provide the full text of ${book} chapter ${chapter} from the Bible using the New Living Translation (NLT). Format as JSON: {"book": "${book}", "chapter": ${chapter}, "verses": [{"verse": 1, "text": "verse text"}]}. No markdown, just JSON.`
          }]
        })
      });

      const data = await response.json();
      if (data.error) {
        console.error('API error:', data.error);
        alert('Error loading Bible text: ' + (data.error.message || 'Please try again.'));
        return;
      }
      if (data.content && data.content[0]) {
        let text = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(text);
        setBibleText(parsed);
        setCurrentView('bible');
      }
    } catch (err) {
      console.error('Error fetching Bible text:', err);
      alert('Error loading Bible text. Please try again.');
    } finally {
      setLoadingBible(false);
    }
  };

  const goToVerse = (reference) => {
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)/);
    if (match) {
      const [, book, chapter] = match;
      setBibleBook(book);
      setBibleChapter(parseInt(chapter));
      fetchBibleChapter(book, parseInt(chapter));
    }
  };

  const markReadingComplete = (day, reading) => {
    const key = `${day}-${reading.book}-${reading.chapter}`;
    if (!completedReadings.includes(key)) {
      setCompletedReadings([...completedReadings, key]);
    }
  };

  const isReadingComplete = (day, reading) => {
    const key = `${day}-${reading.book}-${reading.chapter}`;
    return completedReadings.includes(key);
  };

  const saveUserData = async () => {
    if (!isLoggedIn || !username) return;
    try {
      await window.storage.set(`saved_${username}`, JSON.stringify(savedResponses));
      await window.storage.set(`journal_${username}`, JSON.stringify(prayerJournal));
      await window.storage.set(`completed_readings_${username}`, JSON.stringify(completedReadings));
      await window.storage.set(`user_data_${username}`, JSON.stringify({
        tier: userTier, questionsToday, lastQuestionDate, churchCode, churchName
      }));
    } catch (err) {
      console.error('Error saving data:', err);
    }
  };

  useEffect(() => {
    saveUserData();
  }, [savedResponses, prayerJournal, completedReadings, userTier, questionsToday, lastQuestionDate]);

  const checkDailyVerse = async () => {
    const today = new Date().toDateString();
    try {
      const verseData = await window.storage.get('daily_verse', true);
      if (verseData) {
        const parsed = JSON.parse(verseData.value);
        if (parsed.date === today) {
          setDailyVerse(parsed);
          return;
        }
      }
    } catch (err) {
      console.log('Will generate new verse');
    }
    await generateDailyVerse();
  };

  const generateDailyVerse = async () => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Provide one inspirational Bible verse for today with a brief reflection (2-3 sentences). Use the New Living Translation (NLT). Format as JSON: {"reference": "Book Chapter:Verse", "text": "verse text in NLT", "reflection": "brief reflection"}`
          }]
        })
      });

      const data = await response.json();
      if (data.error) {
        console.error('API error generating daily verse:', data.error);
        return;
      }
      if (data.content && data.content[0]) {
        let text = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const verse = JSON.parse(text);
        const dailyData = { ...verse, date: new Date().toDateString() };
        setDailyVerse(dailyData);
        await window.storage.set('daily_verse', JSON.stringify(dailyData), true);
        setShowVerseNotification(true);
        setTimeout(() => setShowVerseNotification(false), 5000);
      }
    } catch (err) {
      console.error('Error generating daily verse:', err);
    }
  };

  const handleAuth = async () => {
    if (!authUsername.trim() || !authPassword.trim()) {
      setError('Please enter username and password');
      return;
    }

    if (authMode === 'signup') {
      if (!authEmail.trim()) {
        setError('Please enter your email address');
        return;
      }
      try {
        await window.storage.set(`credentials_${authUsername}`, JSON.stringify({
          password: authPassword,
          email: authEmail
        }));
      } catch (err) {
        console.error('Error storing credentials:', err);
      }
      setUsername(authUsername);
      setIsLoggedIn(true);
      setUserTier('free');
      setQuestionsToday(0);
      setLastQuestionDate(new Date().toDateString());
    } else {
      try {
        const storedCreds = await window.storage.get(`credentials_${authUsername}`);
        if (storedCreds) {
          const creds = JSON.parse(storedCreds.value);
          if (creds.password !== authPassword) {
            setError('Incorrect password');
            return;
          }
        }
      } catch (err) {
        console.log('No stored credentials found, allowing login');
      }
      setUsername(authUsername);
      setIsLoggedIn(true);
    }

    setShowAuthModal(false);
    setShowForgotPassword(false);
    setError('');
    setAuthUsername('');
    setAuthPassword('');
    setAuthEmail('');
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      await window.storage.set(`password_reset_${Date.now()}`, JSON.stringify({
        email: forgotPasswordEmail,
        timestamp: new Date().toISOString(),
        status: 'pending'
      }), true);
    } catch (err) {
      console.error('Error storing reset request:', err);
    }

    setResetEmailSent(true);
    setError('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserTier('free');
    setQuestionsToday(0);
    setSavedResponses([]);
    setPrayerJournal([]);
    setCurrentView('home');
  };

  const checkDailyLimit = () => {
    const today = new Date().toDateString();
    if (lastQuestionDate !== today) {
      setQuestionsToday(0);
      setLastQuestionDate(today);
      return true;
    }
    if (userTier === 'premium' || userTier === 'church') return true;
    if (questionsToday >= 3) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const upgradeToPremium = () => {
    setUserTier('premium');
    setShowUpgradeModal(false);
    alert('Premium activated! You now have unlimited questions and advanced features.');
  };

  const handleStripeCheckout = async () => {
    if (STRIPE_PUBLISHABLE_KEY === 'pk_test_YOUR_PUBLISHABLE_KEY_HERE') {
      alert('⚠️ Stripe Integration Setup Required');
      return;
    }
    setStripeLoading(true);
    try {
      const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: STRIPE_PRICE_ID_MONTHLY, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}?payment=success`,
        cancelUrl: `${window.location.origin}?payment=cancel`,
        customerEmail: username + '@example.com',
        clientReferenceId: username,
      });
      if (error) alert('Payment error: ' + error.message);
    } catch (err) {
      alert('Unable to process payment. Please try again.');
    } finally {
      setStripeLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus === 'success') {
      setUserTier('premium');
      alert('🎉 Payment successful! Welcome to Premium!');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'cancel') {
      alert('Payment cancelled.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const submitContactForm = async () => {
    if (!contactInfo.name || !contactInfo.email) {
      alert('Please fill in your name and email');
      return;
    }
    try {
      await window.storage.set(`contact_request_${Date.now()}`, JSON.stringify({
        ...contactInfo, timestamp: new Date().toISOString()
      }), true);
      alert('Thank you! We will contact you within 24 hours.');
      setShowContactForm(false);
      setShowUpgradeModal(false);
      setContactInfo({ name: '', email: '', phone: '', churchName: '', message: '' });
    } catch (err) {
      alert('There was an error. Please email us directly.');
    }
  };

  const checkFeatureAccess = (feature) => {
    if (userTier === 'premium' || userTier === 'church') return true;
    const premiumFeatures = ['community', 'journal', 'reading-plan'];
    if (premiumFeatures.includes(feature)) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (!checkDailyLimit()) return;

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a compassionate spiritual guide. Question: "${question}". Provide: 1) Compassionate response 2) 2-3 relevant Bible verses (NLT) 3) What Jesus would do 4) Encouragement. Format as JSON: {"compassionateResponse": "", "verses": [{"reference": "", "text": ""}], "wwjd": "", "encouragement": ""}`
          }]
        })
      });

      const data = await apiResponse.json();
      if (data.error) {
        console.error('API error:', data.error);
        setError('API error: ' + (data.error.message || 'Please try again.'));
        return;
      }
      if (data.content && data.content[0]) {
        let textResponse = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsedResponse = JSON.parse(textResponse);
        setResponse({ ...parsedResponse, question, timestamp: new Date().toISOString() });
        setQuestionsToday(questionsToday + 1);
      } else {
        setError('Unable to get a response. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting question:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveResponse = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setSavedResponses([response, ...savedResponses]);
    alert('Response saved!');
  };

  const shareResponse = () => {
    const shareText = `${response.verses[0].text} - ${response.verses[0].reference}`;
    if (navigator.share) {
      navigator.share({ text: shareText, title: 'VerseAid.ai' });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Verse copied to clipboard!');
    }
  };

  const addPrayerEntry = async () => {
    if (!newPrayerEntry.trim()) return;
    const entry = {
      id: Date.now(),
      text: newPrayerEntry,
      date: new Date().toISOString(),
      answered: false,
      category: prayerCategory || 'other'
    };
    setPrayerJournal([entry, ...prayerJournal]);
    
    if (shareToCommunity) {
      const communityEntry = { ...entry, prayerCount: 0 };
      const updatedCommunity = [communityEntry, ...communityPrayers];
      setCommunityPrayers(updatedCommunity);
      try {
        await window.storage.set('community_prayers', JSON.stringify(updatedCommunity), true);
      } catch (err) {
        console.error('Error saving community prayer');
      }
    }
    
    setNewPrayerEntry('');
    setShareToCommunity(false);
    setPrayerCategory('');
    setShowPrayerModal(false);
  };

  const sharePrayerToCommunity = async (journalEntry) => {
    const communityEntry = {
      id: Date.now(),
      text: journalEntry.text,
      date: journalEntry.date,
      prayerCount: 0,
      category: journalEntry.category || 'other'
    };
    const updatedCommunity = [communityEntry, ...communityPrayers];
    setCommunityPrayers(updatedCommunity);
    setSharedPrayerIds([...sharedPrayerIds, journalEntry.id]);
    try {
      await window.storage.set('community_prayers', JSON.stringify(updatedCommunity), true);
      alert('Prayer shared with the community!');
    } catch (err) {
      console.error('Error sharing prayer');
    }
  };

  const deleteSavedResponse = (index) => {
    setSavedResponses(savedResponses.filter((_, i) => i !== index));
  };

  const prayForRequest = async (id) => {
    setPrayedForIds([...prayedForIds, id]);
    const updated = communityPrayers.map(p => 
      p.id === id ? { ...p, prayerCount: p.prayerCount + 1 } : p
    );
    setCommunityPrayers(updated);
    try {
      await window.storage.set('community_prayers', JSON.stringify(updated), true);
    } catch (err) {
      console.error('Error updating prayer count');
    }
  };

  const saveDailyVerseToCollection = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (!dailyVerse) return;
    const verseResponse = {
      question: "Today's Daily Verse",
      verses: [{ reference: dailyVerse.reference, text: dailyVerse.text }],
      compassionateResponse: dailyVerse.reflection,
      wwjd: "",
      encouragement: "",
      timestamp: new Date().toISOString()
    };
    setSavedResponses([verseResponse, ...savedResponses]);
    setSavedDailyVerse(true);
    setTimeout(() => setSavedDailyVerse(false), 2000);
  };

  const filteredCommunityPrayers = filterCategory === 'all' 
    ? communityPrayers 
    : communityPrayers.filter(p => p.category === filterCategory);

  const togglePrayerAnswered = (id) => {
    setPrayerJournal(prayerJournal.map(p => 
      p.id === id ? { ...p, answered: !p.answered } : p
    ));
  };

  const deletePrayerEntry = (id) => {
    setPrayerJournal(prayerJournal.filter(p => p.id !== id));
  };

  const exampleQuestions = [
    "I'm feeling anxious about my future. What does the Bible say?",
    "How do I forgive someone who hurt me deeply?",
    "I'm struggling with loneliness. Where can I find comfort?",
    "How should I handle conflict with a family member?"
  ];

  const renderHome = () => (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>

      {showVerseNotification && (
        <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-4 rounded-lg shadow-2xl animate-bounce">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <div>
              <p className="font-bold">New Daily Verse! 📖</p>
              <p className="text-sm opacity-90">Tap banner to read</p>
            </div>
          </div>
        </div>
      )}

      {dailyVerse && !showDailyVerse && (
        <div 
          onClick={() => setShowDailyVerse(true)}
          className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-6 mb-8 cursor-pointer hover:border-yellow-500/40 hover:shadow-yellow-500/20 transition-all"
        >
          <div className="flex items-start gap-3">
            <Calendar className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-500 mb-2 font-playfair">Today's Verse</h3>
              <p className="text-sm text-gray-300 italic line-clamp-2">"{dailyVerse.text}"</p>
              <p className="text-xs text-yellow-500 mt-1 font-bold">— {dailyVerse.reference}</p>
              <p className="text-xs text-gray-400 mt-2">Tap to read reflection →</p>
            </div>
          </div>
        </div>
      )}

      {showDailyVerse && dailyVerse && (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-yellow-500 font-playfair">Today's Verse & Reflection</h3>
            <div className="flex gap-2">
              <button 
                onClick={saveDailyVerseToCollection}
                className={`p-2 rounded-lg transition-all ${
                  savedDailyVerse 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-gray-800 hover:bg-gray-700 text-yellow-500 border border-yellow-500/20'
                }`}
              >
                <Star className={`w-5 h-5 ${savedDailyVerse ? 'fill-current' : ''}`} />
              </button>
              <button onClick={() => setShowDailyVerse(false)} className="text-gray-400 hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-900 border border-yellow-500/20 rounded-xl p-6">
              <p className="text-gray-300 italic mb-2">"{dailyVerse.text}"</p>
              <p className="text-sm font-bold text-yellow-500">— {dailyVerse.reference}</p>
            </div>
            <div className="bg-gray-900 border border-yellow-500/20 rounded-xl p-6">
              <p className="text-sm text-gray-300 leading-relaxed">{dailyVerse.reflection}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 shadow-lg rounded-2xl p-8 mb-8 hover:border-yellow-500/40 hover:shadow-yellow-500/10 transition-all">
        {isLoggedIn && userTier === 'free' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-yellow-500">
                  Daily Questions: {questionsToday}/3 used
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Upgrade to Premium for unlimited access
                </p>
              </div>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
              >
                Upgrade ✨
              </button>
            </div>
          </div>
        )}

        {isLoggedIn && (userTier === 'premium' || userTier === 'church') && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-black" />
              <p className="text-sm font-bold text-black">
                {userTier === 'premium' ? '👑 PREMIUM' : `${churchName} Member`} - Unlimited Questions
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-yellow-500 mb-2">
              What's on your heart today?
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Share your question, concern, or situation..."
              className="w-full px-6 py-4 bg-gray-900 border border-yellow-500/20 rounded-xl text-gray-100 placeholder-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 resize-none transition-all"
              rows="5"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-2xl hover:shadow-yellow-500/50 disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Seeking guidance...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                ✨ Get Biblical Guidance
              </>
            )}
          </button>
        </div>

        {!response && !loading && (
          <div className="mt-8 pt-8 border-t border-yellow-500/10">
            <p className="text-sm font-semibold text-gray-400 mb-4">Try asking:</p>
            <div className="space-y-2">
              {exampleQuestions.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(example)}
                  className="w-full text-left px-6 py-3 bg-gray-900/50 hover:bg-gray-800/80 border border-yellow-500/10 hover:border-yellow-500/30 text-gray-300 rounded-xl text-sm transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {response && (
        <div className="space-y-6">
          <div className="flex gap-3 justify-center">
            <button
              onClick={saveResponse}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 border border-yellow-500/30 hover:border-yellow-500/50 text-yellow-500 font-bold rounded-xl transition-all"
            >
              <Star className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={shareResponse}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg hover:shadow-yellow-500/50 text-black font-bold rounded-xl transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-8 hover:border-yellow-500/40 transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-yellow-500 mb-3 font-playfair">A Word of Understanding</h2>
                <p className="text-gray-300 leading-relaxed">{response.compassionateResponse}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-yellow-500 mb-4 font-playfair">Scripture for Your Journey</h2>
                <div className="space-y-4">
                  {response.verses.map((verse, idx) => (
                    <div key={idx} className="bg-gray-900 border border-yellow-500/20 rounded-xl p-6">
                      <p className="text-gray-300 italic mb-3">"{verse.text}"</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-yellow-500">— {verse.reference}</p>
                        <button
                          onClick={() => goToVerse(verse.reference)}
                          className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg hover:shadow-yellow-500/50 text-black font-bold px-4 py-2 rounded-lg transition-all"
                        >
                          Go to Verse →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-yellow-500 mb-3 font-playfair">What Would Jesus Do?</h2>
            <p className="text-gray-300 leading-relaxed">{response.wwjd}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-yellow-500 mb-3 font-playfair">Words of Encouragement</h2>
            <p className="text-gray-300 leading-relaxed">{response.encouragement}</p>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setQuestion('');
                setResponse(null);
                setError('');
              }}
              className="bg-gray-900 border border-yellow-500/30 hover:border-yellow-500/50 text-yellow-500 font-bold py-3 px-8 rounded-xl transition-all"
            >
              Ask Another Question
            </button>
          </div>
        </div>
      )}
    </>
  );

  // Render other views (Saved, Journal, Community, Bible, Reading Plan) - continued from previous
  const renderSaved = () => (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-white mb-4 font-playfair">Saved Responses</h2>
      {savedResponses.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-8 text-center">
          <BookMarked className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No saved responses yet. Save your favorite guidance to revisit later!</p>
        </div>
      ) : (
        savedResponses.map((item, idx) => (
          <div key={idx} className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-6 hover:border-yellow-500/40 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500 mb-2">{new Date(item.timestamp).toLocaleDateString()}</p>
                <p className="font-bold text-gray-300 mb-3">Q: {item.question}</p>
              </div>
              <button 
                onClick={() => deleteSavedResponse(idx)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {item.verses.map((v, i) => (
                <div key={i} className="bg-gray-900 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-sm italic text-gray-300">"{v.text}"</p>
                  <p className="text-xs text-yellow-500 mt-1 font-bold">— {v.reference}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderJournal = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-white font-playfair">Prayer Journal</h2>
        <button
          onClick={() => setShowPrayerModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg hover:shadow-yellow-500/50 text-black font-bold px-4 py-2 rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Prayer
        </button>
      </div>

      {prayerJournal.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-8 text-center">
          <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Start your prayer journal by adding your first prayer request.</p>
        </div>
      ) : (
        prayerJournal.map((entry) => (
          <div key={entry.id} className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-6 hover:border-yellow-500/40 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                {entry.category && (
                  <span className="inline-block mt-1 px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded border border-yellow-500/20 font-medium">
                    {prayerCategories.find(c => c.value === entry.category)?.emoji} {prayerCategories.find(c => c.value === entry.category)?.label}
                  </span>
                )}
              </div>
              <button onClick={() => deletePrayerEntry(entry.id)} className="text-gray-500 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-300 mb-3">{entry.text}</p>
            <div className="flex gap-2">
              <button
                onClick={() => togglePrayerAnswered(entry.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold transition-all border ${
                  entry.answered 
                    ? 'bg-green-900/30 text-green-400 border-green-500/30 hover:bg-green-900/50' 
                    : 'bg-gray-800/30 text-gray-400 border-gray-700/30 hover:bg-gray-800/50'
                }`}
              >
                {entry.answered ? '✓ Answered' : 'Mark as Answered'}
              </button>
              <button
                onClick={() => sharePrayerToCommunity(entry)}
                disabled={sharedPrayerIds.includes(entry.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                  sharedPrayerIds.includes(entry.id)
                    ? 'bg-green-900/30 text-green-400 cursor-not-allowed'
                    : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20'
                }`}
              >
                <Share2 className="w-4 h-4" />
                {sharedPrayerIds.includes(entry.id) ? 'Shared' : 'Share'}
              </button>
            </div>
          </div>
        ))
      )}

      {showPrayerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4 font-playfair">Add Prayer Request</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-yellow-500 mb-2">Category</label>
              <select
                value={prayerCategory}
                onChange={(e) => setPrayerCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 focus:ring-2 focus:ring-yellow-500/20"
              >
                <option value="">Select a category (optional)</option>
                {prayerCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <textarea
              value={newPrayerEntry}
              onChange={(e) => setNewPrayerEntry(e.target.value)}
              placeholder="What would you like to pray about?"
              className="w-full px-4 py-3 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 placeholder-gray-500 mb-4 resize-none focus:ring-2 focus:ring-yellow-500/20"
              rows="4"
            />
            
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareToCommunity}
                  onChange={(e) => setShareToCommunity(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-bold text-yellow-500">Share to Community</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Let others pray for your request. All prayers are anonymous.
                  </p>
                </div>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={addPrayerEntry}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg text-black font-bold py-2 rounded-lg"
              >
                Add Prayer
              </button>
              <button
                onClick={() => {
                  setShowPrayerModal(false);
                  setNewPrayerEntry('');
                  setShareToCommunity(false);
                  setPrayerCategory('');
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCommunity = () => (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2 font-playfair">Community Prayer Wall</h2>
        <p className="text-gray-400 text-sm mb-4">Join others in prayer. All requests are anonymous.</p>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              filterCategory === 'all'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg'
                : 'bg-gray-900 text-gray-300 border border-yellow-500/20 hover:border-yellow-500/40'
            }`}
          >
            All Prayers
          </button>
          {prayerCategories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filterCategory === cat.value
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg'
                  : 'bg-gray-900 text-gray-300 border border-yellow-500/20 hover:border-yellow-500/40'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {filteredCommunityPrayers.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-8 text-center">
          <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            {filterCategory === 'all' 
              ? 'No community prayer requests yet.' 
              : `No prayers in this category yet.`}
          </p>
          <p className="text-sm text-gray-500">Share a prayer request with the community!</p>
        </div>
      ) : (
        filteredCommunityPrayers.map((prayer) => {
          const hasPrayed = prayedForIds.includes(prayer.id);
          const category = prayerCategories.find(c => c.value === prayer.category);
          
          return (
            <div key={prayer.id} className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-6 hover:border-yellow-500/40 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-300">Anonymous</p>
                    <p className="text-xs text-gray-500">{new Date(prayer.date).toLocaleDateString()}</p>
                  </div>
                </div>
                {category && (
                  <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded border border-yellow-500/20 font-medium">
                    {category.emoji} {category.label}
                  </span>
                )}
              </div>
              
              <p className="text-gray-300 mb-4 leading-relaxed">{prayer.text}</p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => prayForRequest(prayer.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold ${
                    hasPrayed
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg'
                      : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${hasPrayed ? 'fill-current' : ''}`} />
                  {hasPrayed ? "I'm Praying" : "I'll Pray"}
                </button>
                <span className="text-sm text-gray-400 font-medium">
                  {prayer.prayerCount} {prayer.prayerCount === 1 ? 'person' : 'people'} praying
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderBible = () => (
    <div className="space-y-6">
      {loadingBible && (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Loading Bible chapter...</p>
        </div>
      )}

      {!loadingBible && !bibleText && (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-white mb-4 font-playfair">Read the Bible</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-yellow-500 mb-2">Book</label>
              <select
                value={bibleBook}
                onChange={(e) => setBibleBook(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 focus:ring-2 focus:ring-yellow-500/20"
              >
                {bibleBooks.map(book => (
                  <option key={book.name} value={book.name}>{book.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-yellow-500 mb-2">Chapter</label>
              <select
                value={bibleChapter}
                onChange={(e) => setBibleChapter(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 focus:ring-2 focus:ring-yellow-500/20"
              >
                {Array.from({ length: bibleBooks.find(b => b.name === bibleBook)?.chapters || 1 }, (_, i) => i + 1).map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={() => fetchBibleChapter(bibleBook, bibleChapter)}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-2xl hover:shadow-yellow-500/50 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <BookOpen className="w-5 h-5" />
            Read Chapter
          </button>
        </div>
      )}

      {!loadingBible && bibleText && (
        <>
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-yellow-500 font-playfair">
                {bibleText.book} {bibleText.chapter} <span className="text-sm font-normal text-gray-500">(NLT)</span>
              </h3>
              <button
                onClick={() => setBibleText(null)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              {bibleText.verses.map((v, idx) => (
                <p key={idx} className="text-gray-300 leading-relaxed">
                  <span className="font-bold text-yellow-500 mr-2">{v.verse}</span>
                  {v.text}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 font-playfair">Navigate to Another Chapter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-yellow-500 mb-2">Book</label>
                <select
                  value={bibleBook}
                  onChange={(e) => setBibleBook(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 focus:ring-2 focus:ring-yellow-500/20"
                >
                  {bibleBooks.map(book => (
                    <option key={book.name} value={book.name}>{book.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-yellow-500 mb-2">Chapter</label>
                <select
                  value={bibleChapter}
                  onChange={(e) => setBibleChapter(parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 focus:ring-2 focus:ring-yellow-500/20"
                >
                  {Array.from({ length: bibleBooks.find(b => b.name === bibleBook)?.chapters || 1 }, (_, i) => i + 1).map(ch => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={() => fetchBibleChapter(bibleBook, bibleChapter)}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-2xl hover:shadow-yellow-500/50 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Go to Chapter
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderReadingPlan = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    const todaysPlan = readingPlan[dayOfYear - 1];

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-white mb-2 font-playfair">Bible in a Year</h2>
          <p className="text-gray-300 mb-4">Complete the entire Bible in 365 days</p>
          
          <div className="bg-gray-900 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-300">Progress</span>
              <span className="text-sm text-gray-400 font-medium">
                {completedReadings.length} / {readingPlan.reduce((sum, day) => sum + day.readings.length, 0)} chapters
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all shadow-lg shadow-yellow-500/50"
                style={{
                  width: `${(completedReadings.length / readingPlan.reduce((sum, day) => sum + day.readings.length, 0)) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        {todaysPlan && (
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 font-playfair">
              📅 Day {dayOfYear} - Today's Reading
            </h3>
            <div className="space-y-3">
              {todaysPlan.readings.map((reading, idx) => {
                const isComplete = isReadingComplete(todaysPlan.day, reading);
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isComplete}
                        onChange={() => markReadingComplete(todaysPlan.day, reading)}
                        className="w-5 h-5"
                      />
                      <button
                        onClick={() => {
                          setBibleBook(reading.book);
                          setBibleChapter(reading.chapter);
                          fetchBibleChapter(reading.book, reading.chapter);
                        }}
                        className={`font-bold text-left ${isComplete ? 'text-gray-500 line-through' : 'text-gray-300 hover:text-yellow-500'}`}
                      >
                        {reading.book} {reading.chapter}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setBibleBook(reading.book);
                        setBibleChapter(reading.chapter);
                        fetchBibleChapter(reading.book, reading.chapter);
                      }}
                      className="text-sm bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg text-black font-bold px-3 py-1 rounded-lg transition-all"
                    >
                      Read →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/20 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 font-playfair">All Days</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {readingPlan.map((day, idx) => {
              const dayComplete = day.readings.every(r => isReadingComplete(day.day, r));
              return (
                <div key={idx} className={`p-3 rounded-lg border ${dayComplete ? 'bg-green-900/20 border-green-500/30' : 'bg-gray-900/50 border-gray-700/30'}`}>
                  <div className="font-bold text-gray-300 mb-1">
                    Day {day.day} {dayComplete && '✓'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {day.readings.map(r => `${r.book} ${r.chapter}`).join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black font-inter">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>
      <script src="https://js.stripe.com/v3/"></script>
      
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-yellow-500/20 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-yellow-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent font-playfair">
                VerseAid.ai
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <button onClick={() => setShowMenu(!showMenu)} className="md:hidden text-yellow-500">
                    <Menu className="w-6 h-6" />
                  </button>
                  <div className="hidden md:flex items-center gap-4">
                    {(userTier === 'premium' || userTier === 'church') && (
                      <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-yellow-500/50">
                        👑 {userTier === 'premium' ? 'PREMIUM' : churchName.toUpperCase()}
                      </span>
                    )}
                    {userTier === 'free' && (
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-4 py-1.5 rounded-full hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
                      >
                        Upgrade ✨
                      </button>
                    )}
                    <span className="text-gray-400 text-sm">Hi, <span className="text-yellow-500 font-semibold">{username}</span></span>
                    <button onClick={handleLogout} className="text-yellow-500 hover:text-yellow-400 font-semibold text-sm">
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-yellow-500 hover:text-yellow-400 font-semibold text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoggedIn && (
          <div className={`${showMenu ? 'block' : 'hidden'} md:block border-t border-yellow-500/10`}>
            <div className="max-w-7xl mx-auto px-6 py-2 flex gap-2 overflow-x-auto">
              <button
                onClick={() => { setCurrentView('home'); setShowMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'home' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => { setCurrentView('saved'); setShowMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'saved' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                <Star className="w-4 h-4" />
                Saved
              </button>
              <button
                onClick={() => { 
                  if (checkFeatureAccess('journal')) {
                    setCurrentView('journal'); 
                    setShowMenu(false);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'journal' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                Journal {(userTier === 'free') && <Crown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => { 
                  if (checkFeatureAccess('community')) {
                    setCurrentView('community'); 
                    setShowMenu(false);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'community' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                <Heart className="w-4 h-4" />
                Community {(userTier === 'free') && <Crown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => { 
                  setCurrentView('bible'); 
                  setShowMenu(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'bible' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Bible
              </button>
              <button
                onClick={() => { 
                  if (checkFeatureAccess('reading-plan')) {
                    setCurrentView('reading-plan'); 
                    setShowMenu(false);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'reading-plan' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Reading Plan {(userTier === 'free') && <Crown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-12">
        {currentView === 'home' && renderHome()}
        {currentView === 'saved' && renderSaved()}
        {currentView === 'journal' && renderJournal()}
        {currentView === 'community' && renderCommunity()}
        {currentView === 'bible' && renderBible()}
        {currentView === 'reading-plan' && renderReadingPlan()}
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white font-playfair">
                {showForgotPassword ? 'Reset Password' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </h2>
              <button onClick={() => { setShowAuthModal(false); setShowForgotPassword(false); setResetEmailSent(false); setError(''); }} className="text-gray-500 hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            {showForgotPassword ? (
              <div className="space-y-4">
                {resetEmailSent ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Check Your Email</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      If an account exists with <span className="text-yellow-500">{forgotPasswordEmail}</span>, we've sent password reset instructions to that address.
                    </p>
                    <button
                      onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); setForgotPasswordEmail(''); setAuthMode('login'); }}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-2xl hover:shadow-yellow-500/50 text-black font-bold py-3 rounded-lg transition-all"
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }}>
                    <div className="space-y-4">
                      <p className="text-gray-400 text-sm">
                        Enter the email address associated with your account and we'll send you a link to reset your password.
                      </p>
                      <div>
                        <label htmlFor="forgot-email" className="block text-sm font-semibold text-yellow-500 mb-1">Email Address</label>
                        <input
                          type="email"
                          id="forgot-email"
                          name="email"
                          autoComplete="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500/20"
                          placeholder="Enter your email"
                          autoFocus
                        />
                      </div>

                      {error && (
                        <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-2xl hover:shadow-yellow-500/50 text-black font-bold py-3 rounded-lg transition-all"
                      >
                        Send Reset Link
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => { setShowForgotPassword(false); setError(''); setForgotPasswordEmail(''); }}
                          className="text-sm text-gray-400 hover:text-gray-300"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} autoComplete="on">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="auth-username" className="block text-sm font-semibold text-yellow-500 mb-1">Username</label>
                    <input
                      type="text"
                      id="auth-username"
                      name="username"
                      autoComplete="username"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500/20"
                      placeholder="Enter username"
                    />
                  </div>

                  {authMode === 'signup' && (
                    <div>
                      <label htmlFor="auth-email" className="block text-sm font-semibold text-yellow-500 mb-1">Email</label>
                      <input
                        type="email"
                        id="auth-email"
                        name="email"
                        autoComplete="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500/20"
                        placeholder="Enter email"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="auth-password" className="block text-sm font-semibold text-yellow-500 mb-1">Password</label>
                    <input
                      type="password"
                      id="auth-password"
                      name="password"
                      autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500/20"
                      placeholder="Enter password"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-2xl hover:shadow-yellow-500/50 text-black font-bold py-3 rounded-lg transition-all"
                  >
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>

                  {authMode === 'login' && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(true); setError(''); }}
                        className="text-sm text-yellow-500 hover:text-yellow-400"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); setAuthEmail(''); }}
                      className="text-sm text-gray-400 hover:text-gray-300"
                    >
                      {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                  </div>

                  {authMode === 'signup' && (
                    <div className="pt-4 border-t border-gray-800">
                      <p className="text-xs text-gray-500 text-center">
                        Free tier includes 3 questions daily, Bible reader, and community features
                      </p>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-3xl p-10 max-w-5xl w-full my-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-center text-white font-playfair">
                Choose Your <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">Premium</span> Plan
              </h2>
              <button onClick={() => setShowUpgradeModal(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-yellow-500/30 rounded-2xl p-8 bg-gradient-to-br from-gray-900 to-black hover:border-yellow-500/50 transition-all hover:shadow-2xl hover:shadow-yellow-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-3xl font-bold text-white font-playfair">Premium</h3>
                </div>

                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-bold text-yellow-500">$4.99</span>
                  <span className="text-gray-400">/month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-yellow-500 text-xl">✓</span>
                    <span><strong className="text-white">Unlimited questions</strong> daily</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-yellow-500 text-xl">✓</span>
                    <span><strong className="text-white">Community Prayer Wall</strong> access</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-yellow-500 text-xl">✓</span>
                    <span><strong className="text-white">Prayer Journal</strong> with tracking</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-yellow-500 text-xl">✓</span>
                    <span><strong className="text-white">Bible-in-a-Year</strong> reading plan</span>
                  </li>
                </ul>

                <button
                  onClick={handleStripeCheckout}
                  disabled={stripeLoading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-2xl hover:shadow-yellow-500/50 disabled:from-gray-700 disabled:to-gray-600 text-black font-bold py-4 rounded-xl transition-all transform hover:scale-105 mb-2"
                >
                  {stripeLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                      Processing...
                    </>
                  ) : (
                    '💳 Subscribe Now'
                  )}
                </button>

                <button
                  onClick={upgradeToPremium}
                  className="w-full border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold py-4 rounded-xl transition-all transform hover:scale-105"
                >
                  🎁 Activate 7-Day Free Trial
                </button>
              </div>

              <div className="border-2 border-yellow-500/30 rounded-2xl p-8 bg-gradient-to-br from-gray-900 to-black hover:border-yellow-500/50 transition-all hover:shadow-2xl hover:shadow-yellow-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-3xl font-bold text-white font-playfair">Church</h3>
                </div>

                <div className="mb-8">
                  <span className="text-3xl font-bold text-yellow-500">Custom Pricing</span>
                  <p className="text-gray-400 text-sm mt-2">For churches & ministries</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-yellow-500 text-xl">✓</span>
                    <span><strong className="text-white">All Premium features</strong> for unlimited members</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-yellow-500 text-xl">✓</span>
                    <span>Custom branding with church logo</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-yellow-500 text-xl">✓</span>
                    <span>Private church prayer wall</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-yellow-500 text-xl">✓</span>
                    <span>Admin dashboard & analytics</span>
                  </li>
                </ul>

                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold py-4 rounded-xl transition-all transform hover:scale-105"
                >
                  Request Information
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showContactForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-2xl p-6 max-w-lg w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-playfair">Church Edition Inquiry</h2>
                <p className="text-sm text-gray-400 mt-1">We'll contact you within 24 hours</p>
              </div>
              <button onClick={() => setShowContactForm(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-yellow-500 mb-2">Your Name *</label>
                <input
                  type="text"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-yellow-500 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  placeholder="john@church.com"
                  className="w-full px-4 py-2 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-yellow-500 mb-2">Church/Ministry Name</label>
                <input
                  type="text"
                  value={contactInfo.churchName}
                  onChange={(e) => setContactInfo({...contactInfo, churchName: e.target.value})}
                  placeholder="Grace Community Church"
                  className="w-full px-4 py-2 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-yellow-500 mb-2">Message (Optional)</label>
                <textarea
                  value={contactInfo.message}
                  onChange={(e) => setContactInfo({...contactInfo, message: e.target.value})}
                  placeholder="Tell us about your church..."
                  className="w-full px-4 py-3 bg-gray-900 border border-yellow-500/20 rounded-lg text-gray-300 placeholder-gray-500 resize-none focus:ring-2 focus:ring-yellow-500/20"
                  rows="3"
                />
              </div>

              <button
                onClick={submitContactForm}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-2xl hover:shadow-yellow-500/50 text-black font-bold py-3 rounded-lg transition-all"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-yellow-500/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">© 2025 VerseAid.ai - Premium Biblical guidance powered by AI</p>
        </div>
      </footer>
    </div>
  );
}

