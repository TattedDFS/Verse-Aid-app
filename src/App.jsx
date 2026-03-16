import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Send, Loader2, Heart, User, Calendar, Share2, Star, BookMarked, Plus, X, Menu, Home, Crown, Users, CheckCircle, AlertTriangle, Lock, Settings, MessageCircle, ChevronLeft, ChevronRight, Hand, Globe, MapPin } from 'lucide-react';
import { anthropicRequest as anthropicRequestBase } from './utils/anthropicClient';
import { safeStorageGet, safeStorageSet } from './utils/storage';
import { supabase } from './supabaseClient';

const PeopleQuestionInput = React.memo(({ onSubmit, placeholder, disabled }) => {
  const [value, setValue] = useState('');
  const handleSubmit = () => {
    const q = value.trim();
    if (!q || disabled) return;
    onSubmit(q);
    setValue('');
  };
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder}
        className="va-input flex-1 px-4 py-3 rounded-xl text-white placeholder-[rgba(255,255,255,0.4)]"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        className="va-btn-primary px-4 py-3 rounded-xl va-font-nunito disabled:opacity-50"
      >
        {disabled ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} /> : 'Ask'}
      </button>
    </div>
  );
});

PeopleQuestionInput.displayName = 'PeopleQuestionInput';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '', email: '', phone: '', churchName: '', message: ''
  });
  const [stripeLoading, setStripeLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
   const [settingsTab, setSettingsTab] = useState('account');
   const [newEmail, setNewEmail] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmNewPassword, setConfirmNewPassword] = useState('');
   const [settingsMessage, setSettingsMessage] = useState('');
   const [settingsError, setSettingsError] = useState('');
   const [cancellingSubscription, setCancellingSubscription] = useState(false);
   
  const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

  const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const STRIPE_PRICE_ID_MONTHLY = 'price_1Szfd1Pn2XQV6iQ8St63dVyE';
  const STRIPE_PRICE_ID_ANNUAL = 'price_1SzfduPn2XQV6iQ8cXTCWHci';
  const STRIPE_PRICE_ID_LIFETIME = 'price_1SzfeXPn2XQV6iQ8hEOpG9cQ';

  const anthropicRequest = ({ messages, maxTokens }) =>
    anthropicRequestBase({ apiKey: ANTHROPIC_API_KEY, messages, maxTokens });
  
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
  const [savedResponse, setSavedResponse] = useState(false);
  const [sharedPrayer, setSharedPrayer] = useState(null);
  const [sharedPrayerIds, setSharedPrayerIds] = useState([]);
  const [showVerseNotification, setShowVerseNotification] = useState(false);
  const [deletePrayerConfirmId, setDeletePrayerConfirmId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [bibleBook, setBibleBook] = useState('Genesis');
  const [bibleChapter, setBibleChapter] = useState(1);
  const [bibleText, setBibleText] = useState(null);
  const [loadingBible, setLoadingBible] = useState(false);
  const [readingPlan, setReadingPlan] = useState([]);
  const [completedReadings, setCompletedReadings] = useState([]);
  const [selectedPlanDay, setSelectedPlanDay] = useState(null);

  const [dailyVerse, setDailyVerse] = useState(null);
  const [showDailyVerse, setShowDailyVerse] = useState(false);
  const [guidanceTone, setGuidanceTone] = useState('gentle');
  const [highlightedVerse, setHighlightedVerse] = useState(null);
  const [bibleCache, setBibleCache] = useState({});
  const [showBibleBookGrid, setShowBibleBookGrid] = useState(true);
  const [bibleVerseFontSize, setBibleVerseFontSize] = useState(16);
  const [loadedChapters, setLoadedChapters] = useState([]);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [chaptersLoaded, setChaptersLoaded] = useState([]);
  const loadedChaptersRef = useRef([]);
  const [bibleBookmark, setBibleBookmark] = useState(null);
  const [biblePopup, setBiblePopup] = useState(null);
  const [bibleReturnPos, setBibleReturnPos] = useState(null);
  const [placesReturnPerson, setPlacesReturnPerson] = useState(null);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [peopleProfile, setPeopleProfile] = useState(null);
  const [loadingPeopleProfile, setLoadingPeopleProfile] = useState(false);
  const [peopleQuestionExpanded, setPeopleQuestionExpanded] = useState(false);
  const [peopleAnswers, setPeopleAnswers] = useState([]);
  const [loadingPeopleAnswer, setLoadingPeopleAnswer] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placesProfile, setPlacesProfile] = useState(null);
  const [loadingPlacesProfile, setLoadingPlacesProfile] = useState(false);
  const [placesQuestionExpanded, setPlacesQuestionExpanded] = useState(false);
  const [placesAnswers, setPlacesAnswers] = useState([]);
  const [loadingPlacesAnswer, setLoadingPlacesAnswer] = useState(false);

  const BIBLICAL_FIGURES = [
    'Adam', 'Eve', 'Cain', 'Abel', 'Seth', 'Noah', 'Shem', 'Ham', 'Japheth', 'Abraham', 'Sarah', 'Hagar', 'Ishmael', 'Isaac', 'Rebekah', 'Esau', 'Jacob', 'Rachel', 'Leah', 'Joseph', 'Moses', 'Aaron', 'Miriam', 'Joshua', 'Caleb', 'Deborah', 'Gideon', 'Samson', 'Ruth', 'Naomi', 'Boaz', 'Hannah', 'Eli', 'Samuel', 'Saul', 'David', 'Jonathan', 'Bathsheba', 'Solomon', 'Elijah', 'Elisha', 'Jezebel', 'Ahab', 'Isaiah', 'Jeremiah', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Job', 'Esther', 'Mordecai', 'Nehemiah', 'Ezra', 'Rahab', 'Jael', 'Abigail', 'Tamar', 'Dinah', 'Zilpah', 'Bilhah', 'Lot', 'Melchizedek', 'Balaam', 'Phinehas', 'Achan', 'Jephthah', 'Othniel', 'Ehud', 'Barak', 'Abimelech', 'Tola', 'Jair', 'Ibzan', 'Elon', 'Abdon', 'Hophni', 'Jesse', 'Goliath', 'Absalom', 'Amnon', 'Joab', 'Benaiah', 'Nathan', 'Zadok', 'Shimei', 'Mephibosheth', 'Hiram', 'Jeroboam', 'Rehoboam', 'Asa', 'Jehoshaphat', 'Joram', 'Athaliah', 'Joash', 'Amaziah', 'Uzziah', 'Jotham', 'Ahaz', 'Hezekiah', 'Manasseh', 'Josiah', 'Jehoiakim', 'Zedekiah', 'Nebuchadnezzar', 'Cyrus', 'Darius', 'Xerxes', 'Shadrach', 'Meshach', 'Abednego', 'Mary mother of Jesus', 'Joseph husband of Mary', 'Elizabeth', 'Zechariah father of John', 'John the Baptist', 'Jesus', 'Peter', 'Andrew', 'James son of Zebedee', 'John son of Zebedee', 'Philip', 'Bartholomew', 'Matthew', 'Thomas', 'James son of Alphaeus', 'Thaddaeus', 'Simon the Zealot', 'Judas Iscariot', 'Mary Magdalene', 'Mary of Bethany', 'Martha', 'Lazarus', 'Nicodemus', 'Joseph of Arimathea', 'Zacchaeus', 'Bartimaeus', 'Stephen', 'Philip the Evangelist', 'Paul', 'Barnabas', 'Silas', 'Timothy', 'Titus', 'Luke', 'Mark', 'Lydia', 'Priscilla', 'Aquila', 'Apollos', 'Cornelius', 'Ananias', 'Sapphira', 'Herod the Great', 'Herod Antipas', 'Pontius Pilate', 'Caiaphas', 'Annas', 'John Mark', 'Onesimus', 'Philemon', 'Phoebe', 'Junia', 'Anna the prophetess', 'Simeon', 'the Samaritan Woman at the Well'
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const BIBLICAL_PLACES = [
    'Achaia', 'Admah', 'Ai', 'Alexandria', 'Antioch', 'Arabia', 'Aram', 'Assyria',
    'Athens', 'Babylon', 'Beersheba', 'Bethel', 'Bethlehem', 'Bethlehem Ephrata',
    'Brook Kidron', 'Caesarea', 'Cana', 'Canaan', 'Capernaum', 'Colossae', 'Corinth',
    'Crete', 'Cyprus', 'Damascus', 'Dead Sea', 'Derbe', 'Dothan', 'Ecbatana', 'Edom',
    'Egypt', 'Elam', 'Emmaus', 'Ephesus', 'Euphrates River', 'Galilee', 'Garden of Eden',
    'Garden of Gethsemane', 'Galatia', 'Gibeah', 'Gibeon', 'Gomorrah', 'Haran', 'Hebron',
    'Iconium', 'Jericho', 'Jerusalem', 'Jordan River', 'Joppa', 'Laodicea', 'Lydda',
    'Lystra', 'Macedonia', 'Malta', 'Media', 'Mediterranean Sea', 'Midian', 'Mizpah',
    'Moab', 'Mount Carmel', 'Mount Hermon', 'Mount Hor', 'Mount Moriah', 'Mount Nebo',
    'Mount of Olives', 'Mount Pisgah', 'Mount Sinai', 'Mount Tabor', 'Mount Zion',
    'Nabatea', 'Nain', 'Nazareth', 'Nineveh', 'Nile River', 'Patmos', 'Pergamum',
    'Persia', 'Philadelphia', 'Philippi', 'Philistia', 'Phoenicia', 'Plain of Megiddo',
    'Pool of Siloam', 'Ramah', 'Red Sea', 'Rome', 'Samaria', 'Sardis', 'Sea of Galilee',
    'Shechem', 'Shiloh', 'Sinai', 'Smyrna', 'Sodom', 'Susa', 'Tekoa', 'Thessalonica',
    'Thyatira', 'Tigris River', 'Tower of Babel', 'Troas', 'Thyatira', 'Ur',
    'Valley of Elah', 'Valley of Jezreel', 'Wilderness of Judea', 'Wilderness of Sinai',
    'Zeboiim', 'Zoar', 'Medeba', 'Heshbon', 'Edrei', 'Punon', 'Oboth',
    'Lachish', 'Megiddo', 'Hazor', 'Dan', 'Gilgal', 'Kadesh Barnea', 'Dibon', 'Bashan',
    'Gilead', 'Jabbok River', 'Mahanaim', 'Peniel', 'Succoth', 'Zarephath', 'Tirzah',
    'Jezreel', 'Endor', 'Ophrah', 'Zorah', 'Timnah', 'Gaza', 'Ashkelon', 'Ashdod',
    'Ekron', 'Gath', 'Caesarea Philippi', 'Bethsaida', 'Chorazin', 'Magdala', 'Tiberias',
    'Sychar', 'Arimathea', 'Bethphage', 'Bethany', 'Golgotha', 'Pool of Bethesda'
  ].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

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

  useEffect(() => {
    if (!isLoggedIn) return;
    let channelCommunity;
    let channelJournal;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channelCommunity = supabase
        .channel('community_prayers')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'community_prayers' }, () => {
          loadCommunityPrayers();
          loadUserData();
        })
        .subscribe();
      channelJournal = supabase
        .channel('prayer_journal')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_journal', filter: `user_id=eq.${user.id}` }, () => {
          loadUserData();
        })
        .subscribe();
    });
    return () => {
      if (channelCommunity) supabase.removeChannel(channelCommunity);
      if (channelJournal) supabase.removeChannel(channelJournal);
    };
  }, [isLoggedIn]);

  const loadUserData = async () => {
    if (!isLoggedIn || !username) {
      // Check for premium status stored by session ID (for users who paid before logging in)
      // Note: We can't easily enumerate all premium_session_ keys with window.storage API
      // This check will be done when user logs in via username-based storage
      return;
    }
    
    let readingProgressFromSupabase = false;
    const [savedData, journalData, readingsData, userData] = await Promise.all([
      safeStorageGet(`saved_${username}`),
      safeStorageGet(`journal_${username}`),
      safeStorageGet(`completed_readings_${username}`),
      safeStorageGet(`user_data_${username}`)
    ]);

    if (savedData && savedData.value) {
      try {
        setSavedResponses(JSON.parse(savedData.value));
      } catch (err) {
        console.error('Error parsing saved responses', err);
      }
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('reading_plan_progress, reading_plan_day, bible_bookmark_book, bible_bookmark_chapter')
            .eq('id', user.id)
            .single();
          if (profile) {
            if (profile.reading_plan_progress != null) {
              const raw = profile.reading_plan_progress;
              const progress = typeof raw === 'string' ? JSON.parse(raw) : raw;
              const keys = planProgressToCompletedReadings(progress);
              setCompletedReadings(keys);
            } else {
              setCompletedReadings([]);
            }
            const dayVal = profile.reading_plan_day;
            setSelectedPlanDay(dayVal != null && dayVal !== '' ? Number(dayVal) : null);
            if (profile.bible_bookmark_book != null && profile.bible_bookmark_chapter != null) {
              setBibleBookmark(`${profile.bible_bookmark_book}:${profile.bible_bookmark_chapter}`);
            } else {
              setBibleBookmark(null);
            }
            readingProgressFromSupabase = true;
          }
          const { data: bookmarkRow, error: bookmarkErr } = await supabase
            .from('profiles')
            .select('bible_bookmark')
            .eq('id', user.id)
            .single();
          if (!bookmarkErr && bookmarkRow && bookmarkRow.bible_bookmark != null && bookmarkRow.bible_bookmark !== '') {
            setBibleBookmark(bookmarkRow.bible_bookmark);
          }
        } catch (_) {
          // reading_plan_* columns may not exist; do not break journal load
        }
        const { data: journalRows, error: jErr } = await supabase
          .from('prayer_journal')
          .select('id, text, date, answered, category')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!jErr && journalRows && journalRows.length > 0) {
          const { data: sharedRows } = await supabase
            .from('community_prayers')
            .select('source_journal_id, prayer_count')
            .eq('user_id', user.id);
          const sharedIds = sharedRows ? sharedRows.map(r => r.source_journal_id) : [];
          const countByJournalId = sharedRows ? Object.fromEntries(sharedRows.map(r => [r.source_journal_id, r.prayer_count ?? 0])) : {};
          setSharedPrayerIds(sharedIds);
          setPrayerJournal(journalRows.map(r => ({
            id: r.id,
            text: r.text,
            date: r.date,
            answered: r.answered ?? false,
            category: r.category || 'other',
            prayerCount: countByJournalId[r.id] ?? 0
          })));
          return;
        }
      }
    } catch (e) {
      console.error('Supabase journal load error', e);
    }
    if (journalData && journalData.value) {
      try {
        setPrayerJournal(JSON.parse(journalData.value));
      } catch (err) {
        console.error('Error parsing journal', err);
      }
    }
    if (readingsData && readingsData.value && !readingProgressFromSupabase) {
      try {
        setCompletedReadings(JSON.parse(readingsData.value));
      } catch (err) {
        console.error('Error parsing completed readings', err);
      }
    }
    if (userData && userData.value) {
      try {
        const parsed = JSON.parse(userData.value);
        let tier = parsed.tier || 'free';
        
        // Check if user has premium status stored by username (using window.storage API)
        try {
          const userPremiumData = await safeStorageGet(`premium_user_${username}`);
          if (userPremiumData && userPremiumData.value && tier === 'free') {
            // User has premium status stored but tier wasn't saved - upgrade them
            tier = 'premium';
            console.log('Restoring premium status from user storage');
          }
        } catch (err) {
          console.error('Error checking premium sessions:', err);
        }
        
        setUserTier(tier);
        setQuestionsToday(parsed.questionsToday || 0);
        setLastQuestionDate(parsed.lastQuestionDate || '');
        setChurchCode(parsed.churchCode || '');
        setChurchName(parsed.churchName || '');
      } catch (err) {
        console.error('Error parsing user data', err);
      }
    } else {
      // No user data found - check for user-specific premium storage (using window.storage API)
      try {
        const userPremiumData = await safeStorageGet(`premium_user_${username}`);
        if (userPremiumData && userPremiumData.value) {
          setUserTier('premium');
          console.log('Applied premium status from user storage for new user');
        }
      } catch (err) {
        console.error('Error checking premium sessions:', err);
      }
    }
  };

  const loadCommunityPrayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: rows, error } = await supabase
          .from('community_prayers')
          .select('id, user_id, source_journal_id, text, date, category, prayer_count, answered, created_at, expiration_date, last_extended_at')
          .order('created_at', { ascending: false });
        if (!error && rows && rows.length > 0) {
          const now = new Date();
          const active = rows.filter(r => r.expiration_date && new Date(r.expiration_date) > now).map(r => ({
            id: r.id,
            user_id: r.user_id,
            text: r.text,
            date: r.date,
            category: r.category || 'other',
            prayerCount: r.prayer_count ?? 0,
            answered: r.answered ?? false,
            source_journal_id: r.source_journal_id,
            created_at: r.created_at,
            expiration_date: r.expiration_date,
            last_extended_at: r.last_extended_at
          }));
          setCommunityPrayers(active);
          const { data: supportRows } = await supabase
            .from('community_prayer_support')
            .select('prayer_id')
            .eq('user_id', user.id);
          if (supportRows) setPrayedForIds(supportRows.map(s => s.prayer_id));
        } else if (user) {
          setCommunityPrayers([]);
        }
        if (user) return;
      }
    } catch (e) {
      console.error('Supabase community load error', e);
    }
    const result = await safeStorageGet('community_prayers', true);
    if (result && result.value) {
      try {
        setCommunityPrayers(JSON.parse(result.value));
      } catch (err) {
        console.error('Error parsing community prayers', err);
        setCommunityPrayers([]);
      }
    } else {
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

  const fetchBibleChapter = async (book, chapter, options = {}) => {
    const { append = false } = options;
    const cacheKey = `${book}-${chapter}`;
    if (bibleCache[cacheKey]) {
      const cached = bibleCache[cacheKey];
      if (append) {
        setLoadedChapters(prev => [...prev, cached]);
        setChaptersLoaded(prev => [...prev, cached.chapter]);
      } else {
        setLoadedChapters([cached]);
        setChaptersLoaded([cached.chapter]);
      }
      setBibleText(cached);
      setBibleBook(cached.book);
      setBibleChapter(cached.chapter);
      setCurrentView('bible');
      return;
    }

    if (!append) setLoadingBible(true);
    try {
      // Use free Bible API (World English Bible) — no API key, reliable chapter text
      const ref = `${book} ${chapter}`;
      const url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=web`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || data.error) {
        const msg = data.error || data.message || response.statusText || 'Please try again.';
        alert('Error loading Bible text: ' + msg);
        return;
      }
      if (!data.verses || !Array.isArray(data.verses) || data.verses.length === 0) {
        alert('Error loading Bible text: no verses returned for this reference.');
        return;
      }
      // Map API shape to our app shape: { book, chapter, verses: [{ verse, text }] }
      const parsed = {
        book: data.verses[0].book_name || book,
        chapter: data.verses[0].chapter ?? chapter,
        verses: data.verses.map((v) => ({ verse: v.verse, text: (v.text || '').trim() }))
      };
      if (append) {
        setLoadedChapters(prev => [...prev, parsed]);
        setChaptersLoaded(prev => [...prev, parsed.chapter]);
      } else {
        setLoadedChapters([parsed]);
        setChaptersLoaded([parsed.chapter]);
      }
      setBibleText(parsed);
      setBibleBook(parsed.book);
      setBibleChapter(parsed.chapter);
      setBibleCache(prev => ({ ...prev, [cacheKey]: parsed }));
      setCurrentView('bible');
    } catch (err) {
      console.error('Error fetching Bible text:', err);
      alert('Error loading Bible text: ' + (err.message || 'Check your connection and try again.'));
    } finally {
      if (!append) setLoadingBible(false);
    }
  };

  const goToVerse = (reference) => {
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)/);
    if (match) {
      const [, book, chapter, verse] = match;
      setBibleBook(book);
      setBibleChapter(parseInt(chapter));
      setHighlightedVerse(parseInt(verse));
      fetchBibleChapter(book, parseInt(chapter));
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        window.scrollTo(0, 0);
      }
    }
  };

  // Extract first Bible verse reference from text (e.g. "John 3:16", "Psalm 23:1", "1 Corinthians 13:4")
  const extractFirstVerseReference = (text) => {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/\b((?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+)\b/);
    return match ? match[1].trim() : null;
  };

  const goToNextChapter = () => {
    markCurrentChapterCompleteIfInPlan();
    const bookIndex = bibleBooks.findIndex((b) => b.name === bibleBook);
    const currentBook = bibleBooks[bookIndex];
    if (!currentBook) return;
    if (bibleChapter < currentBook.chapters) {
      setHighlightedVerse(null);
      setBibleChapter(bibleChapter + 1);
      fetchBibleChapter(bibleBook, bibleChapter + 1);
      return;
    }
    if (bookIndex < bibleBooks.length - 1) {
      const nextBook = bibleBooks[bookIndex + 1];
      setHighlightedVerse(null);
      setBibleBook(nextBook.name);
      setBibleChapter(1);
      fetchBibleChapter(nextBook.name, 1);
    }
  };

  const hasNextChapter = () => {
    const bookIndex = bibleBooks.findIndex((b) => b.name === bibleBook);
    const currentBook = bibleBooks[bookIndex];
    if (!currentBook) return false;
    if (bibleChapter < currentBook.chapters) return true;
    if (bookIndex < bibleBooks.length - 1) return true;
    return false;
  };

  const getNextChapter = (book, chapter) => {
    const bookIndex = bibleBooks.findIndex((b) => b.name === book);
    const currentBook = bibleBooks[bookIndex];
    if (!currentBook) return null;
    if (chapter < currentBook.chapters) return { book, chapter: chapter + 1 };
    if (bookIndex < bibleBooks.length - 1) {
      const nextBook = bibleBooks[bookIndex + 1];
      return { book: nextBook.name, chapter: 1 };
    }
    return null;
  };

  const getPrevChapter = (book, chapter) => {
    const bookIndex = bibleBooks.findIndex((b) => b.name === book);
    const currentBook = bibleBooks[bookIndex];
    if (!currentBook) return null;
    if (chapter > 1) return { book, chapter: chapter - 1 };
    if (bookIndex > 0) {
      const prevBook = bibleBooks[bookIndex - 1];
      return { book: prevBook.name, chapter: prevBook.chapters };
    }
    return null;
  };

  loadedChaptersRef.current = loadedChapters;

  useEffect(() => {
    if (currentView !== 'bible' || loadedChapters.length === 0) return;
    const handleScroll = () => {
      if (isLoadingNext) return;
      const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 300);
      if (!nearBottom) return;
      const latest = loadedChaptersRef.current;
      if (!latest || latest.length === 0) return;
      const last = latest[latest.length - 1];
      const next = getNextChapter(last.book, last.chapter);
      if (!next) return;
      setIsLoadingNext(true);
      fetchBibleChapter(next.book, next.chapter, { append: true }).finally(() => {
        setIsLoadingNext(false);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView, loadedChapters.length, isLoadingNext]);

  useEffect(() => {
    if (currentView !== 'bible' || !isLoggedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('bible_bookmark')
          .eq('id', user.id)
          .single();
        if (!cancelled && profile != null) {
          if (profile.bible_bookmark != null && profile.bible_bookmark !== '') {
            setBibleBookmark(profile.bible_bookmark);
          } else {
            setBibleBookmark(null);
          }
        }
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, [currentView, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data, error } = await supabase
          .from('profiles')
          .select('bible_bookmark')
          .eq('id', user.id)
          .single();
        if (!cancelled && !error && data && data.bible_bookmark != null && data.bible_bookmark !== '') {
          setBibleBookmark(data.bible_bookmark);
        }
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  const markReadingComplete = (day, reading) => {
    const key = `${day}-${reading.book}-${reading.chapter}`;
    if (!completedReadings.includes(key)) {
      setCompletedReadings([...completedReadings, key]);
    }
  };

  const unmarkReadingComplete = (day, reading) => {
    const key = `${day}-${reading.book}-${reading.chapter}`;
    setCompletedReadings(completedReadings.filter((k) => k !== key));
  };

  const toggleReadingComplete = (day, reading) => {
    if (isReadingComplete(day, reading)) {
      unmarkReadingComplete(day, reading);
    } else {
      markReadingComplete(day, reading);
    }
  };

  const markCurrentChapterCompleteIfInPlan = () => {
    const dayEntry = readingPlan.find((d) =>
      d.readings.some((r) => r.book === bibleBook && r.chapter === bibleChapter)
    );
    if (dayEntry) {
      const reading = dayEntry.readings.find((r) => r.book === bibleBook && r.chapter === bibleChapter);
      if (reading) markReadingComplete(dayEntry.day, reading);
    }
  };

  const getCompletedBooksCount = () => {
    const booksInPlan = {};
    readingPlan.forEach((d) => {
      d.readings.forEach((r) => {
        if (!booksInPlan[r.book]) booksInPlan[r.book] = [];
        booksInPlan[r.book].push({ day: d.day, chapter: r.chapter });
      });
    });
    let count = 0;
    Object.keys(booksInPlan).forEach((book) => {
      const entries = booksInPlan[book];
      const allComplete = entries.every(
        ({ day, chapter }) => completedReadings.includes(`${day}-${book}-${chapter}`)
      );
      if (allComplete && entries.length > 0) count++;
    });
    return count;
  };

  const getCompletedBooksList = () => {
    const booksInPlan = {};
    readingPlan.forEach((d) => {
      d.readings.forEach((r) => {
        if (!booksInPlan[r.book]) booksInPlan[r.book] = [];
        booksInPlan[r.book].push({ day: d.day, chapter: r.chapter });
      });
    });
    const list = [];
    Object.keys(booksInPlan).forEach((book) => {
      const entries = booksInPlan[book];
      const allComplete = entries.every(
        ({ day, chapter }) => completedReadings.includes(`${day}-${book}-${chapter}`)
      );
      if (allComplete && entries.length > 0) list.push(book);
    });
    return list;
  };

  const completedReadingsToPlanProgress = (keys) => {
    const progress = {};
    keys.forEach((key) => {
      const parts = key.split('-');
      if (parts.length < 3) return;
      const day = parts[0];
      const chapter = parseInt(parts[parts.length - 1], 10);
      const book = parts.slice(1, -1).join('-');
      if (!progress[day]) progress[day] = [];
      progress[day].push({ book, chapter });
    });
    return progress;
  };

  const planProgressToCompletedReadings = (planProgress) => {
    if (!planProgress || typeof planProgress !== 'object') return [];
    const keys = [];
    Object.keys(planProgress).forEach((day) => {
      const readings = planProgress[day];
      if (!Array.isArray(readings)) return;
      readings.forEach((r) => {
        if (r && r.book != null && r.chapter != null) {
          keys.push(`${day}-${r.book}-${r.chapter}`);
        }
      });
    });
    return keys;
  };

  const isReadingComplete = (day, reading) => {
    const key = `${day}-${reading.book}-${reading.chapter}`;
    return completedReadings.includes(key);
  };

  const saveUserData = React.useCallback(async (tierOverride = null) => {
    if (!isLoggedIn || !username) return;
    const tierToSave = tierOverride !== null ? tierOverride : userTier;
    await Promise.all([
      safeStorageSet(`saved_${username}`, JSON.stringify(savedResponses)),
      safeStorageSet(`journal_${username}`, JSON.stringify(prayerJournal)),
      safeStorageSet(`completed_readings_${username}`, JSON.stringify(completedReadings)),
      safeStorageSet(`user_data_${username}`, JSON.stringify({
        tier: tierToSave, questionsToday, lastQuestionDate, churchCode, churchName
      }))
    ]);
  }, [isLoggedIn, username, savedResponses, prayerJournal, completedReadings, userTier, questionsToday, lastQuestionDate, churchCode, churchName]);

  const saveReadingProgressToSupabase = React.useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const reading_plan_progress = completedReadingsToPlanProgress(completedReadings);
      const reading_plan_day = selectedPlanDay != null ? selectedPlanDay : null;
      const completed_books = getCompletedBooksList();
      const updatePayload = {
        reading_plan_progress: reading_plan_progress,
        reading_plan_day: reading_plan_day,
        completed_books: completed_books
      };
      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);
      if (error) console.error('Error saving reading progress to Supabase:', error);
    } catch (err) {
      console.error('Error saving reading progress:', err);
    }
  }, [completedReadings, selectedPlanDay]);

  const saveBibleBookmark = React.useCallback(async (bookmarkValue) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const payload = bookmarkValue != null && bookmarkValue !== ''
        ? { bible_bookmark: bookmarkValue }
        : { bible_bookmark: null };
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);
      if (error) {
        console.error('Error saving Bible bookmark to Supabase:', error);
        return;
      }
      setBibleBookmark(bookmarkValue && bookmarkValue !== '' ? bookmarkValue : null);
    } catch (err) {
      console.error('Error saving Bible bookmark:', err);
    }
  }, []);

  const saveUserDataRef = React.useRef(saveUserData);
  saveUserDataRef.current = saveUserData;

  useEffect(() => {
    if (!isLoggedIn) return;
    const t = setTimeout(() => {
      saveReadingProgressToSupabase();
    }, 600);
    return () => clearTimeout(t);
  }, [isLoggedIn, completedReadings, selectedPlanDay, saveReadingProgressToSupabase]);

  useEffect(() => {
    if (isLoggedIn && username) {
      saveUserDataRef.current();
    }
  }, [savedResponses, prayerJournal, completedReadings, userTier, questionsToday, lastQuestionDate, churchCode, churchName, isLoggedIn, username]);

  const checkDailyVerse = async () => {
    const today = new Date().toDateString();
    const verseData = await safeStorageGet('daily_verse', true);
    if (verseData && verseData.value) {
      try {
        const parsed = JSON.parse(verseData.value);
        if (parsed.date === today) {
          setDailyVerse(parsed);
          return;
        }
      } catch (err) {
        console.error('Error parsing stored daily verse', err);
      }
    }
    await generateDailyVerse();
  };

  const getRecentVerseReferences = async () => {
    const DAYS_TO_AVOID = 365;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - DAYS_TO_AVOID);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data: profile } = await supabase
        .from('profiles')
        .select('verse_history')
        .eq('id', user.id)
        .single();
      if (!profile?.verse_history) return [];
      const history = JSON.parse(profile.verse_history);
      if (!Array.isArray(history)) return [];
      return history
        .filter((entry) => entry?.reference && new Date(entry.date) >= cutoff)
        .map((entry) => entry.reference.trim());
    } catch (err) {
      console.error('Error reading verse history:', err);
      return [];
    }
  };

  const generateDailyVerse = async () => {
    try {
      const recentRefs = await getRecentVerseReferences();
      const excludeInstruction = recentRefs.length > 0
        ? ` Do NOT use any of these verses (they were used in the last 365 days): ${recentRefs.join(', ')}. Choose a different verse.`
        : '';

      const response = await anthropicRequest({
        maxTokens: 500,
        messages: [{
          role: 'user',
          content: `Provide one inspirational Bible verse for today with a brief reflection (2-3 sentences). Use the World English Version (WEV). Format as JSON: {"reference": "Book Chapter:Verse", "text": "verse text in WEV", "reflection": "brief reflection"}.${excludeInstruction}`
        }]
      });

      const data = await response.json();
      if (data.error) {
        console.error('API error generating daily verse:', data.error);
        return;
      }
      if (data.content && data.content[0]) {
        let text = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];
        const verse = JSON.parse(text);
        const today = new Date().toDateString();
        const dailyData = { ...verse, date: today };
        setDailyVerse(dailyData);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('verse_history')
              .eq('id', user.id)
              .single();
            let history = [];
            if (profile?.verse_history) {
              try {
                history = JSON.parse(profile.verse_history);
                if (!Array.isArray(history)) history = [];
              } catch (e) { history = []; }
            }
            history.push({ reference: (dailyData.reference || '').trim(), date: today });
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 365);
            history = history.filter((entry) => entry.reference && new Date(entry.date) >= cutoff);
            await supabase
              .from('profiles')
              .update({ verse_history: JSON.stringify(history) })
              .eq('id', user.id);
          }
        } catch (err) {
          console.error('Error saving verse history:', err);
        }
        setShowVerseNotification(true);
        setTimeout(() => setShowVerseNotification(false), 5000);
      }
    } catch (err) {
      console.error('Error generating daily verse:', err);
    }
  };

  useEffect(() => {
    if (authMode === 'signup') {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      window.onRecaptchaSuccess = () => setRecaptchaVerified(true);
      window.onRecaptchaExpired = () => setRecaptchaVerified(false);
    }
  }, [authMode]);

  const handleAuth = async () => {
    if (!authPassword.trim()) {
      setError('Please enter your password');
      return;
    }
    if (authPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (authMode === 'signup') {
      if (!authEmail.trim()) {
        setError('Please enter your email address');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail.trim())) {
        setError('Please enter a valid email address');
        return;
      }
      if (!authUsername.trim()) {
        setError('Please enter a username');
        return;
      }

      if (authPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!recaptchaVerified) {
        setError('Please complete the reCAPTCHA verification');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: { full_name: authUsername }
        }
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: authEmail,
          full_name: authUsername,
          subscription_tier: 'free',
          subscription_status: 'inactive'
        });

        setUsername(authUsername);
        setIsLoggedIn(true);
        setUserTier('free');
        setQuestionsToday(0);
        setLastQuestionDate(new Date().toDateString());
        setError('Account created! Check your email to confirm your account.');
      }

    } else {
      if (!authEmail.trim()) {
        setError('Please enter your email address');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail.trim())) {
        setError('Please enter a valid email address');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        const displayName = data.user.user_metadata?.full_name || data.user.email;
        setUsername(displayName);
        setIsLoggedIn(true);
      
        // Load premium status from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, saved_responses')
          .eq('id', data.user.id)
          .single();
      
          if (profile) {
            const isActive = profile.subscription_status === 'active';
            const isPaidTier = ['monthly', 'yearly', 'lifetime'].includes(profile.subscription_tier);
            setUserTier(isActive && isPaidTier ? 'premium' : 'free');
            
            if (profile.saved_responses) {
              try {
                setSavedResponses(JSON.parse(profile.saved_responses));
              } catch (err) {
                console.error('Error loading saved responses:', err);
              }
            }
          }
          // Load reading plan progress from new columns
          try {
            const { data: progressRow } = await supabase
              .from('profiles')
              .select('reading_plan_progress, reading_plan_day')
              .eq('id', data.user.id)
              .single();
            if (progressRow) {
              if (progressRow.reading_plan_progress != null) {
                const raw = progressRow.reading_plan_progress;
                const progress = typeof raw === 'string' ? JSON.parse(raw) : raw;
                const keys = planProgressToCompletedReadings(progress);
                setCompletedReadings(keys);
              } else {
                setCompletedReadings([]);
              }
              const dayVal = progressRow.reading_plan_day;
              setSelectedPlanDay(dayVal != null && dayVal !== '' ? Number(dayVal) : null);
            }
          } catch (err) {
            console.error('Error loading reading plan progress on login:', err);
          }
      }
    }

    setShowAuthModal(false);
    setShowForgotPassword(false);
    setError('');
    setAuthUsername('');
    setAuthPassword('');
    setConfirmPassword('');
    setRecaptchaVerified(false);
    setAuthEmail('');
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
      redirectTo: window.location.origin
    });

    if (error) {
      setError(error.message);
      return;
    }

    setResetEmailSent(true);
    setError('');
  };

  const handleLogout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const reading_plan_progress = completedReadingsToPlanProgress(completedReadings);
        const reading_plan_day = selectedPlanDay != null ? selectedPlanDay : null;
        const completed_books = getCompletedBooksList();
        await supabase
          .from('profiles')
          .update({
            reading_plan_progress: reading_plan_progress,
            reading_plan_day: reading_plan_day,
            completed_books: completed_books
          })
          .eq('id', user.id);
      }
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoggedIn(false);
      setUsername('');
      setUserTier('free');
      setQuestionsToday(0);
      setSavedResponses([]);
      setPrayerJournal([]);
      setCompletedReadings([]);
      setSelectedPlanDay(null);
      setBibleBook('Genesis');
      setBibleChapter(1);
      setCurrentView('home');
      setBibleBookmark(null);
    }
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

  const handleStripeCheckout = async (priceId, isSubscription = true, planName = 'Premium') => {
    // Require authentication before allowing payment
    if (!isLoggedIn || !username) {
      alert('Please sign in before making a payment. This ensures your premium status is saved to your account.');
      setShowAuthModal(true);
      return;
    }

    setStripeLoading(true);
    try {
      // Check if Stripe.js is loaded
      if (typeof window.Stripe === 'undefined') {
        alert('Stripe is not loaded. Please refresh the page and try again.');
        setStripeLoading(false);
        return;
      }

      const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
      
      // Check if Stripe initialized correctly
      if (!stripe) {
        alert('Failed to initialize Stripe. Please check your API key.');
        setStripeLoading(false);
        return;
      }

      // Get backend API URL from environment variable
      const envBackendUrl = import.meta.env.VITE_STRIPE_API_URL;
      const backendUrl = envBackendUrl || 'http://localhost:3001';
      
      // Warn if using default in production (but still allow it for development)
      if (!envBackendUrl && import.meta.env.PROD) {
        console.warn('VITE_STRIPE_API_URL not set. Using default localhost URL. This may not work in production.');
      }

      // Verify payment backend is reachable before attempting checkout (avoids generic network errors)
      try {
        const healthRes = await fetch(`${backendUrl}/health`, { method: 'GET' });
        if (!healthRes.ok) {
          throw new Error(`Backend returned ${healthRes.status}`);
        }
      } catch (err) {
        const hint = !envBackendUrl
          ? ' Start the backend server (e.g. run the server in this project) or set VITE_STRIPE_API_URL in .env to your payment API URL.'
          : ` Ensure the server at ${backendUrl} is running.`;
        alert('Payment server is unreachable.' + hint);
        setStripeLoading(false);
        return;
      }

      // Create checkout session via backend API
      const response = await fetch(`${backendUrl}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          isSubscription,
          planName,
          username: username,
          successUrl: `${window.location.origin}?payment=success&type=${isSubscription ? 'subscription' : 'payment'}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}?payment=cancel`,
          trialPeriodDays: isSubscription ? 3 : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || 'Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();
      
      if (!url) {
        throw new Error('No checkout URL returned from server');
      }
      
      // Redirect to Stripe hosted Checkout (redirectToCheckout was removed in Stripe.js Sept 2025)
      window.location.href = url;
    } catch (err) {
      console.error('Stripe checkout error:', err);
      alert('Unable to process payment: ' + (err.message || 'Please try again. Make sure the backend server is running.'));
    } finally {
      setStripeLoading(false);
    }
  };

  // Payment success/cancel: run only when URL has payment params; do not depend on saveUserData
  // so the effect doesn't re-run when saveUserData identity changes (which would re-show alerts).
  const saveUserDataRefForPayment = React.useRef(saveUserData);
  saveUserDataRefForPayment.current = saveUserData;
  const paymentSuccessCancelledRef = React.useRef(false);
  // Bind payment success to the user who was logged in when the URL was first seen (avoids applying to wrong user after logout/login)
  const paymentIntendedForUsernameRef = React.useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const purchaseType = urlParams.get('type');
    // Stripe replaces {CHECKOUT_SESSION_ID} in success_url when redirecting; treat literal placeholder as missing
    let sessionId = urlParams.get('session_id');
    if (sessionId === '{CHECKOUT_SESSION_ID}' || !sessionId) sessionId = null;

    if (paymentStatus !== 'success' && paymentStatus !== 'cancel') return;

    if (paymentStatus === 'cancel') {
      window.history.replaceState({}, '', window.location.pathname);
      alert('Payment cancelled. No charges were made.');
      return;
    }

    // paymentStatus === 'success': bind to the user who is logged in when we first see this URL
    if (paymentStatus === 'success') {
      if (paymentIntendedForUsernameRef.current == null) {
        paymentIntendedForUsernameRef.current = username || null;
      }
      const intendedUsername = paymentIntendedForUsernameRef.current;

      paymentSuccessCancelledRef.current = false;
      const premiumData = {
        tier: 'premium',
        purchaseType: purchaseType || 'unknown',
        timestamp: new Date().toISOString(),
        username: intendedUsername
      };

      const runAsync = async () => {
        try {
          if (sessionId) {
            await safeStorageSet(`premium_session_${sessionId}`, JSON.stringify(premiumData), true);
          }
          if (paymentSuccessCancelledRef.current) return;
          if (isLoggedIn && username === intendedUsername) {
            await safeStorageSet(`premium_user_${username}`, JSON.stringify(premiumData));
          }
          if (paymentSuccessCancelledRef.current) return;
          await safeStorageSet(`premium_${Date.now()}`, JSON.stringify(premiumData), true);
        } catch (err) {
          console.error('Error storing premium session:', err);
        }
        if (paymentSuccessCancelledRef.current) return;

        if (isLoggedIn && username === intendedUsername) {
          const saveFn = saveUserDataRefForPayment.current;
          if (saveFn) await saveFn('premium');
        }
        if (paymentSuccessCancelledRef.current) return;

        // Only update UI and show alerts for the user this payment was intended for
        if (isLoggedIn && username === intendedUsername) {
          setUserTier('premium');
          if (purchaseType === 'subscription') {
            alert('Welcome to Premium! Your 3-day free trial has started. You\'ll have full access immediately, and your card will be charged after the trial ends unless you cancel. Check your email for your Stripe receipt with cancellation instructions.');
          } else if (purchaseType === 'payment') {
            alert('Welcome to Premium! Your Lifetime Premium purchase is complete. You now have unlimited access to all features with no recurring charges. Thank you for your support!');
          } else {
            alert('Welcome to Premium! You now have unlimited access to all features.');
          }
        }

        paymentIntendedForUsernameRef.current = null;
        try {
          window.history.replaceState({}, '', window.location.pathname);
        } catch (e) {
          /* ignore */
        }
      };
      runAsync().catch((err) => console.error('Payment success handler error:', err));
    }

    return () => {
      paymentSuccessCancelledRef.current = true;
      paymentIntendedForUsernameRef.current = null;
      try {
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) {
        /* ignore */
      }
    };
  }, [isLoggedIn, username]);

  const submitContactForm = async () => {
    if (!contactInfo.name || !contactInfo.email) {
      alert('Please fill in your name and email');
      return;
    }
    try {
      if (window.storage) await window.storage.set(`contact_request_${Date.now()}`, JSON.stringify({
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
    const premiumFeatures = ['community', 'journal', 'reading-plan', 'people'];
    if (premiumFeatures.includes(feature)) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const fetchPeopleProfile = async (name) => {
    if (!name || loadingPeopleProfile) return;
    setLoadingPeopleProfile(true);
    setPeopleProfile(null);
    try {
      const res = await anthropicRequest({
        maxTokens: 4000,
        messages: [{
          role: 'user',
          content: `You are a Biblical reference assistant. Return a JSON object only (no markdown, no code fence) for this Biblical figure: "${name}". Use exactly these keys: name (string), testament (string: "Old" or "New"), category (string, e.g. Prophet, King, Apostle, Judge, Priest, Patriarch, Matriarch, Disciple), hometown (string), parents (string), siblings (string), children (string), spouse (string), summary (string, 2-3 sentences), story (string, their full story and role in the Bible), interactions_with_god (string), key_scriptures (array of strings, 3-5 verses with reference and text, e.g. "Genesis 1:1 - In the beginning..."), significance (string). For any unknown or not applicable field use null or empty string.`
        }]
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error?.message || 'API error');
      let text = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : '';
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(text);
      setPeopleProfile(parsed);
    } catch (err) {
      console.error('fetchPeopleProfile error', err);
      setPeopleProfile({ error: 'Could not load profile. Please try again.' });
    } finally {
      setLoadingPeopleProfile(false);
    }
  };

  const submitPeopleQuestion = async (q) => {
    if (!q || !q.trim() || !selectedPerson || loadingPeopleAnswer) return;
    const questionText = q.trim().replace(/`/g, "'").replace(/\$\{/g, '${').slice(0, 500);
    setLoadingPeopleAnswer(true);
    try {
      const res = await anthropicRequest({
        maxTokens: 1500,
        messages: [{
          role: 'user',
          content: `The user is asking a question about the Biblical figure "${selectedPerson}". Their question: "${questionText}". Answer based on Scripture and the person's role in the Bible. Be concise and clear. Reply with plain text only, no JSON.`
        }]
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error?.message || 'API error');
      const answer = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text.trim() : 'Sorry, I could not generate an answer.';
      setPeopleAnswers(prev => [...prev, { question: questionText, answer }]);
    } catch (err) {
      console.error('submitPeopleQuestion error', err);
      setPeopleAnswers(prev => [...prev, { question: questionText, answer: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoadingPeopleAnswer(false);
    }
  };

  const fetchPlacesProfile = async (placeName) => {
    if (!placeName || loadingPlacesProfile) return;
    setLoadingPlacesProfile(true);
    setPlacesProfile(null);
    try {
      const res = await anthropicRequest({
        maxTokens: 4000,
        messages: [{
          role: 'user',
          content: `You are a Biblical geography reference assistant. Return a JSON object only (no markdown, no code fence) for this Biblical place: "${placeName}". Use exactly these keys:
name (string),
modern_name (string, what the place is called today or closest modern equivalent),
modern_country (string, the modern country this location is in),
region (string, e.g. Judea, Galilee, Egypt, Mesopotamia, Greece, Asia Minor, etc.),
testament (string: "Old", "New", or "Both"),
significance (string, 2-4 sentences explaining why this place matters in the Bible),
key_events (string, major Biblical events that happened here, up to 5 events),
people_associated (array of strings, Biblical figures connected to this place — use exact names from this list where applicable: Adam, Eve, Cain, Abel, Seth, Noah, Abraham, Sarah, Hagar, Ishmael, Isaac, Rebekah, Esau, Jacob, Rachel, Leah, Joseph, Moses, Aaron, Miriam, Joshua, Caleb, Deborah, Gideon, Samson, Ruth, Naomi, Boaz, Hannah, Eli, Samuel, Saul, David, Jonathan, Bathsheba, Solomon, Elijah, Elisha, Jezebel, Ahab, Isaiah, Jeremiah, Ezekiel, Daniel, Job, Esther, Mordecai, Nehemiah, Ezra, Rahab, Lot, Melchizedek, Balaam, Jephthah, Jesse, Goliath, Absalom, Joab, Nathan, Hezekiah, Josiah, Nebuchadnezzar, Cyrus, Darius, Xerxes, Mary mother of Jesus, Joseph husband of Mary, John the Baptist, Jesus, Peter, Andrew, James son of Zebedee, John son of Zebedee, Philip, Matthew, Thomas, Judas Iscariot, Mary Magdalene, Martha, Lazarus, Nicodemus, Zacchaeus, Stephen, Paul, Barnabas, Silas, Timothy, Luke, Mark, Lydia, Priscilla, Aquila, Cornelius, Pontius Pilate, Caiaphas, Herod the Great, Herod Antipas),
interactions_with_god (string, any direct appearances, visions, or miracles of God or Jesus at this location — "None recorded" if none),
key_scriptures (array of strings, 3-5 key Bible verses mentioning this place, with reference and partial text, e.g. "Genesis 28:19 - He called that place Bethel..."),
coordinates (object with lat and lng as numbers, approximate modern GPS coordinates for this location),
nearby_places (array of objects, up to 6 nearby Biblical locations from our list within roughly 200km, each with: name (string), lat (number), lng (number)).
For any unknown field use null. Return valid JSON only.`
        }]
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error?.message || 'API error');
      let text = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : '';
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(text);
      setPlacesProfile(parsed);
    } catch (err) {
      console.error('fetchPlacesProfile error', err);
      setPlacesProfile({ error: 'Could not load profile. Please try again.' });
    } finally {
      setLoadingPlacesProfile(false);
    }
  };

  const submitPlacesQuestion = async (q) => {
    if (!q || !q.trim() || !selectedPlace || loadingPlacesAnswer) return;
    const questionText = q.trim();
    setLoadingPlacesAnswer(true);
    try {
      const res = await anthropicRequest({
        maxTokens: 1500,
        messages: [{
          role: 'user',
          content: `The user is asking a question about the Biblical location "${selectedPlace}". Their question: "${questionText}". Answer based on Scripture and the place's significance in the Bible. Be concise and clear. Reply with plain text only, no JSON.`
        }]
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error?.message || 'API error');
      const answer = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text.trim() : 'Sorry, I could not generate an answer.';
      setPlacesAnswers(prev => [...prev, { question: questionText, answer }]);
    } catch (err) {
      console.error('submitPlacesQuestion error', err);
      setPlacesAnswers(prev => [...prev, { question: questionText, answer: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoadingPlacesAnswer(false);
    }
  };

  const guidanceToneDescriptions = {
    gentle: 'a warm, gentle, and comforting',
    direct: 'a clear, honest, and practical',
    deep: 'a thoughtful, in-depth, and teaching-oriented'
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (!checkDailyLimit()) return;

    const toneDescription = guidanceToneDescriptions[guidanceTone] || guidanceToneDescriptions.gentle;

    setLoading(true);
    setError('');
    setResponse(null);

    const sanitizedQuestion = question.trim().replace(/`/g, "'").replace(/\$\{/g, '${').slice(0, 500);

    const makeRequest = async (attempt = 1) => {
      try {
        const apiResponse = await anthropicRequest({
        maxTokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a compassionate spiritual guide using the World English Version (WEV) of the Bible. Please respond in ${toneDescription} tone that is easy to understand. The person is asking: "${sanitizedQuestion}". Provide a JSON response with: 1) "compassionateResponse": a short, empathetic answer, 2) "verses": an array of 2-3 relevant Bible verses from the World English Version with "reference" and "text", 3) "wwjd": what Jesus might do or invite them to do, 4) "encouragement": a hopeful closing thought. Format as JSON only: {"compassionateResponse": "", "verses": [{"reference": "", "text": ""}], "wwjd": "", "encouragement": ""}`
        }]
      });

      const data = await apiResponse.json();
      if (data.error) {
        console.error('API error:', data.error);
        if (attempt < 3) {
          setTimeout(() => makeRequest(attempt + 1), 2000);
          return;
        }
        setError("Lord have mercy, we've got too many tabs open up here! Even God rested on the seventh day. Give us just a second and we'll be right back with your answer. 🕊️📜");
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
      if (attempt < 3) {
        setTimeout(() => makeRequest(attempt + 1), 2000);
        return;
      }
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  makeRequest();
};

  const saveResponse = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    const newSaved = [response, ...savedResponses];
    setSavedResponses(newSaved);
    
    if (isLoggedIn) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ saved_responses: JSON.stringify(newSaved) })
          .eq('id', user.id);
      }
    }
    setSavedResponse(true);
setTimeout(() => setSavedResponse(false), 2000);
  };

  const shareResponse = () => {
    const shareText = `${response.verses[0].text} - ${response.verses[0].reference}`;
    if (navigator.share) {
      navigator.share({ text: shareText, title: 'VerseAid' });
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('prayer_journal').insert({
          id: entry.id,
          user_id: user.id,
          text: entry.text,
          date: entry.date,
          answered: false,
          category: entry.category || 'other'
        });
        if (shareToCommunity) {
          const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          const { data: cp } = await supabase.from('community_prayers').insert({
            user_id: user.id,
            source_journal_id: entry.id,
            text: entry.text,
            date: entry.date,
            category: entry.category || 'other',
            prayer_count: 0,
            answered: false,
            expiration_date: oneYearFromNow
          }).select('id').single();
          if (cp) {
            setCommunityPrayers(prev => [{ id: cp.id, text: entry.text, date: entry.date, category: entry.category || 'other', prayerCount: 0, answered: false }, ...prev]);
            setSharedPrayerIds(prev => [...prev, entry.id]);
          }
        }
      } else if (shareToCommunity) {
        const communityEntry = { ...entry, source_journal_id: entry.id, prayerCount: 0 };
        const updatedCommunity = [communityEntry, ...communityPrayers];
        setCommunityPrayers(updatedCommunity);
        await safeStorageSet('community_prayers', JSON.stringify(updatedCommunity), true);
      }
    } catch (e) {
      console.error('Supabase add prayer error', e);
    }

    setNewPrayerEntry('');
    setShareToCommunity(false);
    setPrayerCategory('');
    setShowPrayerModal(false);
  };

  const sharePrayerToCommunity = async (journalEntry) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const { data: cp, error } = await supabase.from('community_prayers').insert({
          user_id: user.id,
          source_journal_id: journalEntry.id,
          text: journalEntry.text,
          date: journalEntry.date,
          category: journalEntry.category || 'other',
          prayer_count: 0,
          answered: journalEntry.answered ?? false,
          expiration_date: oneYearFromNow
        }).select('id').single();
        if (!error && cp) {
          setCommunityPrayers(prev => [{ id: cp.id, text: journalEntry.text, date: journalEntry.date, category: journalEntry.category || 'other', prayerCount: 0, answered: journalEntry.answered ?? false }, ...prev]);
          setSharedPrayerIds(prev => [...prev, journalEntry.id]);
          setSharedPrayer(journalEntry.id);
          setTimeout(() => setSharedPrayer(null), 2000);
          return;
        }
      }
    } catch (e) {
      console.error('Supabase share prayer error', e);
    }
    const communityEntry = { id: Date.now(), source_journal_id: journalEntry.id, text: journalEntry.text, date: journalEntry.date, prayerCount: 0, category: journalEntry.category || 'other' };
    setCommunityPrayers([communityEntry, ...communityPrayers]);
    setSharedPrayerIds([...sharedPrayerIds, journalEntry.id]);
    await safeStorageSet('community_prayers', JSON.stringify([communityEntry, ...communityPrayers]), true);
    setSharedPrayer(journalEntry.id);
    setTimeout(() => setSharedPrayer(null), 2000);
  };

  const deleteSavedResponse = async (index) => {
    const newSaved = savedResponses.filter((_, i) => i !== index);
    setSavedResponses(newSaved);
    
    if (isLoggedIn) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ saved_responses: JSON.stringify(newSaved) })
          .eq('id', user.id);
      }
    }
  };

  const prayForRequest = async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('community_prayer_support').insert({ prayer_id: id, user_id: user.id });
        if (!error) {
          setPrayedForIds(prev => [...prev, id]);
          const p = communityPrayers.find(c => c.id === id);
          if (p) setCommunityPrayers(prev => prev.map(c => c.id === id ? { ...c, prayerCount: (c.prayerCount ?? 0) + 1 } : c));
        }
        return;
      }
    } catch (e) {
      console.error('Supabase pray for error', e);
    }
    setPrayedForIds([...prayedForIds, id]);
    const updated = communityPrayers.map(p => p.id === id ? { ...p, prayerCount: (p.prayerCount ?? 0) + 1 } : p);
    setCommunityPrayers(updated);
    await safeStorageSet('community_prayers', JSON.stringify(updated), true);
  };

  const saveDailyVerseToCollection = async() => {
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
    const newSaved = [verseResponse, ...savedResponses];
    setSavedResponses(newSaved);
    setSavedDailyVerse(true);
    setTimeout(() => setSavedDailyVerse(false), 2000);
    
    if (isLoggedIn) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ saved_responses: JSON.stringify(newSaved) })
          .eq('id', user.id);
      }
    }
  };

  const filteredCommunityPrayers = filterCategory === 'all' 
    ? communityPrayers 
    : communityPrayers.filter(p => p.category === filterCategory);

  const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
  const isStillBelievingEligible = (prayer) => {
    if (!currentUserId || prayer.user_id !== currentUserId) return false;
    const now = Date.now();
    const createdAt = prayer.created_at ? new Date(prayer.created_at).getTime() : 0;
    const lastExtended = prayer.last_extended_at ? new Date(prayer.last_extended_at).getTime() : null;
    const showSinceCreated = lastExtended === null && (now - createdAt >= SIX_MONTHS_MS);
    const showSinceExtended = lastExtended !== null && (now - lastExtended >= SIX_MONTHS_MS);
    return showSinceCreated || showSinceExtended;
  };

  const extendPrayerOnWall = async (communityPrayerId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const prayer = communityPrayers.find(p => p.id === communityPrayerId);
      if (!prayer?.expiration_date) return;
      const newExpiration = new Date(new Date(prayer.expiration_date).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const nowIso = new Date().toISOString();
      const { error } = await supabase.from('community_prayers').update({
        expiration_date: newExpiration,
        last_extended_at: nowIso
      }).eq('id', communityPrayerId).eq('user_id', user.id);
      if (!error) {
        setCommunityPrayers(prev => prev.map(p => p.id === communityPrayerId ? { ...p, expiration_date: newExpiration, last_extended_at: nowIso } : p));
        loadUserData();
      }
    } catch (e) {
      console.error('Extend prayer error', e);
    }
  };

  const togglePrayerAnswered = async (id) => {
    const entry = prayerJournal.find(p => p.id === id);
    const newAnswered = entry ? !entry.answered : true;
    setPrayerJournal(prayerJournal.map(p =>
      p.id === id ? { ...p, answered: newAnswered } : p
    ));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('prayer_journal').update({ answered: newAnswered }).eq('user_id', user.id).eq('id', id);
        if (sharedPrayerIds.includes(id)) {
          const communityPrayer = communityPrayers.find(p => p.source_journal_id === id);
          const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const oneYearFromCreated = communityPrayer?.created_at
            ? new Date(new Date(communityPrayer.created_at).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          await supabase.from('community_prayers').update({
            answered: newAnswered,
            expiration_date: newAnswered ? thirtyDaysFromNow : oneYearFromCreated
          }).eq('user_id', user.id).eq('source_journal_id', id);
          setCommunityPrayers(prev => prev.map(p => (p.source_journal_id === id ? { ...p, answered: newAnswered, expiration_date: newAnswered ? thirtyDaysFromNow : oneYearFromCreated } : p)));
        }
      }
    } catch (e) {
      console.error('Supabase toggle answered error', e);
    }
  };

  const deletePrayerEntry = async (id) => {
    const isShared = sharedPrayerIds.includes(id);
    if (isShared) {
      setDeletePrayerConfirmId(id);
      return;
    }
    await performDeletePrayerEntry(id);
  };

  const performDeletePrayerEntry = async (id) => {
    const isShared = sharedPrayerIds.includes(id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('community_prayers').delete().eq('user_id', user.id).eq('source_journal_id', id);
        await supabase.from('prayer_journal').delete().eq('user_id', user.id).eq('id', id);
      }
    } catch (e) {
      console.error('Supabase delete prayer error', e);
    }
    setPrayerJournal(prayerJournal.filter(p => p.id !== id));
    if (isShared) {
      setSharedPrayerIds(prev => prev.filter(x => x !== id));
      setCommunityPrayers(prev => prev.filter(p => p.source_journal_id !== id));
    }
    setDeletePrayerConfirmId(null);
  };

  const guidanceToneOptions = [
    { value: 'gentle', label: 'Gentle & comforting' },
    { value: 'direct', label: 'Clear & practical' },
    { value: 'deep', label: 'Deeper Bible study' }
  ];

  const exampleQuestions = [
    "I'm feeling anxious about my future. What does the Bible say?",
    "How do I forgive someone who hurt me deeply?",
    "I'm struggling with loneliness. Where can I find comfort?",
    "How should I handle conflict with a family member?"
  ];

  const HomeView = () => {
    return (
    <div>
      {dailyVerse && !showDailyVerse && (
        <div
            onClick={() => setShowDailyVerse(true)}
            style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}
            className="mb-8 cursor-pointer hover:shadow-[0_12px_48px_rgba(123,66,212,0.35)] transition-all"
          >
          <div className="flex items-start gap-3 p-6 rounded-xl" style={{ background: '#0d0a1a' }}>
            <Calendar className="w-6 h-6 text-[#e8a930] flex-shrink-0 mt-1" strokeWidth={1.5} />
            <div className="flex-1">
              <h3 className="va-font-playfair font-semibold text-[#e8a930] mb-2">Today's Verse</h3>
              <p className="text-sm va-scripture va-bible-verse-text text-white/95 line-clamp-2">"{dailyVerse.text}"</p>
              <p className="text-xs va-verse-ref mt-1">— {dailyVerse.reference}</p>
              <p className="text-xs va-muted mt-2">Tap to read reflection →</p>
            </div>
          </div>
        </div>
      )}

      {showDailyVerse && dailyVerse && (
          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="va-verse-of-day-card mb-8">
          <div style={{ background: '#0d0a1a' }} className="p-8 rounded-xl">
            <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold va-font-playfair text-white">Today's Verse & Reflection</h3>
            <div className="flex gap-2">
              <button 
                onClick={saveDailyVerseToCollection}
                className={`p-2 rounded-xl transition-all ${
                  savedDailyVerse 
                    ? 'va-btn-primary' 
                    : 'va-btn-glass'
                }`}
              >
                <Star className={`w-5 h-5 ${savedDailyVerse ? 'fill-current' : ''}`} strokeWidth={1.5} />
              </button>
              <button onClick={() => setShowDailyVerse(false)} className="va-muted hover:text-white p-2">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            </div>
          </div>
          <div className="space-y-4">
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
                <p className="va-scripture va-bible-verse-text text-white/95 mb-2">"{dailyVerse.text}"</p>
                <p className="text-sm va-verse-ref">— {dailyVerse.reference}</p>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
                <p className="text-sm text-white/90 leading-relaxed va-font-nunito">{dailyVerse.reflection}</p>
            </div>
            </div>
            </div>
          </div>
      )}

      <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="mb-8 hover:border-[rgba(166,110,232,0.25)] transition-all">
        <div style={{ background: '#0d0a1a' }} className="p-8 rounded-xl">
        {isLoggedIn && userTier === 'free' && (
          <div className="mb-6 p-4 va-premium-banner">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-sm font-semibold text-[#e8a930]">
                  Daily Questions: {questionsToday}/3 used
                </p>
                <p className="text-xs va-muted mt-1">
                  Premium gives you unlimited questions, the full prayer journal, community wall, and the Bible-in-a-year plan—with no daily limits.
                </p>
              </div>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="va-btn-primary px-6 py-2 whitespace-nowrap"
              >
                See Premium
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#e8a930] mb-1 va-font-nunito">
              What's on your heart today?
            </label>
            <p className="text-xs va-muted mb-2">
              Share in your own words—VerseAid will listen gently and answer from the World English Version.
            </p>
            <textarea
             value={question}
             onChange={(e) => setQuestion(e.target.value)}
             key="main-question-textarea"
              autoFocus
              placeholder="Share your question, concern, or situation..."
              className="va-input w-full px-6 py-4 rounded-xl resize-none"
              rows="5"
              maxLength={500}
            />
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold va-muted mb-2">
              Response style
            </p>
            <div className="flex flex-wrap gap-2">
              {guidanceToneOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGuidanceTone(option.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all va-font-nunito ${
                    guidanceTone === option.value
                      ? 'va-btn-primary border-transparent'
                      : 'va-btn-glass'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full va-btn-primary py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Seeking guidance...
              </>
            ) : (
              <>
                <span>✦</span>
                Seek & Find
              </>
            )}
          </button>
        </div>

        {!response && !loading && (
          <div className="mt-8 pt-8 border-t border-[rgba(255,255,255,0.08)]">
            <p className="text-sm font-semibold va-muted mb-4">Try asking:</p>
            <div className="space-y-2">
              {exampleQuestions.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(example)}
                  className="w-full text-left px-6 py-3 va-btn-glass hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.12)] rounded-xl text-sm transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
        </div>
      {response && (
        <div className="space-y-6">
          <div className="flex gap-3 justify-center">
          <button
              onClick={saveResponse}
              className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all duration-300 va-font-nunito ${
                savedResponse
                  ? 'va-btn-primary scale-110'
                  : 'va-btn-glass'
              }`}
            >
              <Star className={`w-4 h-4 transition-all duration-300 ${savedResponse ? 'fill-current scale-125' : ''}`} strokeWidth={1.5} />
              {savedResponse ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={shareResponse}
              className="va-btn-glass flex items-center gap-2 px-6 py-3 rounded-xl"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.5} />
              Share
            </button>
          </div>

          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
            <div style={{ background: '#0d0a1a' }} className="p-8 rounded-xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-full va-btn-primary flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold va-heading mb-3">A Word of Understanding</h2>
                <p className="text-white/90 leading-relaxed va-font-nunito">{response.compassionateResponse}</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
            <div style={{ background: '#0d0a1a' }} className="p-8 rounded-xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-full va-btn-primary flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold va-heading mb-4">Scripture for Your Journey</h2>
                <div className="space-y-4">
                  {response.verses.map((verse, idx) => (
                    <div
                      key={idx}
                      onClick={() => goToVerse(verse.reference)}
                      style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}
                      className="rounded-xl cursor-pointer hover:border-[rgba(166,110,232,0.3)] transition-all"
                    >
                        <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
                        <p className="va-scripture va-bible-verse-text text-white/95 mb-3">"{verse.text}"</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm va-verse-ref">— {verse.reference}</p>
                          <span className="text-xs va-muted">
                            Tap to open in Bible reader →
                          </span>
                        </div>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
            <div style={{ background: '#0d0a1a' }} className="p-8 rounded-xl">
            <h2 className="text-2xl font-bold va-heading mb-3">What Would Jesus Do?</h2>
            <p className="text-white/90 leading-relaxed va-font-nunito">{response.wwjd}</p>
            </div>
            </div>

          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
            <div style={{ background: '#0d0a1a' }} className="p-8 rounded-xl">
            <h2 className="text-2xl font-bold va-heading mb-3">Words of Encouragement</h2>
            <p className="text-white/90 leading-relaxed va-font-nunito">{response.encouragement}</p>
            </div>
            </div>

          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
            <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
            <h3 className="text-lg font-bold va-heading mb-3">Keep the conversation going</h3>
            <p className="text-xs va-muted mb-3">
              Tap a follow-up to add it to the question box. You can edit it before sending.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextQuestion = `Help me apply this guidance in a practical way. My original question was: "${response.question}".`;
                  setQuestion(nextQuestion);
                  try {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } catch (e) {
                    window.scrollTo(0, 0);
                  }
                }}
                className="va-btn-glass px-3 py-1.5 rounded-full text-xs font-semibold"
              >
                Apply this to my situation
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextQuestion = `Turn this guidance into a short, personal prayer I can pray word-for-word. My original question was: "${response.question}".`;
                  setQuestion(nextQuestion);
                  try {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } catch (e) {
                    window.scrollTo(0, 0);
                  }
                }}
                className="va-btn-glass px-3 py-1.5 rounded-full text-xs font-semibold"
              >
                Turn this into a prayer
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextQuestion = `Share a few more World English Version verses that go even deeper on this same theme. My original question was: "${response.question}".`;
                  setQuestion(nextQuestion);
                  try {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } catch (e) {
                    window.scrollTo(0, 0);
                  }
                }}
                className="va-btn-glass px-3 py-1.5 rounded-full text-xs font-semibold"
              >
                Show more related verses
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextQuestion = `What is one simple next step I can take this week in light of your last answer? My original question was: "${response.question}".`;
                  setQuestion(nextQuestion);
                  try {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } catch (e) {
                    window.scrollTo(0, 0);
                  }
                }}
                className="va-btn-glass px-3 py-1.5 rounded-full text-xs font-semibold"
              >
                Help me take a next step
              </button>
            </div>
            </div>
          </div>

          {userTier === 'free' && (
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
              <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
              <h3 className="text-lg font-bold va-heading mb-2">Enjoying this guidance?</h3>
              <p className="text-xs va-muted mb-3">
                Premium removes the 3-questions-a-day limit and unlocks the full prayer journal, community prayer wall, and Bible-in-a-year plan.
              </p>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center gap-2 va-btn-primary text-xs px-4 py-2 rounded-xl"
              >
                <Crown className="w-4 h-4" strokeWidth={1.5} />
                Learn about Premium
              </button>
            </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => {
                setQuestion('');
                setResponse(null);
                setError('');
              }}
              className="va-btn-glass font-bold py-3 px-8 rounded-xl"
            >
              Ask Another Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

  // Render other views (Saved, Journal, Community, Bible, Reading Plan) - continued from previous
  const SavedView = () => (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold va-heading mb-4">Saved Responses</h2>
      {savedResponses.length === 0 ? (
        <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
          <div style={{ background: '#0d0a1a' }} className="p-8 rounded-xl text-center">
          <BookMarked className="w-12 h-12 va-nav-inactive mx-auto mb-4" strokeWidth={1.5} />
          <p className="va-muted mb-2">No saved responses yet.</p>
          <p className="text-sm va-muted">
            After you receive guidance on the Home tab, tap <span className="text-[#e8a930] font-semibold">Save</span> to keep it here for later.
          </p>
          </div>
          </div>
      ) : (
        savedResponses.map((item, idx) => {
          const proseText = [
            item.compassionateResponse,
            item.wwjd,
            item.encouragement
          ].filter(Boolean).join(' ');
          const refFromProse = extractFirstVerseReference(proseText);
          const verseRefs = (item.verses || []).map((v) => v.reference);
          const showExtraLink = refFromProse && !verseRefs.some((r) => r === refFromProse);

          return (
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="hover:border-[rgba(166,110,232,0.25)] transition-all">
            <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm va-muted mb-2">{new Date(item.timestamp).toLocaleDateString()}</p>
                <p className="font-bold text-white/90 mb-3 va-font-nunito">Q: {item.question}</p>
              </div>
              <button
                onClick={() => deleteSavedResponse(idx)}
                className="va-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="space-y-2">
              {(item.verses || []).map((v, i) => (
                <div
                  key={i}
                  onClick={() => goToVerse(v.reference)}
                  style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}
                  className="rounded-xl cursor-pointer hover:border-[rgba(166,110,232,0.3)] transition-all"
                >
                    <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
                    <p className="text-sm va-scripture va-bible-verse-text text-white/95 mb-3">"{v.text}"</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs va-verse-ref">— {v.reference}</p>
                      <span className="text-xs va-muted">
                        Tap to open in Bible reader →
                      </span>
                    </div>
                </div>
                </div>
              ))}
            </div>
            {showExtraLink && (
              <div
                onClick={() => goToVerse(refFromProse)}
                style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}
                  className="rounded-xl cursor-pointer hover:border-[rgba(166,110,232,0.3)] transition-all"
                >
                <div style={{ background: '#0d0a1a' }} className="rounded-xl p-4">
                <span className="text-xs va-muted">
                  Tap to open in Bible reader →
                </span>
                </div>
                </div>
            )}
            </div>
            </div>
          );
        })
        )}
      </div>
    );

  const JournalView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold va-heading">Prayer Journal</h2>
        <button
          onClick={() => setShowPrayerModal(true)}
          className="flex items-center gap-2 va-btn-primary px-4 py-2 rounded-xl"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Add Prayer
        </button>
      </div>

      {prayerJournal.length === 0 ? (
        <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
          <div style={{ background: '#0d0a1a' }} className="p-8 rounded-xl text-center">
          <Heart className="w-12 h-12 va-nav-inactive mx-auto mb-4" strokeWidth={1.5} />
          <p className="va-muted">Start your prayer journal by adding your first prayer request.</p>
          </div>
          </div>
      ) : (
        prayerJournal.map((entry) => {
          const isThanksgiving = entry.category === 'thanksgiving';
          const IconBox = entry.answered
            ? () => <div className="w-9 h-9 rounded-lg bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center flex-shrink-0"><CheckCircle className="w-5 h-5 text-emerald-400" strokeWidth={1.5} /></div>
            : isThanksgiving
            ? () => <div className="w-9 h-9 rounded-lg bg-[#e8a930]/30 border border-[#e8a930]/50 flex items-center justify-center flex-shrink-0"><Star className="w-5 h-5 text-[#e8a930]" strokeWidth={1.5} /></div>
            : () => <div className="w-9 h-9 rounded-lg bg-[#7b42d4]/30 border border-[#a66ee8]/40 flex items-center justify-center flex-shrink-0"><MessageCircle className="w-5 h-5 text-[#a66ee8]" strokeWidth={1.5} /></div>;
          return (
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="hover:border-[rgba(166,110,232,0.25)] transition-all">
            <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl flex gap-4 flex-1">
            <IconBox />
            <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm va-muted">{new Date(entry.date).toLocaleDateString()}</p>
                {entry.category && (
                  <span className="inline-block mt-1 px-2 py-1 bg-[rgba(255,255,255,0.08)] text-[#c8c8e8] text-xs rounded-lg border border-[rgba(255,255,255,0.12)] font-medium va-font-nunito">
                    {prayerCategories.find(c => c.value === entry.category)?.label}
                  </span>
                )}
              </div>
              <button onClick={() => deletePrayerEntry(entry.id)} className="va-muted hover:text-white">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <p className="text-white/90 mb-3 va-font-nunito">{entry.text}</p>
            {sharedPrayerIds.includes(entry.id) && typeof entry.prayerCount === 'number' && (
              <p className="text-sm text-[#e8a930]/90 mb-2 va-font-nunito">{entry.prayerCount} {entry.prayerCount === 1 ? 'person' : 'people'} praying for this</p>
            )}
            {(() => {
              const communityPrayer = communityPrayers.find(cp => cp.source_journal_id === entry.id);
              return communityPrayer && isStillBelievingEligible(communityPrayer) ? (
                  <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="mb-3">
                  <div style={{ background: '#0d0a1a' }} className="p-3 rounded-xl">
                  <p className="text-xs va-muted mb-2">This prayer has been on the community wall for 6 months. Extend it for another year?</p>
                  <button
                    type="button"
                    onClick={() => extendPrayerOnWall(communityPrayer.id)}
                    className="va-btn-primary text-sm px-3 py-1.5 rounded-xl"
                  >
                    Still Believing
                  </button>
                  </div>
                  </div>
              ) : null;
            })()}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => togglePrayerAnswered(entry.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all va-font-nunito ${
                  entry.answered 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                    : 'va-btn-glass'
                }`}
              >
                {entry.answered ? 'Answered' : 'Mark as Answered'}
              </button>
              <button
                onClick={() => sharePrayerToCommunity(entry)}
                disabled={sharedPrayerIds.includes(entry.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all duration-300 va-font-nunito ${
                  sharedPrayer === entry.id
                    ? 'va-btn-primary scale-110'
                    : sharedPrayerIds.includes(entry.id)
                    ? 'bg-emerald-500/20 text-emerald-400 cursor-not-allowed'
                    : 'va-btn-glass'
                }`}
              >
                <Share2 className={`w-4 h-4 transition-all duration-300 ${sharedPrayer === entry.id ? 'scale-125' : ''}`} strokeWidth={1.5} />
                {sharedPrayer === entry.id ? 'Shared' : sharedPrayerIds.includes(entry.id) ? 'Shared' : 'Share'}
              </button>
            </div>
            </div>
            </div>
            </div>
          );
        })
      )}
 </div>
  );

  const CommunityView = () => {
    const isPremium = userTier === 'premium' || userTier === 'church';
    if (!isPremium) {
      return (
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-3xl font-bold va-heading mb-2">Community Prayer Wall</h2>
            <p className="va-muted text-sm mb-4">Join others in prayer. All requests are anonymous.</p>
        <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="mb-5">
              <div style={{ background: '#0d0a1a' }} className="py-4 rounded-xl px-4">
              <p className="text-center text-white/90 text-lg va-scripture max-w-2xl mx-auto leading-relaxed">
                "For where two or three gather in my name, there am I with them."
              </p>
              <p className="text-center va-verse-ref text-sm mt-2 font-medium">— Matthew 18:20</p>
              </div>
              </div>
            </div>
          <div className="va-premium-banner p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(166,110,232,0.2)] border-2 border-[rgba(166,110,232,0.4)] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#a66ee8]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold va-premium-banner-title mb-2">Community Prayer Wall is for Premium members</h3>
            <p className="va-muted text-sm mb-6 max-w-md mx-auto">
              Upgrade to premium to join the community, share prayer requests, and pray for others. Your prayers stay in your journal forever.
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="va-btn-primary px-6 py-3 rounded-xl"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      );
    }

    return (
    <div className="space-y-4">
    <section>
      <div className="mb-6">
        <h2 className="text-3xl font-bold va-heading mb-2">Community Prayer Wall</h2>
        <p className="va-muted text-sm mb-4">Join others in prayer. All requests are anonymous.</p>

        <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="mb-5 rounded-xl">
          <div style={{ background: '#0d0a1a' }} className="py-4 rounded-xl px-4">
          <p className="text-center text-white/90 text-lg va-scripture max-w-2xl mx-auto leading-relaxed">
            "For where two or three gather in my name, there am I with them."
          </p>
          <p className="text-center va-verse-ref text-sm mt-2 font-medium">— Matthew 18:20</p>
          </div>
          </div>
        </div>

        <div>
        <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="mb-4">
          <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl flex flex-wrap gap-6 justify-center">
          <div className="text-center">
            <p className="va-stats-number">{communityPrayers.length}</p>
            <p className="text-xs va-muted">Prayers</p>
          </div>
          <div className="text-center">
            <p className="va-stats-number">{communityPrayers.filter(p => p.answered).length}</p>
            <p className="text-xs va-muted">Answered</p>
          </div>
          <div className="text-center">
            <p className="va-stats-number">{new Set(communityPrayers.map(p => p.user_id)).size}</p>
            <p className="text-xs va-muted">Members</p>
          </div>
          </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all va-font-nunito ${
              filterCategory === 'all'
                ? 'va-btn-primary'
                : 'va-btn-glass'
            }`}
          >
            All Prayers
          </button>
          {prayerCategories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all va-font-nunito ${
                filterCategory === cat.value
                  ? 'va-btn-primary'
                  : 'va-btn-glass'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      {filteredCommunityPrayers.length === 0 ? (
        <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
          <div style={{ background: '#0d0a1a' }} className="p-8 rounded-xl text-center">
          <Heart className="w-12 h-12 va-nav-inactive mx-auto mb-4" strokeWidth={1.5} />
          <p className="va-muted mb-4">
            {filterCategory === 'all'
              ? 'No community prayer requests yet.'
              : `No prayers in this category yet.`}
          </p>
          <p className="text-sm va-muted">Share a prayer request with the community!</p>
          </div>
          </div>
      ) : (
        filteredCommunityPrayers.map((prayer) => {
          const hasPrayed = prayedForIds.includes(prayer.id);
          const category = prayerCategories.find(c => c.value === prayer.category);
          const isAnswered = prayer.answered === true;
          return (
            <div
              key={prayer.id}
              style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}
              className={`transition-all rounded-xl ${
                  isAnswered
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : 'hover:border-[rgba(166,110,232,0.25)]'
                }`}
              >
              <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', borderRadius: '50%', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="w-8 h-8 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#a66ee8]" strokeWidth={1.5} />
                    </div>
                  <div>
                    <p className="text-sm font-bold text-white/90 va-font-nunito">Anonymous</p>
                    <p className="text-xs va-muted">{new Date(prayer.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAnswered && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30 font-medium va-font-nunito">
                      <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Answered
                    </span>
                  )}
                  {category && (
                    <span className="px-2 py-1 bg-[rgba(255,255,255,0.08)] text-[#c8c8e8] text-xs rounded-lg border border-[rgba(255,255,255,0.12)] font-medium va-font-nunito">
                      {category.label}
                    </span>
                  )}
                </div>
              </div>

              {isAnswered && (
                <p className="text-sm font-semibold text-emerald-400 mb-2 va-font-nunito">Answered — Thank you Lord</p>
              )}
              <p className="text-white/90 mb-4 leading-relaxed va-font-nunito">{prayer.text}</p>

              {isStillBelievingEligible(prayer) && (
                  <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="mb-4">
                  <div style={{ background: '#0d0a1a' }} className="p-3 rounded-xl">
                  <p className="text-xs va-muted mb-2">Your prayer has been on the wall for 6 months. Extend it for another year?</p>
                  <button
                    type="button"
                    onClick={() => extendPrayerOnWall(prayer.id)}
                    className="va-btn-primary text-sm px-3 py-1.5 rounded-xl"
                  >
                    Still Believing
                  </button>
                  </div>
                  </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => prayForRequest(prayer.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold va-font-nunito ${
                    hasPrayed
                      ? 'va-btn-primary'
                      : 'va-btn-glass'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${hasPrayed ? 'fill-current' : ''}`} strokeWidth={1.5} />
                  {hasPrayed ? "I'm Praying" : "I'll Pray"}
                </button>
                <span className="text-sm va-muted font-medium">
                  {prayer.prayerCount ?? 0} {(prayer.prayerCount ?? 0) === 1 ? 'person' : 'people'} praying
              </span>
              </div>
              </div>
            </div>
          );
        })
      )}
    </section>
    </div>
  );
  };

  const fetchMiniInfo = async (name, type) => {
    setBiblePopup({ name, type, loading: true, data: null, error: false });
    try {
      const prompt = type === 'figure'
        ? `You are a Biblical reference assistant. For the Biblical person "${name}", return a JSON object only (no markdown, no code fence) with exactly these keys: category (string, e.g. "Prophet", "Apostle", "King", "Patriarch"), summary (string, one sentence describing who they are and their significance in the Bible). Return valid JSON only.`
        : `You are a Biblical geography reference assistant. For the Biblical place "${name}", return a JSON object only (no markdown, no code fence) with exactly these keys: modern_name (string, what this place is called today or its closest modern equivalent), significance (string, one sentence explaining why this place matters in the Bible). Return valid JSON only.`;
      const res = await anthropicRequest({ maxTokens: 200, messages: [{ role: 'user', content: prompt }] });
      const data = await res.json();
      if (data.error) throw new Error(data.error?.message || 'API error');
      let text = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : '';
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(text);
      setBiblePopup(prev => prev && prev.name === name ? { ...prev, loading: false, data: parsed } : prev);
    } catch (err) {
      console.error('fetchMiniInfo error', err);
      setBiblePopup(prev => prev && prev.name === name ? { ...prev, loading: false, error: true } : prev);
    }
  };

  const highlightFigures = (text) => {
    if (userTier !== 'premium') return text;
    const figureSet = new Set(BIBLICAL_FIGURES.map(f => f.toLowerCase()));
    const placeSet = new Set(BIBLICAL_PLACES.map(p => p.toLowerCase()));
    const seen = new Set();
    const allTerms = [...BIBLICAL_FIGURES, ...BIBLICAL_PLACES]
      .sort((a, b) => b.length - a.length)
      .filter(t => { const k = t.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
    const escaped = allTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'g');
    const parts = [];
    let last = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match.index > last) parts.push(text.slice(last, match.index));
      const word = match[0];
      const isFigure = figureSet.has(word.toLowerCase());
      const style = isFigure
        ? { background: 'rgba(201, 141, 26, 0.2)', color: '#c98d1a', borderBottom: '1px solid #c98d1a', cursor: 'pointer', borderRadius: '2px', padding: '0 2px' }
        : { background: 'rgba(123, 66, 212, 0.2)', color: '#a66ee8', borderBottom: '1px solid #a66ee8', cursor: 'pointer', borderRadius: '2px', padding: '0 2px' };
      parts.push(<span key={match.index} style={style} onClick={() => fetchMiniInfo(word, isFigure ? 'figure' : 'place')}>{word}</span>);
      last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.length > 0 ? parts : text;
  };

  const BibleView = () => (
    <div className="space-y-6">
      {bibleBookmark && (
        <button
          type="button"
          onClick={() => {
            const colonIdx = bibleBookmark.indexOf(':');
            const book = colonIdx !== -1 ? bibleBookmark.slice(0, colonIdx) : bibleBook;
            const chapter = colonIdx !== -1 ? parseInt(bibleBookmark.slice(colonIdx + 1), 10) : bibleChapter;
            if (!book || !chapter) return;
            setBibleBook(book);
            setBibleChapter(chapter);
            setHighlightedVerse(null);
            fetchBibleChapter(book, chapter);
          }}
          className="w-full va-verse-of-day-card p-4 flex items-center justify-center gap-3 hover:shadow-[0_12px_48px_rgba(123,66,212,0.35)] transition-all text-left"
        >
          <BookOpen className="w-6 h-6 text-[#e8a930] flex-shrink-0" strokeWidth={1.5} />
          <span className="va-font-playfair font-semibold text-[#e8a930]">Continue Reading</span>
          <span className="text-sm va-muted">— {bibleBookmark.replace(':', ' ')}</span>
        </button>
      )}

      {loadingBible && (
          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
          <div style={{ background: '#0d0a1a' }} className="p-12 rounded-xl text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#7b42d4] mx-auto mb-4" strokeWidth={1.5} />
          <p className="va-muted font-medium">Loading Bible chapter...</p>
          </div>
          </div>
      )}

      {!loadingBible && !bibleText && (
          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
          <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
          <h2 className="text-3xl font-bold va-heading mb-2">Read the Bible</h2>
          <p className="text-sm va-muted mb-4">
            Choose a book and chapter to read from the World English Version. Tap verses in answers to jump straight here.
          </p>
          
          {showBibleBookGrid ? (
            <>
              <h3 className="text-lg font-bold va-heading mb-3">Old Testament</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
                {bibleBooks.slice(0, 39).map(book => (
                  <button
                    key={book.name}
                    type="button"
                    onClick={() => {
                      setBibleBook(book.name);
                      setBibleChapter(1);
                      setShowBibleBookGrid(false);
                    }}
                    className="va-btn-glass text-left px-3 py-2.5 rounded-xl text-sm font-medium va-font-nunito hover:border-[rgba(166,110,232,0.3)] transition-colors"
                  >
                    {book.name}
                  </button>
                ))}
              </div>
              <h3 className="text-lg font-bold va-heading mb-3">New Testament</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                {bibleBooks.slice(39, 66).map(book => (
                  <button
                    key={book.name}
                    type="button"
                    onClick={() => {
                      setBibleBook(book.name);
                      setBibleChapter(1);
                      setShowBibleBookGrid(false);
                    }}
                    className="va-btn-glass text-left px-3 py-2.5 rounded-xl text-sm font-medium va-font-nunito hover:border-[rgba(166,110,232,0.3)] transition-colors"
                  >
                    {book.name}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowBibleBookGrid(true)}
                className="text-sm text-[#a66ee8] hover:text-[#c8c8e8] font-semibold mb-4 va-font-nunito"
              >
                ← Change book
              </button>
              <p className="text-sm va-muted mb-2">
                <span className="text-[#e8a930] font-semibold">{bibleBook}</span> — choose chapter
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {Array.from({ length: bibleBooks.find(b => b.name === bibleBook)?.chapters || 1 }, (_, i) => i + 1).map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => {
                      setHighlightedVerse(null);
                      setBibleChapter(ch);
                      fetchBibleChapter(bibleBook, ch);
                    }}
                    className="va-btn-glass aspect-square rounded-xl text-sm font-semibold va-font-nunito hover:border-[rgba(166,110,232,0.3)] transition-colors flex items-center justify-center"
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </>
          )}
          </div>
          </div>
      )}

      {!loadingBible && bibleText && (
        <>
          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
          <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold va-heading">
                {bibleText.book} {bibleText.chapter} <span className="text-sm font-normal va-muted">(World English Version)</span>
              </h3>
              <button
                onClick={() => {
                  setBibleText(null);
                  setHighlightedVerse(null);
                  setShowBibleBookGrid(true);
                  setLoadedChapters([]);
                  setChaptersLoaded([]);
                }}
                className="va-muted hover:text-white transition-colors"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm va-muted va-font-nunito">Text size</span>
              <button
                type="button"
                onClick={() => setBibleVerseFontSize(prev => Math.max(12, prev - 2))}
                disabled={bibleVerseFontSize <= 12}
                className="va-btn-glass w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold va-font-nunito disabled:opacity-40 disabled:cursor-not-allowed"
                title="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setBibleVerseFontSize(prev => Math.min(28, prev + 2))}
                disabled={bibleVerseFontSize >= 28}
                className="va-btn-glass w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold va-font-nunito disabled:opacity-40 disabled:cursor-not-allowed"
                title="Increase font size"
              >
                A+
              </button>
            </div>
            
            {loadedChapters.length > 0 && (
              <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
                {getPrevChapter(bibleBook, bibleChapter) && (
                  <button
                    type="button"
                    onClick={() => {
                      const prev = getPrevChapter(bibleBook, bibleChapter);
                      if (prev) {
                        setHighlightedVerse(null);
                        fetchBibleChapter(prev.book, prev.chapter);
                      }
                    }}
                    className="va-btn-glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium va-font-nunito"
                    title="Previous chapter"
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                    Previous
                  </button>
                )}
                {getNextChapter(bibleBook, bibleChapter) && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = getNextChapter(bibleBook, bibleChapter);
                      if (next) {
                        setHighlightedVerse(null);
                        fetchBibleChapter(next.book, next.chapter);
                      }
                    }}
                    className="va-btn-glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium va-font-nunito"
                    title="Next chapter"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )}
            
            <div className="space-y-6" style={{ fontSize: `${bibleVerseFontSize}px` }}>
              {(loadedChapters.length > 0 ? loadedChapters : [bibleText]).map((chData, chIdx) => (
                <div key={`${chData.book}-${chData.chapter}-${chIdx}`}>
                  <h4 className="text-lg font-bold va-heading mb-3 pt-2 border-t border-[rgba(255,255,255,0.08)] first:border-t-0 first:pt-0 flex items-center gap-2">
                    <span>{chData.book} {chData.chapter}</span>
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={() => {
                          const key = `${chData.book}:${chData.chapter}`;
                          if (bibleBookmark === key) {
                            saveBibleBookmark(null);
                          } else {
                            saveBibleBookmark(key);
                          }
                        }}
                        className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${
                          bibleBookmark === `${chData.book}:${chData.chapter}` ? 'text-[#e8a930]' : 'va-muted'
                        }`}
                        title={bibleBookmark === `${chData.book}:${chData.chapter}` ? 'Remove bookmark' : 'Bookmark this chapter'}
                        aria-label={bibleBookmark === `${chData.book}:${chData.chapter}` ? `Remove bookmark ${chData.book} ${chData.chapter}` : `Bookmark ${chData.book} ${chData.chapter}`}
                      >
                        <BookMarked
                          className="w-4 h-4"
                          strokeWidth={1.5}
                          fill={bibleBookmark === `${chData.book}:${chData.chapter}` ? 'currentColor' : 'none'}
                        />
                      </button>
                    )}
                  </h4>
                  <div className="space-y-3">
                    {chData.verses.map((v, idx) => (
                      <p
                        key={idx}
                        className={`va-scripture va-bible-verse-text text-white/95 leading-relaxed rounded-lg px-3 py-1 transition-colors ${
                          highlightedVerse === v.verse && bibleBook === chData.book && bibleChapter === chData.chapter
                            ? 'bg-[rgba(123,66,212,0.25)] border border-[rgba(166,110,232,0.4)]'
                            : ''
                        }`}
                      >
                        <span
                          className={`font-bold mr-2 va-verse-ref ${
                            highlightedVerse === v.verse && bibleBook === chData.book && bibleChapter === chData.chapter
                              ? 'text-[#f5c842]'
                              : ''
                          }`}
                        >
                          {v.verse}
                        </span>
                        {highlightFigures(v.text)}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              {isLoadingNext && (
                <div className="py-4 flex items-center justify-center gap-2 va-muted text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                  Loading...
                </div>
              )}
            </div>
          </div>
          </div>

        </>
      )}
    </div>
  );

  const PeopleView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const isPremium = userTier === 'premium' || userTier === 'church';
    if (!isPremium) {
      return (
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-3xl font-bold va-heading mb-2">Biblical People</h2>
            <p className="va-muted text-sm mb-4">Explore profiles of key figures from Scripture.</p>
          </div>
          <div className="va-premium-banner p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(166,110,232,0.2)] border-2 border-[rgba(166,110,232,0.4)] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#a66ee8]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold va-premium-banner-title mb-2">People is for Premium members</h3>
            <p className="va-muted text-sm mb-6 max-w-md mx-auto">
              Upgrade to premium to browse and search 200+ Biblical figures and read AI-generated profiles.
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="va-btn-primary px-6 py-3 rounded-xl"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      );
    }

    const openProfile = (name) => {
      setSelectedPerson(name);
      setPeopleProfile(null);
      setPeopleAnswers([]);
      setPeopleQuestionExpanded(false);
      fetchPeopleProfile(name);
    };

    const na = (v) => (v == null || v === '') ? 'Not recorded in Scripture' : v;

    const renderFamilyField = (text) => {
      if (text == null || text === '') return 'Not recorded in Scripture';
      const figures = [...BIBLICAL_FIGURES].sort((a, b) => b.length - a.length);
      const escaped = figures.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'g');
      const parts = [];
      let last = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match.index > last) parts.push(text.slice(last, match.index));
        const name = match[0];
        parts.push(
          <span key={match.index} style={{ color: '#c98d1a', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => openProfile(name)}>{name}</span>
        );
        last = match.index + match[0].length;
      }
      if (last < text.length) parts.push(text.slice(last));
      return parts.length > 0 ? parts : text;
    };

    const renderHometownField = (text) => {
      if (text == null || text === '') return 'Not recorded in Scripture';
      const places = [...BIBLICAL_PLACES].sort((a, b) => b.length - a.length);
      const escaped = places.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'g');
      const parts = [];
      let last = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match.index > last) parts.push(text.slice(last, match.index));
        const name = match[0];
        parts.push(
          <span key={match.index} style={{ color: '#a66ee8', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => {
            setPlacesReturnPerson(selectedPerson);
            setSelectedPlace(name);
            setPlacesProfile(null);
            setPlacesAnswers([]);
            setPlacesQuestionExpanded(false);
            fetchPlacesProfile(name);
            setCurrentView('places');
          }}>{name}</span>
        );
        last = match.index + match[0].length;
      }
      if (last < text.length) parts.push(text.slice(last));
      return parts.length > 0 ? parts : text;
    };

    const profile = peopleProfile && !peopleProfile.error ? peopleProfile : null;

    const filteredFigures = searchTerm.trim()
      ? BIBLICAL_FIGURES.filter(n => n.toLowerCase().includes(searchTerm.toLowerCase()))
      : BIBLICAL_FIGURES;

    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold va-heading mb-2">Biblical People</h2>
          <p className="va-muted text-sm mb-4">Search or select a name to view their profile.</p>
        </div>

        {!selectedPerson && (
          <>
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
          <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredFigures.length === 1) {
                openProfile(filteredFigures[0]);
              }
            }}
            placeholder="Search by name..."
            className="w-full px-4 py-3 rounded-xl text-white placeholder-white bg-transparent border border-white border-opacity-20"
          />
          </div>
          </div>

          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
          <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl max-h-[320px] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredFigures.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => openProfile(name)}
                className="text-left px-3 py-2 rounded-xl text-sm font-medium va-font-nunito va-btn-glass hover:border-[rgba(166,110,232,0.3)] transition-colors"
              >
                {name}
              </button>
            ))}
            </div>
          </div>
          </div>
            </>
          )}

        {selectedPerson && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setSelectedPerson(null);
                setPeopleProfile(null);
                setPeopleAnswers([]);
                setPeopleQuestionExpanded(false);
                setBibleReturnPos(null);
              }}
              className="va-btn-glass px-4 py-2 rounded-xl text-sm font-medium va-font-nunito flex items-center gap-2 hover:border-[rgba(166,110,232,0.3)] transition-colors"
            >
              ← Back to People
            </button>
            {bibleReturnPos && (
              <button
                type="button"
                onClick={() => {
                  fetchBibleChapter(bibleReturnPos.book, bibleReturnPos.chapter);
                  setBibleReturnPos(null);
                }}
                className="va-btn-glass px-4 py-2 rounded-xl text-sm font-medium va-font-nunito flex items-center gap-2 hover:border-[rgba(201,141,26,0.3)] transition-colors"
              >
                ← Return to Bible
              </button>
            )}
          </div>
        )}

        {loadingPeopleProfile && (
          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
            <div style={{ background: '#0d0a1a' }} className="p-12 rounded-xl text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#7b42d4] mx-auto mb-4" strokeWidth={1.5} />
            <p className="va-muted font-medium">Loading profile...</p>
            </div>
            </div>
        )}

        {!loadingPeopleProfile && profile && (
          <section className="space-y-4">
            {/* ROW 1 - Full width: Name */}
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <h3 className="text-2xl sm:text-3xl font-bold va-heading text-center">{profile.name || selectedPerson}</h3>
                </div>
              </div>

            {/* ROW 2 - Testament, Category */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                  <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                  <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Testament</p>
                  <p className="va-font-nunito text-white text-sm text-center">{na(profile.testament)}</p>
                  </div>
                </div>
              <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                  <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                  <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Category</p>
                  <p className="va-font-nunito text-white text-sm text-center">{na(profile.category)}</p>
                  </div>
                </div>
              </section>

            {/* ROW 3 - Hometown, Spouse */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', width: '100%' }}>
                  <div style={{ background: '#0d0a1a', borderRadius: '11px', padding: '16px', width: '100%' }}>
                  <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Hometown</p>
                  <p className="va-font-nunito text-white text-sm text-center">{renderHometownField(profile.hometown)}</p>
                  </div>
                </div>
              <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                  <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                  <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Spouse</p>
                  <p className="va-font-nunito text-white text-sm text-center">{renderFamilyField(profile.spouse)}</p>
                  </div>
                </div>
              </section>

            {/* ROW 4 - Parents, Siblings */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', width: '100%' }}>
                  <div style={{ background: '#0d0a1a', borderRadius: '11px', padding: '16px', width: '100%' }}>
                  <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Parents</p>
                  <p className="va-font-nunito text-white text-sm text-center">{renderFamilyField(profile.parents)}</p>
                  </div>
                </div>
              <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                  <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                  <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Siblings</p>
                  <p className="va-font-nunito text-white text-sm text-center">{renderFamilyField(profile.siblings)}</p>
                  </div>
                </div>
              </section>

            {/* ROW 5 - Full width individual boxes */}
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Children</p>
                <p className="va-font-nunito text-white text-sm text-center">{renderFamilyField(profile.children)}</p>
                </div>
              </div>
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Summary</p>
                <p className="va-font-nunito text-white text-sm text-center">{na(profile.summary)}</p>
                </div>
              </div>
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Story</p>
                <p className="va-font-nunito text-white text-sm text-center whitespace-pre-wrap">{na(profile.story)}</p>
                </div>
              </div>
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Interactions with God & Jesus</p>
                <p className="va-font-nunito text-white text-sm text-center">{na(profile.interactions_with_god)}</p>
                </div>
              </div>
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Key Scriptures</p>
                <div className="space-y-2 mt-1">
                  {Array.isArray(profile.key_scriptures) && profile.key_scriptures.length > 0
                    ? profile.key_scriptures.map((ref, i) => (
                        <p key={i} className="va-font-nunito text-white text-sm text-center va-scripture va-bible-verse-text pl-2 border-l-2 border-[rgba(232,169,48,0.4)]">{ref}</p>
                      ))
                    : <p className="va-font-nunito text-white text-sm text-center va-bible-verse-text">{na(null)}</p>}
                </div>
                </div>
              </div>
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Significance</p>
                <p className="va-font-nunito text-white text-sm text-center">{na(profile.significance)}</p>
                </div>
              </div>

            {/* Disclaimer - subtle box */}
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-xs text-white/50 va-font-nunito text-center">
                  All information is drawn from Scripture. Details not recorded in the Bible are noted as such.
                </p>
                </div>
              </div>

            {/* Have a question section */}
            <article style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPeopleQuestionExpanded(!peopleQuestionExpanded)}
                  className="va-btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 va-font-nunito"
                >
                  <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                  Have a question about {profile.name || selectedPerson}?
                </button>
                {peopleQuestionExpanded && (
                  <div className="mt-4 space-y-3">
                    <PeopleQuestionInput
                      onSubmit={(questionText) => submitPeopleQuestion(questionText)}
                      placeholder="Ask anything about this figure..."
                      disabled={loadingPeopleAnswer}
                    />
                    {peopleAnswers.length > 0 && (
                      <div className="space-y-4 mt-4">
                      {peopleAnswers.map((item, i) => (
                        <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                          <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                          <p className="text-sm font-semibold text-[#e8a930] mb-2 va-font-nunito">Q: {item.question}</p>
                          <p className="va-font-nunito text-white/90 text-sm whitespace-pre-wrap">{item.answer}</p>
                          </div>
                          </div>
                      ))}
                      </div>
                    )}
                  </div>
                )}
                </div>
              </article>
          </section>
        )}

        {!loadingPeopleProfile && peopleProfile && peopleProfile.error && (
          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
            <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl text-center">
            <p className="va-muted">{peopleProfile.error}</p>
            <button type="button" onClick={() => fetchPeopleProfile(selectedPerson)} className="va-btn-primary mt-4 px-4 py-2 rounded-xl">
              Try again
            </button>
            </div>
            </div>
        )}
    </div>
  );
};

  const PlacesView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const markersLayerRef = useRef(null);
    const isPremium = userTier === 'premium' || userTier === 'church';

    if (!isPremium) {
      return (
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-3xl font-bold va-heading mb-2">Biblical Places</h2>
            <p className="va-muted text-sm mb-4">Explore profiles of key locations from Scripture.</p>
          </div>
          <div className="va-premium-banner p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(166,110,232,0.2)] border-2 border-[rgba(166,110,232,0.4)] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#a66ee8]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold va-premium-banner-title mb-2">Places is for Premium members</h3>
            <p className="va-muted text-sm mb-6 max-w-md mx-auto">
              Upgrade to premium to explore 100+ Biblical locations with AI-generated profiles and interactive maps.
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="va-btn-primary px-6 py-3 rounded-xl"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      );
    }

    const openPlaceProfile = (name) => {
      setSelectedPlace(name);
      setPlacesProfile(null);
      setPlacesAnswers([]);
      setPlacesQuestionExpanded(false);
      fetchPlacesProfile(name);
    };

    const na = (v) => (v == null || v === '') ? 'Not recorded in Scripture' : v;
    const profile = placesProfile && !placesProfile.error ? placesProfile : null;

    const filteredPlaces = searchTerm.trim()
      ? BIBLICAL_PLACES.filter(n => n.toLowerCase().includes(searchTerm.toLowerCase()))
      : BIBLICAL_PLACES;

    // Initialize Leaflet map when profile loads
    useEffect(() => {
      if (!profile || !profile.coordinates || !mapRef.current) return;
      if (typeof window.L === 'undefined') return;
      const L = window.L;
      const { lat, lng } = profile.coordinates;
      if (!lat || !lng) return;
      if (!leafletMapRef.current) {
        // Create map once
        const map = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          dragging: true,
          doubleClickZoom: true,
          touchZoom: true,
        }).setView([lat, lng], 7);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors © CARTO',
          maxZoom: 18
        }).addTo(map);
        leafletMapRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
      } else {
        // Smooth transition to new place
        leafletMapRef.current.flyTo([lat, lng], 7, { animate: true, duration: 1 });
        markersLayerRef.current.clearLayers();
      }
      const markers = markersLayerRef.current;
      // Main place marker
      L.circleMarker([lat, lng], {
        radius: 10,
        color: '#a66ee8',
        fillColor: '#a66ee8',
        fillOpacity: 0.85,
        weight: 2
      }).addTo(markers)
        .bindPopup(`<b style="color:#a66ee8">${profile.name || selectedPlace}</b>`)
        .openPopup();
      // Nearby place markers
      if (Array.isArray(profile.nearby_places)) {
        profile.nearby_places.forEach(np => {
          if (!np || !np.lat || !np.lng) return;
          const cm = L.circleMarker([np.lat, np.lng], {
            radius: 6,
            color: '#c98d1a',
            fillColor: '#c98d1a',
            fillOpacity: 0.85,
            weight: 2
          }).addTo(markers);
          const npPopup = L.popup({ closeButton: true, autoClose: true })
            .setContent(`<span style="font-size:12px;color:#000;font-weight:600">${np.name}</span><br><span style="font-size:10px;color:#666">Tap again to view full profile</span>`);
          let popupOpen = false;
          npPopup.on('remove', () => { popupOpen = false; });
          npPopup.on('add', () => {
            const el = npPopup.getElement();
            if (el) {
              const content = el.querySelector('.leaflet-popup-content');
              if (content) {
                content.style.cursor = 'pointer';
                content.addEventListener('click', () => {
                  npPopup.close();
                  openPlaceProfile(np.name);
                });
              }
            }
          });
          cm.on('click', () => {
            if (!popupOpen) {
              npPopup.setLatLng([np.lat, np.lng]).openOn(leafletMapRef.current);
              popupOpen = true;
            } else {
              npPopup.close();
              openPlaceProfile(np.name);
            }
          });
        });
      }
      return () => {
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
          markersLayerRef.current = null;
        }
      };
    }, [profile]);

    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold va-heading mb-2">Biblical Places</h2>
          <p className="va-muted text-sm mb-4">Search or select a location to view its profile.</p>
        </div>

        {!selectedPlace && (
          <>
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
              <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredPlaces.length === 1) {
                      openPlaceProfile(filteredPlaces[0]);
                    }
                  }}
                  placeholder="Search Biblical places..."
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-white bg-transparent border border-white border-opacity-20"
                />
              </div>
            </div>

            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
              <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl max-h-[320px] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredPlaces.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => openPlaceProfile(name)}
                      className="text-left px-3 py-2 rounded-xl text-sm font-medium va-font-nunito va-btn-glass hover:border-[rgba(166,110,232,0.3)] transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {selectedPlace && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setSelectedPlace(null);
                setPlacesProfile(null);
                setPlacesAnswers([]);
                setPlacesQuestionExpanded(false);
                setBibleReturnPos(null);
                setPlacesReturnPerson(null);
              }}
              className="va-btn-glass px-4 py-2 rounded-xl text-sm font-medium va-font-nunito flex items-center gap-2 hover:border-[rgba(166,110,232,0.3)] transition-colors"
            >
              ← Back to Places
            </button>
            {placesReturnPerson && (
              <button
                type="button"
                onClick={() => {
                  const person = placesReturnPerson;
                  setPlacesReturnPerson(null);
                  setSelectedPerson(person);
                  setPeopleProfile(null);
                  setPeopleAnswers([]);
                  setPeopleQuestionExpanded(false);
                  fetchPeopleProfile(person);
                  setCurrentView('people');
                }}
                className="va-btn-glass px-4 py-2 rounded-xl text-sm font-medium va-font-nunito flex items-center gap-2 hover:border-[rgba(201,141,26,0.3)] transition-colors"
              >
                ← Return to {placesReturnPerson}
              </button>
            )}
            {bibleReturnPos && (
              <button
                type="button"
                onClick={() => {
                  fetchBibleChapter(bibleReturnPos.book, bibleReturnPos.chapter);
                  setBibleReturnPos(null);
                }}
                className="va-btn-glass px-4 py-2 rounded-xl text-sm font-medium va-font-nunito flex items-center gap-2 hover:border-[rgba(201,141,26,0.3)] transition-colors"
              >
                ← Return to Bible
              </button>
            )}
          </div>
        )}

        {loadingPlacesProfile && (
          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
            <div style={{ background: '#0d0a1a' }} className="p-12 rounded-xl text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#7b42d4] mx-auto mb-4" strokeWidth={1.5} />
              <p className="va-muted font-medium">Loading profile...</p>
            </div>
          </div>
        )}

        {!loadingPlacesProfile && profile && (
          <section className="space-y-4">
            {/* ROW 1 - Place Name */}
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
              <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <h3 className="text-2xl sm:text-3xl font-bold va-heading text-center">{profile.name || selectedPlace}</h3>
              </div>
            </div>

            {/* ROW 2 - Modern Name | Region */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                  <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Modern Name</p>
                  <p className="va-font-nunito text-white text-sm text-center">{na(profile.modern_name)}</p>
                </div>
              </div>
              <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                  <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Region</p>
                  <p className="va-font-nunito text-white text-sm text-center">{na(profile.region)}</p>
                </div>
              </div>
            </section>

            {/* ROW 3 - Testament | Modern Country */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                  <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Testament</p>
                  <p className="va-font-nunito text-white text-sm text-center">{na(profile.testament)}</p>
                </div>
              </div>
              <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                  <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Modern Country</p>
                  <p className="va-font-nunito text-white text-sm text-center">{na(profile.modern_country)}</p>
                </div>
              </div>
            </section>

            {/* ROW 4 - Interactive Leaflet Map */}
            {profile.coordinates && profile.coordinates.lat && profile.coordinates.lng && (
              <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                <div style={{ background: '#0d0a1a', borderRadius: '11px', overflow: 'hidden' }}>
                  <p className="text-base font-semibold text-[#e8a930] pt-4 pb-2 va-font-nunito text-center">Location Map</p>
                  <div ref={mapRef} style={{ height: '300px', width: '100%' }} />
                  <p className="text-xs text-white/40 va-font-nunito text-center py-2">
                    <span style={{ color: '#7b42d4', fontWeight: 700 }}>●</span> {profile.name || selectedPlace} &nbsp;
                    <span style={{ color: '#c98d1a', fontWeight: 700 }}>●</span> Nearby Biblical places
                  </p>
                </div>
              </div>
            )}

            {/* ROW 5 - Full width info boxes */}
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
              <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Significance</p>
                <p className="va-font-nunito text-white text-sm text-center">{na(profile.significance)}</p>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
              <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Key Events</p>
                <p className="va-font-nunito text-white text-sm text-center whitespace-pre-wrap">{na(profile.key_events)}</p>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
              <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-base font-semibold text-[#e8a930] mb-2 va-font-nunito text-center">People Associated</p>
                {Array.isArray(profile.people_associated) && profile.people_associated.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    {profile.people_associated.map((person, i) => {
                      const isKnown = BIBLICAL_FIGURES.some(f => f.toLowerCase() === person.toLowerCase());
                      return isKnown ? (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const match = BIBLICAL_FIGURES.find(f => f.toLowerCase() === person.toLowerCase());
                            if (match) {
                              setSelectedPerson(match);
                              setPeopleProfile(null);
                              setPeopleAnswers([]);
                              setPeopleQuestionExpanded(false);
                              fetchPeopleProfile(match);
                              setCurrentView('people');
                            }
                          }}
                          className="px-3 py-1 rounded-lg text-sm font-medium va-font-nunito text-[#e8a930] hover:text-[#f5c842] underline underline-offset-2 transition-colors"
                        >
                          {person}
                        </button>
                      ) : (
                        <span key={i} className="px-3 py-1 rounded-lg text-sm va-font-nunito text-white/80">{person}</span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="va-font-nunito text-white text-sm text-center">{na(null)}</p>
                )}
              </div>
            </div>

            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
              <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-base font-semibold text-[#e8a930] mb-1 va-font-nunito text-center">Interactions with God &amp; Jesus</p>
                <p className="va-font-nunito text-white text-sm text-center">{na(profile.interactions_with_god)}</p>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
              <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-base font-semibold text-[#e8a930] mb-2 va-font-nunito text-center">Key Scriptures</p>
                <div className="space-y-2 mt-1">
                  {Array.isArray(profile.key_scriptures) && profile.key_scriptures.length > 0
                    ? profile.key_scriptures.map((ref, i) => (
                        <p key={i} className="va-font-nunito text-white text-sm text-center va-bible-verse-text pl-2 border-l-2 border-[rgba(232,169,48,0.4)]">{ref}</p>
                      ))
                    : <p className="va-font-nunito text-white text-sm text-center va-bible-verse-text">{na(null)}</p>}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
              <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <p className="text-xs text-white/50 va-font-nunito text-center">
                  All information is drawn from Scripture. Details not recorded in the Bible are noted as such.
                </p>
              </div>
            </div>

            {/* Have a question section */}
            <article style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
              <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPlacesQuestionExpanded(!placesQuestionExpanded)}
                  className="va-btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 va-font-nunito"
                >
                  <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                  Have a question about {profile.name || selectedPlace}?
                </button>
                {placesQuestionExpanded && (
                  <div className="mt-4 space-y-3">
                    <PeopleQuestionInput
                      onSubmit={(questionText) => submitPlacesQuestion(questionText)}
                      placeholder="Ask anything about this place..."
                      disabled={loadingPlacesAnswer}
                    />
                    {placesAnswers.length > 0 && (
                      <div className="space-y-4 mt-4">
                        {placesAnswers.map((item, i) => (
                          <div key={i} style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                            <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
                              <p className="text-sm font-semibold text-[#e8a930] mb-2 va-font-nunito">Q: {item.question}</p>
                              <p className="va-font-nunito text-white/90 text-sm whitespace-pre-wrap">{item.answer}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          </section>
        )}

        {!loadingPlacesProfile && placesProfile && placesProfile.error && (
          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
            <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl text-center">
              <p className="va-muted">{placesProfile.error}</p>
              <button type="button" onClick={() => fetchPlacesProfile(selectedPlace)} className="va-btn-primary mt-4 px-4 py-2 rounded-xl">
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ReadingPlanView = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    const todaysPlan = readingPlan[dayOfYear - 1];

    return (
      <div className="space-y-6">
        <section style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
          <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
          <h2 className="text-3xl font-bold va-heading mb-2">Bible in a Year</h2>
          <p className="text-white/90 mb-4 va-font-nunito">Complete the entire Bible in 365 days</p>

          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="mb-4">
            <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-white/90 va-font-nunito">Progress</span>
              <span className="text-sm va-muted font-medium">
                {completedReadings.length} / {readingPlan.reduce((sum, day) => sum + day.readings.length, 0)} chapters
                {' · '}
                {getCompletedBooksCount()} / {bibleBooks.length} books
              </span>
            </div>
            <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#7b42d4] to-[#e8a930] h-3 rounded-full transition-all"
                style={{
                  width: `${(completedReadings.length / readingPlan.reduce((sum, day) => sum + day.readings.length, 0)) * 100}%`
                }}
              />
            </div>
            </div>
            </div>
          </div>
          </section>

        {(() => {
          const planToShow = selectedPlanDay != null
            ? readingPlan.find((d) => d.day === selectedPlanDay)
            : todaysPlan;
          const dayOfYearForTitle = selectedPlanDay != null ? selectedPlanDay : dayOfYear;
          const isToday = selectedPlanDay == null || selectedPlanDay === dayOfYear;
          return planToShow ? (
          <section style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
            <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold va-heading">
                Day {dayOfYearForTitle} — {isToday ? "Today's Reading" : 'Reading'}
              </h3>
              {selectedPlanDay != null && (
                <button
                  type="button"
                  onClick={() => setSelectedPlanDay(null)}
                  className="text-sm text-[#e8a930] hover:text-[#f5c842] font-medium va-font-nunito"
                >
                  Show today
                </button>
              )}
            </div>
            <div className="space-y-3">
              {planToShow.readings.map((reading, idx) => {
                const isComplete = isReadingComplete(planToShow.day, reading);
                return (
                  <article key={idx} style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
                  <div style={{ background: '#0d0a1a' }} className="p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isComplete}
                        onChange={() => toggleReadingComplete(planToShow.day, reading)}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <button
                        onClick={() => {
                          setBibleBook(reading.book);
                          setBibleChapter(reading.chapter);
                          setHighlightedVerse(null);
                          fetchBibleChapter(reading.book, reading.chapter);
                        }}
                        className={`font-bold text-left va-font-nunito ${isComplete ? 'va-muted line-through' : 'text-white/90 hover:text-[#e8a930]'}`}
                      >
                        {reading.book} {reading.chapter}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setBibleBook(reading.book);
                        setBibleChapter(reading.chapter);
                        setHighlightedVerse(null);
                        fetchBibleChapter(reading.book, reading.chapter);
                      }}
                      className="text-sm va-btn-primary px-3 py-1.5 rounded-xl va-font-nunito"
                    >
                      Read
                      </button>
                    </div>
                    </article>
                );
              })}
            </div>
            </div>
            </section>
          ) : null;
        })()}

        <section style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
          <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
          <h3 className="text-xl font-bold va-heading mb-4">All Days</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {readingPlan.map((day, idx) => {
              const dayComplete = day.readings.every(r => isReadingComplete(day.day, r));
              const firstReading = day.readings[0];
              return (
                <div
                  key={idx}
                  style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}
                  className={`cursor-pointer transition-colors va-font-nunito ${dayComplete ? 'hover:border-emerald-500/50' : 'hover:border-[rgba(166,110,232,0.25)]'}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPlanDay(day.day)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedPlanDay(day.day); } }}
                >
                  <div style={{ background: '#0d0a1a' }} className="p-3 rounded-xl">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white/90 mb-1">
                        Day {day.day} {dayComplete && '✓'}
                      </div>
                      <div className="text-sm va-muted flex flex-wrap gap-x-1 gap-y-0.5">
                        {day.readings.map((r, ri) => {
                          const complete = isReadingComplete(day.day, r);
                          return (
                            <span key={ri}>
                              {ri > 0 && ', '}
                              <span className={complete ? 'text-emerald-400/90' : ''}>
                                {r.book} {r.chapter}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {firstReading && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBibleBook(firstReading.book);
                          setBibleChapter(firstReading.chapter);
                          setHighlightedVerse(null);
                          fetchBibleChapter(firstReading.book, firstReading.chapter);
                          setCurrentView('bible');
                        }}
                        className="text-sm text-[#e8a930] hover:text-[#f5c842] font-semibold whitespace-nowrap va-font-nunito"
                      >
                        Go to chapters
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen va-app-bg va-font-nunito text-white">
      <header className="va-glass-card border-b border-[rgba(255,255,255,0.12)] sticky top-0 z-50 backdrop-blur-md rounded-none">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="w-10 h-10 va-nav-active flex-shrink-0" strokeWidth={1.5} />
              <h1 className="text-3xl font-bold va-logo-text va-font-playfair flex items-center gap-1">
                <span className="va-logo-text">VerseAid</span>
                <span className="text-white/90">✦</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <button onClick={() => setShowMenu(!showMenu)} className="md:hidden text-[#a66ee8]">
                    <Menu className="w-6 h-6" strokeWidth={1.5} />
                  </button>
                  <div className="hidden md:flex items-center gap-4">
                    {(userTier === 'premium' || userTier === 'church') && (
                      <span className="va-btn-primary text-xs px-4 py-1.5 rounded-full">
                        {userTier === 'premium' ? 'PREMIUM' : churchName.toUpperCase()}
                      </span>
                    )}
                    {userTier === 'free' && (
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="va-btn-primary text-xs px-4 py-1.5 rounded-full"
                      >
                        Upgrade 
                      </button>
                    )}
                    <span className="va-muted text-sm">Hi, <span className="text-[#e8a930] font-semibold">{username}</span></span>
<button
  onClick={() => { setShowSettingsModal(true); setSettingsError(''); setSettingsMessage(''); }}
  className="va-nav-inactive hover:text-[#a66ee8] transition-colors p-1"
  title="Settings"
>
  <Settings className="w-5 h-5" strokeWidth={1.5} />
</button>
<button onClick={handleLogout} className="text-[#e8a930] hover:text-[#f5c842] font-semibold text-sm">
  Sign Out
</button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-[#e8a930] hover:text-[#f5c842] font-semibold text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoggedIn && (
          <div className={`${showMenu ? 'block' : 'hidden'} md:block border-t border-[rgba(255,255,255,0.08)]`}>
            <div className="max-w-7xl mx-auto px-6 py-2 flex gap-2 overflow-x-auto justify-center">
              <button
                onClick={() => { setCurrentView('home'); setShowMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'home' ? 'va-btn-primary text-white' : 'va-nav-inactive hover:text-[#a66ee8]'
                }`}
              >
                <Home className="w-4 h-4" strokeWidth={1.5} />
                Home
              </button>
              <button
                onClick={() => { setCurrentView('saved'); setShowMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'saved' ? 'va-btn-primary text-white' : 'va-nav-inactive hover:text-[#a66ee8]'
                }`}
              >
                <Star className="w-4 h-4" strokeWidth={1.5} />
                Saved
              </button>
              <button
                onClick={() => { 
                  if (checkFeatureAccess('journal')) {
                    setCurrentView('journal'); 
                    setShowMenu(false);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'journal' ? 'va-btn-primary text-white' : 'va-nav-inactive hover:text-[#a66ee8]'
                }`}
              >
                <Hand className="w-4 h-4" strokeWidth={1.5} fill="none" />
                My Prayers {(userTier === 'free') && <Lock className="w-3 h-3" />}
              </button>
              <button
                onClick={() => { setCurrentView('community'); setShowMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'community' ? 'va-btn-primary text-white' : 'va-nav-inactive hover:text-[#a66ee8]'
                }`}
              >
                <Globe className="w-4 h-4" strokeWidth={1.5} />
                Prayer Wall {(userTier === 'free') && <Lock className="w-3 h-3" />}
              </button>
              <button
                onClick={() => { 
                  setCurrentView('bible'); 
                  setShowMenu(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'bible' ? 'va-btn-primary text-white' : 'va-nav-inactive hover:text-[#a66ee8]'
                }`}
              >
                <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                Bible
              </button>
              <button
                onClick={() => { 
                  if (checkFeatureAccess('reading-plan')) {
                    setCurrentView('reading-plan'); 
                    setShowMenu(false);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'reading-plan' ? 'va-btn-primary text-white' : 'va-nav-inactive hover:text-[#a66ee8]'
                }`}
              >
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                Reading Plan {(userTier === 'free') && <Lock className="w-3 h-3" />}
              </button>
              <button
                onClick={() => {
                  setCurrentView('people');
                  setShowMenu(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'people' ? 'va-btn-primary text-white' : 'va-nav-inactive hover:text-[#a66ee8]'
                }`}
              >
                <Users className="w-4 h-4" strokeWidth={1.5} />
                People {(userTier === 'free') && <Lock className="w-3 h-3" />}
              </button>
              <button
                onClick={() => {
                  setCurrentView('places');
                  setShowMenu(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all ${
                  currentView === 'places' ? 'va-btn-primary text-white' : 'va-nav-inactive hover:text-[#a66ee8]'
                }`}
              >
                <MapPin className="w-4 h-4" strokeWidth={1.5} />
                Places {(userTier === 'free') && <Lock className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
        {currentView === 'home' && HomeView()}
        {currentView === 'saved' && <SavedView />}
        {currentView === 'journal' && <JournalView />}
        {currentView === 'community' && <CommunityView />}
        {currentView === 'bible' && <BibleView />}
        {biblePopup && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setBiblePopup(null)}>
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', minWidth: '280px', maxWidth: '340px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <div style={{ background: '#0d0a1a', borderRadius: '11px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ color: '#c98d1a', fontWeight: 700, fontSize: '16px' }}>{biblePopup.name}</span>
                  <button onClick={() => setBiblePopup(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 0 0 8px' }}>✕</button>
                </div>
                {biblePopup.loading && <p style={{ color: '#888', fontSize: '13px' }}>Loading...</p>}
                {!biblePopup.loading && biblePopup.error && <p style={{ color: '#888', fontSize: '13px' }}>Could not load info.</p>}
                {!biblePopup.loading && biblePopup.data && biblePopup.type === 'figure' && (
                  <>
                    <p style={{ color: '#a66ee8', fontSize: '13px', marginBottom: '6px' }}>{biblePopup.data.category}</p>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: 1.5 }}>{biblePopup.data.summary}</p>
                  </>
                )}
                {!biblePopup.loading && biblePopup.data && biblePopup.type === 'place' && (
                  <>
                    <p style={{ color: '#a66ee8', fontSize: '13px', marginBottom: '6px' }}>{biblePopup.data.modern_name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: 1.5 }}>{biblePopup.data.significance}</p>
                  </>
                )}
                {!biblePopup.loading && biblePopup.data && (
                  <button
                    onClick={() => {
                      const name = biblePopup.name;
                      const type = biblePopup.type;
                      setBibleReturnPos({ book: bibleBook, chapter: bibleChapter });
                      setBiblePopup(null);
                      if (type === 'figure') {
                        setSelectedPerson(name);
                        setPeopleProfile(null);
                        setPeopleAnswers([]);
                        setPeopleQuestionExpanded(false);
                        fetchPeopleProfile(name);
                        setCurrentView('people');
                      } else {
                        setSelectedPlace(name);
                        setPlacesProfile(null);
                        setPlacesAnswers([]);
                        setPlacesQuestionExpanded(false);
                        fetchPlacesProfile(name);
                        setCurrentView('places');
                      }
                    }}
                    style={{ marginTop: '12px', width: '100%', padding: '8px', background: 'linear-gradient(to right, #7b42d4, #c98d1a)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                  >
                    View Full Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {currentView === 'reading-plan' && <ReadingPlanView />}
        {currentView === 'people' && <PeopleView />}
        {currentView === 'places' && <PlacesView />}
      </div>

      <button
        type="button"
        onClick={() => { setCurrentView('home'); }}
        className="va-floating-btn fixed bottom-20 right-6 z-40"
        title="Ask AI"
      >
        ✦
      </button>

      {showAuthModal && (
        <section className="va-modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50">
          <section style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="max-w-md w-full">
            <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold va-heading">
                {showForgotPassword ? 'Reset Password' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </h2>
              <button onClick={() => { setShowAuthModal(false); setShowForgotPassword(false); setResetEmailSent(false); setError(''); }} className="va-muted hover:text-white">
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            {showForgotPassword ? (
              <div className="space-y-4">
                {resetEmailSent ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 va-btn-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold va-heading mb-2">Check Your Email</h3>
                    <p className="va-muted text-sm mb-6">
                      If an account exists with <span className="text-[#e8a930]">{forgotPasswordEmail}</span>, we've sent password reset instructions to that address.
                    </p>
                    <button
                      onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); setForgotPasswordEmail(''); setAuthMode('login'); }}
                      className="w-full va-btn-primary py-3 rounded-lg"
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }}>
                    <div className="space-y-4">
                    <p className="va-muted text-sm">
                        Enter the email address associated with your account and we'll send you a link to reset your password.
                      </p>
                      <div>
                        <label htmlFor="forgot-email" className="block text-sm font-semibold text-[#e8a930] mb-1">Email Address</label>
                        <input
                          type="email"
                          id="forgot-email"
                          name="email"
                          autoComplete="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="w-full px-4 py-2 va-input rounded-lg"
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
                        className="w-full va-btn-primary py-3 rounded-lg"
                      >
                        Send Reset Link
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => { setShowForgotPassword(false); setError(''); setForgotPasswordEmail(''); }}
                          className="text-sm va-muted hover:text-white/90"
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
                  <label htmlFor="auth-email" className="block text-sm font-semibold text-[#e8a930] mb-1">Email</label>
                  <input
                   type="email"
                   id="auth-email"
                   name="email"
                   autoComplete="email"
                   value={authEmail}
                   onChange={(e) => setAuthEmail(e.target.value)}
                   className="w-full px-4 py-2 va-input rounded-lg"
                   placeholder="Enter email"
                  />

                  </div>

                  {authMode === 'signup' && (
                    <div>
                      <label htmlFor="auth-username" className="block text-sm font-semibold text-[#e8a930] mb-1">Username</label>
                      <input
                        type="text"
                        id="auth-username"
                        name="username"
                        autoComplete="username"
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        className="w-full px-4 py-2 va-input rounded-lg"
                        placeholder="Enter username"
                      />
                    </div>
                  )}

<div>
                    <label htmlFor="auth-password" className="block text-sm font-semibold text-[#e8a930] mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="auth-password"
                        name="password"
                        autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="va-input w-full px-4 py-2 rounded-lg pr-16"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                        className="text-sm text-[#e8a930] font-bold hover:text-[#f5c842]"
                      >
                        {showPassword ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                  </div>

                  {authMode === 'signup' && (
                    <div>
                      <label htmlFor="auth-confirm-password" className="block text-sm font-semibold text-[#e8a930] mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="auth-confirm-password"
                          name="confirm-password"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="va-input w-full px-4 py-2 rounded-lg"
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>
                  )}

                  {authMode === 'signup' && (
                    <div
                      className="g-recaptcha"
                      data-sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                      data-theme="dark"
                      data-callback="onRecaptchaSuccess"
                      data-expired-callback="onRecaptchaExpired"
                    />
                  )}

                  {error && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full va-btn-primary py-3 rounded-lg"
                  >
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>

                  {authMode === 'login' && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(true); setError(''); }}
                        className="text-sm text-[#e8a930] hover:text-[#f5c842]"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); setAuthEmail(''); }}
                      className="text-sm va-muted hover:text-white/90"
                    >
                      {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                  </div>

                  {authMode === 'signup' && (
                    <div className="pt-4 border-t border-[rgba(255,255,255,0.1)]">
                      <p className="text-xs va-muted text-center">
                        Free tier includes 3 questions daily, Bible reader, and community features
                      </p>
                    </div>
                  )}
                </div>
              </form>
            )}
            </div>
            </section>
          </section>
        )}

      {showUpgradeModal && (
        <section className="va-modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <section style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="relative w-full md:w-1/2 max-w-2xl my-8">
            <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full va-btn-glass z-10">
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-center va-heading">
                Choose Your <span className="va-premium-banner-title">Premium</span> Plan
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="hover:border-[rgba(166,110,232,0.4)] transition-all">
                <div style={{ background: '#0d0a1a' }} className="p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full va-btn-primary flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold va-heading">Premium</h3>
                </div>

                <div className="mb-4 p-3 va-premium-banner rounded-xl">
                  <p className="text-sm font-bold text-[#e8a930] mb-1">3-Day Free Trial</p>
                  <p className="text-xs text-white/80 leading-relaxed va-font-nunito">
                    Start your 3-day free trial today. Enter your payment information at checkout—you won't be charged until after the trial ends. Cancel anytime before the trial ends to avoid charges.
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#e8a930]">$4.99</span>
                    <span className="va-muted text-sm">per month</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#e8a930]">$49.99</span>
                    <span className="va-muted text-sm">per year</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#e8a930]">$89.99</span>
                    <span className="va-muted text-sm">lifetime (one-time)</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-5">
                  <li className="flex items-start gap-2 text-white/90 text-sm va-font-nunito">
                    <span className="text-[#e8a930]">✓</span>
                    <span><strong className="text-white">Unlimited questions</strong> daily</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/90 text-sm va-font-nunito">
                    <span className="text-[#e8a930]">✓</span>
                    <span><strong className="text-white">Community Prayer Wall</strong> access</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/90 text-sm va-font-nunito">
                    <span className="text-[#e8a930]">✓</span>
                    <span><strong className="text-white">Prayer Journal</strong> with tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/90 text-sm va-font-nunito">
                    <span className="text-[#e8a930]">✓</span>
                    <span><strong className="text-white">Bible-in-a-Year</strong> reading plan</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleStripeCheckout(STRIPE_PRICE_ID_MONTHLY, true, 'Monthly Premium')}
                  disabled={stripeLoading}
                  className="w-full va-btn-primary py-2.5 rounded-xl mb-2 text-sm disabled:opacity-60"
                >
                  {stripeLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Start 3-Day Trial - Monthly $4.99/mo'
                  )}
                </button>

                <button
                  onClick={() => handleStripeCheckout(STRIPE_PRICE_ID_ANNUAL, true, 'Annual Premium')}
                  disabled={stripeLoading}
                  className="w-full border-2 border-[#7b42d4] text-[#a66ee8] hover:bg-[#7b42d4] hover:text-white font-bold py-2.5 rounded-xl transition-all mb-2 text-sm disabled:opacity-50"
                >
                  Start 3-Day Trial - Annual $49.99/yr
                </button>

                <button
                  onClick={() => handleStripeCheckout(STRIPE_PRICE_ID_LIFETIME, false, 'Lifetime Premium')}
                  disabled={stripeLoading}
                  className="w-full border-2 border-[#7b42d4] text-[#a66ee8] hover:bg-[#7b42d4] hover:text-white font-bold py-2.5 rounded-xl transition-all text-sm disabled:opacity-50"
                >
                  Lifetime Premium - $89.99 once
                </button>

                <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.1)]">
                  <p className="text-xs va-muted text-center leading-relaxed">
                    <strong className="text-white/80">Important:</strong> Your card will be automatically charged after the 3-day trial unless you cancel before the trial ends. You can cancel your subscription anytime from the link in your Stripe email receipt or by contacting support. Lifetime purchases are one-time payments with no recurring charges.
                  </p>
                </div>
                </div>
                </div>

                <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="hover:border-[rgba(166,110,232,0.4)] transition-all">
                <div style={{ background: '#0d0a1a' }} className="p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full va-btn-primary flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold va-heading">Church</h3>
                </div>

                <div className="mb-6">
                  <span className="text-2xl font-bold text-[#e8a930]">Custom Pricing</span>
                  <p className="va-muted text-sm mt-2">For churches & ministries</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-white/90 text-sm va-font-nunito">
                    <span className="text-[#e8a930]">✓</span>
                    <span><strong className="text-white">All Premium features</strong> for unlimited members</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/90 text-sm va-font-nunito">
                    <span className="text-[#e8a930]">✓</span>
                    <span>Custom branding with church logo</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/90 text-sm va-font-nunito">
                    <span className="text-[#e8a930]">✓</span>
                    <span>Private church prayer wall</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/90 text-sm va-font-nunito">
                    <span className="text-[#e8a930]">✓</span>
                    <span>Admin dashboard & analytics</span>
                  </li>
                </ul>

                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full border-2 border-[#7b42d4] text-[#a66ee8] hover:bg-[#7b42d4] hover:text-white font-bold py-3 rounded-xl transition-all"
                >
                  Request Information
                </button>
                </div>
                </div>
              </div>
            </div>
            </section>
          </section>
      )}

{showSettingsModal && (
  <section className="va-modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="max-w-lg w-full my-8">
      <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold va-heading">Account Settings</h2>
        <button onClick={() => { setShowSettingsModal(false); setSettingsMessage(''); setSettingsError(''); }} className="va-muted hover:text-white">
          <X className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-[rgba(255,255,255,0.12)] pb-3">
        <button
          onClick={() => setSettingsTab('account')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all va-font-nunito ${settingsTab === 'account' ? 'va-btn-primary text-white' : 'va-muted hover:text-[#a66ee8]'}`}
        >
          Account
        </button>
        <button
          onClick={() => setSettingsTab('subscription')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all va-font-nunito ${settingsTab === 'subscription' ? 'va-btn-primary text-white' : 'va-muted hover:text-[#a66ee8]'}`}
        >
          Subscription
        </button>
      </div>

      {settingsMessage && (
        <div className="mb-4 bg-green-900/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
          {settingsMessage}
        </div>
      )}
      {settingsError && (
        <div className="mb-4 bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
          {settingsError}
        </div>
      )}

      {settingsTab === 'account' && (
        <div className="space-y-5">
          <div>
            <p className="text-sm va-muted mb-4">Signed in as <span className="text-[#e8a930] font-semibold">{username}</span></p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#e8a930] mb-2 va-font-nunito">Update Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
              className="w-full px-4 py-2 va-input rounded-lg"
            />
            <button
              onClick={async () => {
                setSettingsMessage('');
                setSettingsError('');
                if (!newEmail.trim()) { setSettingsError('Please enter a new email'); return; }
                if (!supabase) { setSettingsError('Account settings are not configured.'); return; }
                const { error } = await supabase.auth.updateUser({ email: newEmail });
                if (error) { setSettingsError(error.message); return; }
                await supabase.from('profiles').update({ email: newEmail }).eq('id', currentUserId);
                setSettingsMessage('Confirmation sent to your new email address. Please check your inbox.');
                setNewEmail('');
              }}
              className="mt-2 w-full va-btn-primary py-2 rounded-xl"
            >
              Update Email
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#e8a930] mb-2 va-font-nunito">Update Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="va-input w-full px-4 py-2 rounded-lg mb-2"
            />
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 va-input rounded-lg"
            />
            <button
              onClick={async () => {
                setSettingsMessage('');
                setSettingsError('');
                if (!newPassword.trim()) { setSettingsError('Please enter a new password'); return; }
                if (newPassword !== confirmNewPassword) { setSettingsError('Passwords do not match'); return; }
                if (newPassword.length < 6) { setSettingsError('Password must be at least 6 characters'); return; }
                if (!supabase) { setSettingsError('Account settings are not configured.'); return; }
                const { error } = await supabase.auth.updateUser({ password: newPassword });
                if (error) { setSettingsError(error.message); return; }
                setSettingsMessage('Password updated successfully!');
                setNewPassword('');
                setConfirmNewPassword('');
              }}
              className="mt-2 w-full va-btn-primary py-2 rounded-xl"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {settingsTab === 'subscription' && (
        <div className="space-y-5">
          <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }}>
            <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
            <p className="text-sm font-semibold va-muted mb-1">Current Plan</p>
            {userTier === 'premium' ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                <span className="text-[#e8a930] font-bold text-lg">Premium</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white/90 font-bold text-lg">Free</span>
                <button
                  onClick={() => { setShowSettingsModal(false); setShowUpgradeModal(true); }}
                  className="ml-2 va-btn-primary text-xs px-3 py-1 rounded-full"
                >
                  Upgrade ✨
                </button>
              </div>
            )}
            </div>
            </div>

          {userTier === 'premium' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-[#e8a930] mb-2 va-font-nunito">Update Payment Method</label>
                <p className="text-xs va-muted mb-3">You'll be redirected to Stripe to securely update your card information.</p>
                <button
                  onClick={() => {
                    window.open('https://billing.stripe.com/p/login/test_00g000000000000', '_blank');
                  }}
                  className="w-full va-btn-primary py-2 rounded-xl"
                >
                  Manage Payment Method
                </button>
              </div>

              <div className="pt-4 border-t border-red-500/20">
                <label className="block text-sm font-semibold text-red-400 mb-2">Cancel Subscription</label>
                <p className="text-xs va-muted mb-3">Your premium access will remain until the end of your current billing period.</p>
                <button
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to cancel your subscription? You will keep premium access until the end of your billing period.')) return;
                    if (!supabase) { setSettingsError('Not configured.'); setCancellingSubscription(false); return; }
                    setCancellingSubscription(true);
                    setSettingsError('');
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      const { data: { session } } = await supabase.auth.getSession();
                      const { data: profile } = await supabase
                        .from('profiles')
                        .select('subscription_id')
                        .eq('id', user.id)
                        .single();
                      if (!profile?.subscription_id) {
                        setSettingsError('No active subscription found. Please contact support.');
                        setCancellingSubscription(false);
                        return;
                      }
                      const response = await fetch('/api/cancel-subscription', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                        body: JSON.stringify({ subscriptionId: profile.subscription_id })
                      });
                      if (!response.ok) throw new Error('Failed to cancel');
                      setSettingsMessage('Subscription cancelled. You keep premium access until your billing period ends.');
                      setUserTier('free');
                    } catch (err) {
                      setSettingsError('Error cancelling subscription. Please contact support at contact@verseaid.ai');
                    } finally {
                      setCancellingSubscription(false);
                    }
                  }}
                  disabled={cancellingSubscription}
                  className="w-full bg-red-900/20 border border-red-500/30 text-red-400 font-bold py-2 rounded-lg hover:bg-red-900/40 transition-all disabled:opacity-50"
                >
                  {cancellingSubscription ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            </>
          )}
          <div className="pt-4 border-t border-red-500/20">
            <label className="block text-sm font-semibold text-red-400 mb-2">Delete Account</label>
            <p className="text-xs va-muted mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button
              onClick={() => { setShowDeleteConfirm(true); setSettingsError(''); }}
              className="w-full bg-red-900/20 border border-red-500/30 text-red-400 font-bold py-2 rounded-lg hover:bg-red-900/40 transition-all"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}
      </div>
      </div>
    </section>
  )}

      {showContactForm && (
        <section className="va-modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="max-w-lg w-full my-8">
            <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold va-heading">Church Edition Inquiry</h2>
                <p className="text-sm va-muted mt-1">We'll contact you within 24 hours</p>
              </div>
              <button onClick={() => setShowContactForm(false)} className="va-muted hover:text-white">
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#e8a930] mb-2 va-font-nunito">Your Name *</label>
                <input
                  type="text"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 va-input rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#e8a930] mb-2 va-font-nunito">Email Address *</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  placeholder="john@church.com"
                  className="w-full px-4 py-2 va-input rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#e8a930] mb-2 va-font-nunito">Church/Ministry Name</label>
                <input
                  type="text"
                  value={contactInfo.churchName}
                  onChange={(e) => setContactInfo({...contactInfo, churchName: e.target.value})}
                  placeholder="Grace Community Church"
                  className="w-full px-4 py-2 va-input rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#e8a930] mb-2 va-font-nunito">Message (Optional)</label>
                <textarea
                  value={contactInfo.message}
                  onChange={(e) => setContactInfo({...contactInfo, message: e.target.value})}
                  placeholder="Tell us about your church..."
                  className="va-input w-full px-4 py-3 rounded-lg resize-none"
                  rows="3"
                  maxLength={1000}
                />
              </div>

              <button
                onClick={submitContactForm}
                className="w-full va-btn-primary py-3 rounded-lg"
              >
                Submit Request
              </button>
            </div>
            </div>
            </div>
          </section>
      )}

      {showDeleteConfirm && (
        <div className="va-modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50">
          <article style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="max-w-md w-full shadow-xl">
            <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
              <h3 className="text-xl font-bold va-heading mb-2">Delete Account</h3>
              <p className="va-muted text-sm leading-relaxed mb-6">
                Are you sure you want to permanently delete your account? This cannot be undone and all your data will be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 va-btn-glass font-bold rounded-xl py-3"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowDeleteConfirm(false);
                    if (!supabase) { setSettingsError('Not configured.'); return; }
                    setSettingsError('');
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      const { data: { session } } = await supabase.auth.getSession();
                      const response = await fetch('/api/delete-account', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                        body: JSON.stringify({ userId: user.id })
                      });
                      if (!response.ok) throw new Error('Failed to delete account');
                      try { await supabase.auth.signOut(); } catch (_) {}
                      setCurrentUserId(null);
                      setIsLoggedIn(false);
                      setUsername('');
                      setUserTier('free');
                      setShowSettingsModal(false);
                      setCurrentView('home');
                    } catch (err) {
                      console.error('Delete account error:', err.message);
                      setSettingsError('Error deleting account. Please contact support at contact@verseaid.ai');
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl border border-red-500/50 hover:shadow-lg hover:shadow-red-500/20 transition-all"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </article>
        </div>
      )}

{showPrayerModal && (
        <section className="va-modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50">
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="max-w-md w-full">
            <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold va-heading mb-4">Add Prayer Request</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#e8a930] mb-2 va-font-nunito">Category</label>
              <select
                value={prayerCategory}
                onChange={(e) => setPrayerCategory(e.target.value)}
                className="va-input w-full px-4 py-2 rounded-xl"
              >
                <option value="">Select a category (optional)</option>
                {prayerCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <textarea
              value={newPrayerEntry}
              onChange={(e) => setNewPrayerEntry(e.target.value)}
              placeholder="What would you like to pray about?"
              className="va-input w-full px-4 py-3 rounded-xl mb-4 resize-none"
              rows="4"
              autoComplete="off"
              maxLength={1000}
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            
            <div style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="mb-4">
              <div style={{ background: '#0d0a1a' }} className="p-4 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareToCommunity}
                  onChange={(e) => setShareToCommunity(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-bold text-[#e8a930] va-font-nunito">Share to Community</p>
                  <p className="text-xs va-muted mt-1">
                    Let others pray for your request. All prayers are anonymous.
                  </p>
                </div>
              </label>
              </div>
              </div>
            
            <div className="flex gap-3">
              <button
                onClick={addPrayerEntry}
                className="flex-1 va-btn-primary py-2 rounded-xl"
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
                className="flex-1 va-btn-glass font-bold py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>
            </div>
            </div>
          </section>
      )}

      {deletePrayerConfirmId !== null && (
        <div className="va-modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50">
            <article style={{ background: 'linear-gradient(to right, #7b42d4, #c98d1a)', padding: '1px', borderRadius: '12px', boxShadow: '0 0 0 1px #7b42d4', outline: '1px solid #c98d1a' }} className="max-w-md w-full shadow-xl">
            <div style={{ background: '#0d0a1a' }} className="p-6 rounded-xl">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold va-heading mb-1">Remove from community wall?</h3>
                <p className="va-muted text-sm leading-relaxed">
                  This prayer is on the community wall. Removing it will delete it from the wall too. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeletePrayerConfirmId(null)}
                className="flex-1 va-btn-glass font-bold rounded-xl py-3"
              >
                Cancel
              </button>
              <button
                onClick={() => performDeletePrayerEntry(deletePrayerConfirmId)}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl border border-red-500/50 hover:shadow-lg hover:shadow-red-500/20 transition-all"
              >
                Delete
              </button>
            </div>
            </div>
            </article>
          </div>
        )}

<footer className="border-t border-[rgba(255,255,255,0.1)] py-12 mt-20">
  <div className="max-w-7xl mx-auto px-6 text-center">
    <p className="va-muted text-sm mb-3">© 2025 VerseAid - Premium Biblical guidance powered by AI</p>
    <div className="flex justify-center gap-4 text-sm">
      <a href="/privacy-policy.html" className="text-[#e8a930] hover:text-[#f5c842]">Privacy Policy</a>
      <span className="va-muted">•</span>
      <a href="/terms-of-service.html" className="text-[#e8a930] hover:text-[#f5c842]">Terms of Service</a>
      <span className="va-muted">•</span>
      <a href="mailto:verseaid.ai@gmail.com" className="text-[#e8a930] hover:text-[#f5c842]">Contact</a>
    </div>
  </div>
</footer>
</div>
  );
}
