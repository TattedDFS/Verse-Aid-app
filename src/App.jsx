import React, { useState, useEffect } from 'react';
import { BookOpen, Send, Loader2, Heart, User, Calendar, Share2, Star, BookMarked, Plus, X, Menu, Home, Clock } from 'lucide-react';

export default function BiblicalGuidanceApp() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // User & Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  
  // Navigation State
  const [currentView, setCurrentView] = useState('home');
  const [showMenu, setShowMenu] = useState(false);
  
  // Saved Items State
  const [savedResponses, setSavedResponses] = useState([]);
  const [prayerJournal, setPrayerJournal] = useState([]);
  const [newPrayerEntry, setNewPrayerEntry] = useState('');
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [shareToCommunity, setShareToCommunity] = useState(false);
  const [prayerCategory, setPrayerCategory] = useState('');
  
  // Community Prayer State
  const [communityPrayers, setCommunityPrayers] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [prayedForIds, setPrayedForIds] = useState([]);
  const [savedDailyVerse, setSavedDailyVerse] = useState(false);
  const [sharedPrayerIds, setSharedPrayerIds] = useState([]);
  const [showVerseNotification, setShowVerseNotification] = useState(false);
  
  // Bible Reading State
  const [bibleBook, setBibleBook] = useState('Genesis');
  const [bibleChapter, setBibleChapter] = useState(1);
  const [bibleText, setBibleText] = useState(null);
  const [loadingBible, setLoadingBible] = useState(false);
  const [readingPlan, setReadingPlan] = useState([]);
  const [completedReadings, setCompletedReadings] = useState([]);
  
  // Daily Verse State
  const [dailyVerse, setDailyVerse] = useState(null);
  const [showDailyVerse, setShowDailyVerse] = useState(false);

  // Load data from storage on mount
  useEffect(() => {
    loadUserData();
    loadCommunityPrayers();
    checkDailyVerse();
    generateReadingPlan();
  }, [isLoggedIn, username]);

  const loadUserData = async () => {
    if (!isLoggedIn || !username) return;
    
    try {
      const savedKey = `saved_${username}`;
      const journalKey = `journal_${username}`;
      const readingsKey = `completed_readings_${username}`;
      
      const savedData = await window.storage.get(savedKey);
      const journalData = await window.storage.get(journalKey);
      const readingsData = await window.storage.get(readingsKey);
      
      if (savedData) {
        setSavedResponses(JSON.parse(savedData.value));
      }
      if (journalData) {
        setPrayerJournal(JSON.parse(journalData.value));
      }
      if (readingsData) {
        setCompletedReadings(JSON.parse(readingsData.value));
      }
    } catch (err) {
      console.log('No saved data found or error loading:', err);
    }
  };

  const loadCommunityPrayers = async () => {
    try {
      const result = await window.storage.get('community_prayers', true);
      if (result) {
        setCommunityPrayers(JSON.parse(result.value));
      }
    } catch (err) {
      console.log('No community prayers found:', err);
      setCommunityPrayers([]);
    }
  };

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
    // Old Testament
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
    // New Testament
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

  const generateReadingPlan = () => {
    // Simple Bible-in-a-Year plan: distribute chapters across 365 days
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
    
    // Add remaining chapters
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `Provide the full text of ${book} chapter ${chapter} from the Bible using the New Living Translation (NLT). 
            
Format your response as valid JSON only, with no markdown code blocks or extra text:
{
  "book": "${book}",
  "chapter": ${chapter},
  "verses": [
    {"verse": 1, "text": "In the beginning God created the heavens and the earth."},
    {"verse": 2, "text": "The earth was formless and empty..."}
  ]
}

Provide all verses for the entire chapter in New Living Translation (NLT). Do not include any preamble or explanation, just the JSON.`
          }]
        })
      });

      const data = await response.json();
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
    // Parse reference like "John 3:16" or "Genesis 1:1"
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
    } catch (err) {
      console.error('Error saving data:', err);
    }
  };

  useEffect(() => {
    saveUserData();
  }, [savedResponses, prayerJournal, completedReadings]);

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
      console.log('No daily verse found');
    }
    
    // Generate new daily verse
    await generateDailyVerse();
    // Show notification for new verse
    setShowVerseNotification(true);
    setTimeout(() => setShowVerseNotification(false), 5000);
  };

  const generateDailyVerse = async () => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (data.content && data.content[0]) {
        let text = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const verse = JSON.parse(text);
        const dailyData = { ...verse, date: new Date().toDateString() };
        setDailyVerse(dailyData);
        await window.storage.set('daily_verse', JSON.stringify(dailyData), true);
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
      // Simple signup - in production you'd validate and hash passwords
      setUsername(authUsername);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setError('');
    } else {
      // Simple login - in production you'd verify credentials
      setUsername(authUsername);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setError('');
    }
    
    setAuthUsername('');
    setAuthPassword('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setSavedResponses([]);
    setPrayerJournal([]);
    setCurrentView('home');
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a compassionate spiritual guide helping someone find biblical wisdom and guidance. 

The person's question or situation is: "${question}"

Please provide:
1. A compassionate, understanding response to their situation
2. 2-3 relevant Bible verses with references (book, chapter, verse) from the New Living Translation (NLT)
3. Practical guidance on "What would Jesus do" in this situation
4. Words of encouragement

Format your response as JSON with this structure:
{
  "compassionateResponse": "your empathetic response here",
  "verses": [
    {"reference": "Book Chapter:Verse", "text": "verse text in NLT"},
    {"reference": "Book Chapter:Verse", "text": "verse text in NLT"}
  ],
  "wwjd": "What Jesus would do in this situation",
  "encouragement": "Encouraging closing words"
}

Use the New Living Translation (NLT) for all Bible verses. Be warm, non-judgmental, and helpful.`
          }]
        })
      });

      const data = await apiResponse.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        let textResponse = data.content[0].text.trim();
        textResponse = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        try {
          const parsedResponse = JSON.parse(textResponse);
          setResponse({ ...parsedResponse, question, timestamp: new Date().toISOString() });
        } catch (parseError) {
          setError('Received response but could not format it properly. Please try again.');
        }
      } else {
        setError('Unable to get a response. Please try again.');
      }
    } catch (err) {
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
    
    const newSaved = [...savedResponses, response];
    setSavedResponses(newSaved);
    alert('Response saved to your collection!');
  };

  const shareResponse = () => {
    const shareText = `${response.verses[0].text} - ${response.verses[0].reference}`;
    if (navigator.share) {
      navigator.share({ text: shareText, title: 'Biblical Guidance' });
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
    
    // If sharing to community, add to community prayers
    if (shareToCommunity) {
      const communityEntry = {
        id: Date.now(),
        text: newPrayerEntry,
        date: new Date().toISOString(),
        prayerCount: 0,
        category: prayerCategory || 'other'
      };
      
      const updatedCommunity = [communityEntry, ...communityPrayers];
      setCommunityPrayers(updatedCommunity);
      
      try {
        await window.storage.set('community_prayers', JSON.stringify(updatedCommunity), true);
      } catch (err) {
        console.error('Error saving community prayer:', err);
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
    
    // Track that this prayer has been shared
    setSharedPrayerIds([...sharedPrayerIds, journalEntry.id]);
    
    try {
      await window.storage.set('community_prayers', JSON.stringify(updatedCommunity), true);
      alert('Prayer shared with the community!');
    } catch (err) {
      console.error('Error sharing prayer:', err);
    }
  };

  const deleteSavedResponse = (index) => {
    const updated = savedResponses.filter((_, i) => i !== index);
    setSavedResponses(updated);
  };

  const prayForRequest = async (id) => {
    // Add to prayed-for list for visual feedback
    setPrayedForIds([...prayedForIds, id]);
    
    const updated = communityPrayers.map(p => 
      p.id === id ? { ...p, prayerCount: p.prayerCount + 1 } : p
    );
    setCommunityPrayers(updated);
    
    try {
      await window.storage.set('community_prayers', JSON.stringify(updated), true);
    } catch (err) {
      console.error('Error updating prayer count:', err);
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
      verses: [{
        reference: dailyVerse.reference,
        text: dailyVerse.text
      }],
      compassionateResponse: dailyVerse.reflection,
      wwjd: "",
      encouragement: "",
      timestamp: new Date().toISOString()
    };
    
    setSavedResponses([verseResponse, ...savedResponses]);
    setSavedDailyVerse(true);
    
    // Reset after 2 seconds
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
      {/* Verse Notification */}
      {showVerseNotification && (
        <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-bounce">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <div>
              <p className="font-bold">New Daily Verse Available! 📖</p>
              <p className="text-sm opacity-90">Tap the banner below to read</p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Verse Banner */}
      {dailyVerse && !showDailyVerse && (
        <div 
          onClick={() => setShowDailyVerse(true)}
          className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl shadow-lg p-6 mb-6 cursor-pointer hover:shadow-xl transition-shadow"
        >
          <div className="flex items-start gap-3">
            <Calendar className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Today's Verse</h3>
              <p className="text-sm text-gray-700 italic">"{dailyVerse.text}"</p>
              <p className="text-xs text-amber-700 mt-1">— {dailyVerse.reference}</p>
              <p className="text-xs text-blue-600 mt-2">Tap to read reflection →</p>
            </div>
          </div>
        </div>
      )}

      {showDailyVerse && dailyVerse && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800">Today's Verse & Reflection</h3>
            <div className="flex gap-2">
              <button 
                onClick={saveDailyVerseToCollection}
                className={`p-2 rounded-lg transition-all ${
                  savedDailyVerse 
                    ? 'bg-yellow-400 text-white' 
                    : 'bg-white hover:bg-yellow-100 text-amber-600'
                }`}
                title="Save to collection"
              >
                <Star className={`w-5 h-5 ${savedDailyVerse ? 'fill-current' : ''}`} />
              </button>
              <button onClick={() => setShowDailyVerse(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-700 italic mb-2">"{dailyVerse.text}"</p>
              <p className="text-sm font-semibold text-amber-700">— {dailyVerse.reference}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{dailyVerse.reflection}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Input Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's on your heart today?
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Share your question, concern, or situation..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows="4"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Seeking guidance...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Get Biblical Guidance
              </>
            )}
          </button>
        </div>

        {!response && !loading && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-3">Try asking:</p>
            <div className="space-y-2">
              {exampleQuestions.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(example)}
                  className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm transition-colors"
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
          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={saveResponse}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              <Star className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={shareResponse}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <Heart className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">A Word of Understanding</h2>
                <p className="text-gray-700 leading-relaxed">{response.compassionateResponse}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Scripture for Your Journey</h2>
                <div className="space-y-4">
                  {response.verses.map((verse, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-gray-700 italic mb-2">"{verse.text}"</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-purple-700">— {verse.reference}</p>
                        <button
                          onClick={() => goToVerse(verse.reference)}
                          className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors"
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

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">What Would Jesus Do?</h2>
            <p className="text-gray-700 leading-relaxed">{response.wwjd}</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Words of Encouragement</h2>
            <p className="text-gray-700 leading-relaxed">{response.encouragement}</p>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setQuestion('');
                setResponse(null);
                setError('');
              }}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Ask Another Question
            </button>
          </div>
        </div>
      )}
    </>
  );

  const renderSaved = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Saved Responses</h2>
      {savedResponses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <BookMarked className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No saved responses yet. Save your favorite guidance to revisit later!</p>
        </div>
      ) : (
        savedResponses.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500 mb-2">{new Date(item.timestamp).toLocaleDateString()}</p>
                <p className="font-semibold text-gray-800 mb-3">Q: {item.question}</p>
              </div>
              <button 
                onClick={() => deleteSavedResponse(idx)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Delete saved item"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {item.verses.map((v, i) => (
                <div key={i} className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm italic text-gray-700">"{v.text}"</p>
                  <p className="text-xs text-purple-700 mt-1">— {v.reference}</p>
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
        <h2 className="text-2xl font-bold text-gray-800">Prayer Journal</h2>
        <button
          onClick={() => setShowPrayerModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Prayer
        </button>
      </div>

      {prayerJournal.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Start your prayer journal by adding your first prayer request.</p>
        </div>
      ) : (
        prayerJournal.map((entry) => (
          <div key={entry.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                {entry.category && (
                  <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                    {prayerCategories.find(c => c.value === entry.category)?.emoji} {prayerCategories.find(c => c.value === entry.category)?.label}
                  </span>
                )}
              </div>
              <button onClick={() => deletePrayerEntry(entry.id)} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-800 mb-3">{entry.text}</p>
            <div className="flex gap-2">
              <button
                onClick={() => togglePrayerAnswered(entry.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                  entry.answered 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {entry.answered ? '✓ Answered' : 'Mark as Answered'}
              </button>
              <button
                onClick={() => sharePrayerToCommunity(entry)}
                disabled={sharedPrayerIds.includes(entry.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-all ${
                  sharedPrayerIds.includes(entry.id)
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                }`}
              >
                <Share2 className="w-4 h-4" />
                {sharedPrayerIds.includes(entry.id) ? 'Shared to Community' : 'Share to Community'}
              </button>
            </div>
          </div>
        ))
      )}

      {showPrayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Prayer Request</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={prayerCategory}
                onChange={(e) => setPrayerCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 resize-none"
              rows="4"
            />
            
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareToCommunity}
                  onChange={(e) => setShareToCommunity(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">Share to Community</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Let others pray for your request. All community prayers are anonymous.
                  </p>
                </div>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={addPrayerEntry}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
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
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg"
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Community Prayer Wall</h2>
        <p className="text-gray-600 text-sm mb-4">Join others in prayer. All requests are anonymous.</p>
        
        {/* Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Prayers
          </button>
          {prayerCategories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterCategory === cat.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {filteredCommunityPrayers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {filterCategory === 'all' 
              ? 'No community prayer requests yet.' 
              : `No prayers in the ${prayerCategories.find(c => c.value === filterCategory)?.label} category yet.`}
          </p>
          <p className="text-sm text-gray-500">Share a prayer request with the community!</p>
        </div>
      ) : (
        filteredCommunityPrayers.map((prayer) => {
          const hasPrayed = prayedForIds.includes(prayer.id);
          const category = prayerCategories.find(c => c.value === prayer.category);
          
          return (
            <div key={prayer.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Anonymous</p>
                    <p className="text-xs text-gray-500">{new Date(prayer.date).toLocaleDateString()}</p>
                  </div>
                </div>
                {category && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                    {category.emoji} {category.label}
                  </span>
                )}
              </div>
              
              <p className="text-gray-800 mb-4 leading-relaxed">{prayer.text}</p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => prayForRequest(prayer.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                    hasPrayed
                      ? 'bg-pink-500 text-white'
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${hasPrayed ? 'fill-current' : ''}`} />
                  {hasPrayed ? "I'm Praying" : "I'll Pray"}
                </button>
                <span className="text-sm text-gray-600">
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
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Bible chapter...</p>
        </div>
      )}

      {!loadingBible && !bibleText && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Read the Bible</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Book</label>
              <select
                value={bibleBook}
                onChange={(e) => setBibleBook(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {bibleBooks.map(book => (
                  <option key={book.name} value={book.name}>{book.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter</label>
              <select
                value={bibleChapter}
                onChange={(e) => setBibleChapter(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: bibleBooks.find(b => b.name === bibleBook)?.chapters || 1 }, (_, i) => i + 1).map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={() => fetchBibleChapter(bibleBook, bibleChapter)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Read Chapter
          </button>
        </div>
      )}

      {!loadingBible && bibleText && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-purple-800">
                {bibleText.book} {bibleText.chapter} <span className="text-sm font-normal text-gray-500">(NLT)</span>
              </h3>
              <button
                onClick={() => setBibleText(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              {bibleText.verses.map((v, idx) => (
                <p key={idx} className="text-gray-700 leading-relaxed">
                  <span className="font-semibold text-purple-600 mr-2">{v.verse}</span>
                  {v.text}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Navigate to Another Chapter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Book</label>
                <select
                  value={bibleBook}
                  onChange={(e) => setBibleBook(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {bibleBooks.map(book => (
                    <option key={book.name} value={book.name}>{book.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chapter</label>
                <select
                  value={bibleChapter}
                  onChange={(e) => setBibleChapter(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {Array.from({ length: bibleBooks.find(b => b.name === bibleBook)?.chapters || 1 }, (_, i) => i + 1).map(ch => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={() => fetchBibleChapter(bibleBook, bibleChapter)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
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
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bible in a Year</h2>
          <p className="text-gray-600 mb-4">Follow along and complete the entire Bible in 365 days</p>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                {completedReadings.length} / {readingPlan.reduce((sum, day) => sum + day.readings.length, 0)} chapters
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all"
                style={{
                  width: `${(completedReadings.length / readingPlan.reduce((sum, day) => sum + day.readings.length, 0)) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        {todaysPlan && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📅 Day {dayOfYear} - Today's Reading
            </h3>
            <div className="space-y-3">
              {todaysPlan.readings.map((reading, idx) => {
                const isComplete = isReadingComplete(todaysPlan.day, reading);
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
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
                        className={`font-medium text-left ${isComplete ? 'text-gray-500 line-through' : 'text-gray-800 hover:text-purple-600'}`}
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
                      className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      Read →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">All Days</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {readingPlan.map((day, idx) => {
              const dayComplete = day.readings.every(r => isReadingComplete(day.day, r));
              return (
                <div key={idx} className={`p-3 rounded-lg ${dayComplete ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="font-medium text-gray-800 mb-1">
                    Day {day.day} {dayComplete && '✓'}
                  </div>
                  <div className="text-sm text-gray-600">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-800">Biblical Guidance</h1>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button onClick={() => setShowMenu(!showMenu)} className="md:hidden text-gray-600">
                  <Menu className="w-6 h-6" />
                </button>
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-sm text-gray-600">Hi, {username}!</span>
                  <button onClick={handleLogout} className="text-sm text-purple-600 hover:text-purple-700">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        {isLoggedIn && (
          <div className={`${showMenu ? 'block' : 'hidden'} md:block border-t border-gray-200`}>
            <div className="max-w-4xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
              <button
                onClick={() => { setCurrentView('home'); setShowMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                  currentView === 'home' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => { setCurrentView('saved'); setShowMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                  currentView === 'saved' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Star className="w-4 h-4" />
                Saved
              </button>
              <button
                onClick={() => { setCurrentView('journal'); setShowMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                  currentView === 'journal' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                Journal
              </button>
              <button
                onClick={() => { setCurrentView('community'); setShowMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                  currentView === 'community' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className="w-4 h-4" />
                Community
              </button>
              <button
                onClick={() => { setCurrentView('bible'); setShowMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                  currentView === 'bible' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Read Bible
              </button>
              <button
                onClick={() => { setCurrentView('reading-plan'); setShowMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                  currentView === 'reading-plan' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Reading Plan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-12">
        {currentView === 'home' && renderHome()}
        {currentView === 'saved' && renderSaved()}
        {currentView === 'journal' && renderJournal()}
        {currentView === 'community' && renderCommunity()}
        {currentView === 'bible' && renderBible()}
        {currentView === 'reading-plan' && renderReadingPlan()}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </h2>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleAuth}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <div className="text-center">
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-8 text-sm text-gray-500">
        <p>This guidance is powered by AI and should complement, not replace, personal prayer and pastoral counsel.</p>
      </div>
    </div>
  );
}
