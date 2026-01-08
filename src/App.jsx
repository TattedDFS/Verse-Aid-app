import React, { useState, useEffect } from 'react';
import { BookOpen, Send, Loader2, Heart, User, Calendar, Share2, Star, BookMarked, Plus, X, Menu, Home, Crown, Users } from 'lucide-react';

export default function VerseAidApp() {
  // State Management
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // User & Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [userTier, setUserTier] = useState('free');
  const [questionsToday, setQuestionsToday] = useState(0);
  const [lastQuestionDate, setLastQuestionDate] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [stripeLoading, setStripeLoading] = useState(false);
  
  // Church Contact Form
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    churchName: '',
    message: ''
  });
  
  // Navigation
  const [currentView, setCurrentView] = useState('home');
  const [showMenu, setShowMenu] = useState(false);
  
  // Stripe Config
  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SmIS3BrYJWG1fHoknt8tWaPGaKTxxOI9YRkXgce6fjHzZfQam3MiRAGxW0dwkhkoNT1xXVGPEeYFuvz1SqY7HB200waXtmSzp';
  const STRIPE_PRICE_ID_MONTHLY = 'price_1SmKbEBrYJWG1fHopEY2owKh';
  const STRIPE_PRICE_ID_ANNUAL = 'price_1SmKtCPn2XQV6iQ8qA0vBosD';

  const exampleQuestions = [
    "I'm feeling anxious about my future. What does the Bible say?",
    "How do I forgive someone who hurt me deeply?",
    "I'm struggling with loneliness. Where can I find comfort?",
    "How should I handle conflict with a family member?"
  ];

  // Auth Functions
  const handleAuth = () => {
    if (!authUsername.trim() || !authPassword.trim()) {
      setError('Please enter username and password');
      return;
    }
    setUsername(authUsername);
    setIsLoggedIn(true);
    setShowAuthModal(false);
    setAuthUsername('');
    setAuthPassword('');
    setError('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserTier('free');
    setQuestionsToday(0);
    setCurrentView('home');
  };

  // Daily Limit Check
  const checkDailyLimit = () => {
    const today = new Date().toDateString();
    if (lastQuestionDate !== today) {
      setQuestionsToday(0);
      setLastQuestionDate(today);
      return true;
    }
    if (userTier === 'premium' || userTier === 'church') {
      return true;
    }
    if (questionsToday >= 3) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  // Submit Question
  const handleSubmit = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    if (!checkDailyLimit()) {
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
            content: `You are a compassionate spiritual guide. Answer this: "${question}"
            
            Provide: 1) compassionate response, 2) 2-3 Bible verses (NLT), 3) WWJD guidance, 4) encouragement
            
            Format as JSON: {"compassionateResponse": "", "verses": [{"reference": "", "text": ""}], "wwjd": "", "encouragement": ""}`
          }]
        })
      });

      const data = await apiResponse.json();
      
      if (data.content && data.content[0]) {
        let text = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(text);
        setResponse({ ...parsed, question, timestamp: new Date().toISOString() });
        setQuestionsToday(questionsToday + 1);
      } else {
        setError('Unable to get a response. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Stripe Checkout
  const handleStripeCheckout = async () => {
    setStripeLoading(true);
    try {
      const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
      const priceId = selectedPlan === 'annual' ? STRIPE_PRICE_ID_ANNUAL : STRIPE_PRICE_ID_MONTHLY;
      
      await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}?payment=success&plan=${selectedPlan}`,
        cancelUrl: `${window.location.origin}?payment=cancel`,
        customerEmail: username + '@example.com',
        clientReferenceId: username
      });
    } catch (err) {
      alert('Unable to process payment. Please try again.');
    } finally {
      setStripeLoading(false);
    }
  };

  // Free Trial Activation
  const upgradeToPremium = () => {
    setUserTier('premium');
    setShowUpgradeModal(false);
    alert('Premium activated! You now have unlimited questions and advanced features.');
  };

  // Church Contact Form Submit
  const submitContactForm = async () => {
    if (!contactInfo.name || !contactInfo.email) {
      alert('Please fill in your name and email');
      return;
    }
    
    try {
      await window.storage.set(
        `contact_request_${Date.now()}`,
        JSON.stringify({
          ...contactInfo,
          timestamp: new Date().toISOString()
        }),
        true
      );
      
      alert('Thank you! We will contact you within 24 hours to discuss the Church Edition.');
      setShowContactForm(false);
      setShowUpgradeModal(false);
      setContactInfo({
        name: '',
        email: '',
        phone: '',
        churchName: '',
        message: ''
      });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      alert('There was an error. Please email us directly at contact@verseaid.ai');
    }
  };

  // Check for payment success on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      setUserTier('premium');
      alert('🎉 Payment successful! Welcome to Premium!');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'cancel') {
      alert('Payment cancelled. Your subscription was not activated.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <script src="https://js.stripe.com/v3/"></script>
      
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-800">VerseAid.ai</h1>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {userTier === 'premium' && (
                  <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                )}
                <span className="text-sm text-gray-600">Hi, {username}!</span>
                {userTier === 'free' && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-lg hover:from-purple-700 hover:to-blue-700"
                  >
                    Upgrade ✨
                  </button>
                )}
                <button onClick={handleLogout} className="text-sm text-purple-600 hover:text-purple-700">
                  Logout
                </button>
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
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          {/* Usage Counter */}
          {isLoggedIn && userTier === 'free' && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Daily Questions: {questionsToday}/3 used
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Resets daily. Upgrade for unlimited questions!
                  </p>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
                >
                  Upgrade ✨
                </button>
              </div>
            </div>
          )}

          {isLoggedIn && (userTier === 'premium' || userTier === 'church') && (
            <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600 fill-current" />
                <p className="text-sm font-medium text-gray-700">
                  Premium Member - Unlimited Questions
                </p>
              </div>
            </div>
          )}

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

        {/* Response Display */}
        {response && (
          <div className="space-y-6">
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
                        <p className="text-sm font-semibold text-purple-700">— {verse.reference}</p>
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

      {/* Upgrade Modal with Church Edition */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upgrade Your Experience</h2>
              <button onClick={() => setShowUpgradeModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Premium Plan */}
              <div className="border-2 border-purple-200 rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-8 h-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-800">Premium</h3>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => setSelectedPlan('monthly')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        selectedPlan === 'monthly'
                          ? 'bg-purple-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">$4.99</div>
                        <div className="text-sm">per month</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setSelectedPlan('annual')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
                        selectedPlan === 'annual'
                          ? 'bg-purple-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        SAVE 17%
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">$49.99</div>
                        <div className="text-sm">per year</div>
                        <div className="text-xs opacity-75">($4.17/month)</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700"><strong>Unlimited questions</strong> daily</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700"><strong>Community Prayer Wall</strong> access</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700"><strong>Prayer Journal</strong> with tracking</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700"><strong>Bible-in-a-Year</strong> reading plan</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">Priority AI responses</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">Advanced study tools (coming soon)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">Audio Bible (coming soon)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">Multiple translations (coming soon)</p>
                  </div>
                </div>

                <button
                  onClick={handleStripeCheckout}
                  disabled={stripeLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white font-semibold py-4 rounded-lg transition-all flex items-center justify-center gap-2 mb-2 text-lg"
                >
                  {stripeLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      💳 Subscribe Now - {selectedPlan === 'monthly' ? '$4.99/month' : '$49.99/year'}
                    </>
                  )}
                </button>
                
                <button
                  onClick={upgradeToPremium}
                  className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-3 rounded-lg transition-all mb-2"
                >
                  🎁 Activate 7-Day Free Trial
                </button>
                
                <p className="text-xs text-center text-gray-500">
                  Cancel anytime • No commitment
                </p>
              </div>

              {/* Church Plan */}
              <div className="border-2 border-green-200 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-teal-50">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                  <h3 className="text-2xl font-bold text-gray-800">Church Edition</h3>
                </div>
                
                <div className="mb-6">
                  <p className="text-lg text-gray-700 font-medium mb-2">For Churches & Ministries</p>
                  <p className="text-sm text-gray-600">
                    Equip your entire congregation with premium Biblical guidance tools, custom branding, and powerful engagement features.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700"><strong>All Premium features</strong> for unlimited members</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">Custom branding with church logo & colors</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">Private church prayer wall</p>
                  </div>
                  <div className="flex items-start gap-2">
<div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">Admin dashboard with engagement analytics</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">Pastor devotional & sermon integration</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">Small group discussion tools</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">Priority support & onboarding</p>
                  </div>
                </div>
                <button
              onClick={() => setShowContactForm(true)}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-4 rounded-lg transition-all text-lg mb-3"
            >
              Request Information
            </button>
            
            <p className="text-xs text-center text-gray-600">
              We'll contact you within 24 hours to discuss custom pricing for your ministry
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Questions? Email us at <a href="mailto:support@verseaid.ai" className="text-purple-600 hover:underline">support@verseaid.ai</a>
          </p>
        </div>
      </div>
    </div>
  )}

  {/* Church Contact Form Modal */}
  {showContactForm && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Church Edition Inquiry</h2>
            <p className="text-sm text-gray-600 mt-1">We'll contact you within 24 hours</p>
          </div>
          <button onClick={() => setShowContactForm(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
            <input
              type="text"
              value={contactInfo.name}
              onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
              placeholder="John Smith"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
              placeholder="john@church.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Church/Ministry Name</label>
            <input
              type="text"
              value={contactInfo.churchName}
              onChange={(e) => setContactInfo({...contactInfo, churchName: e.target.value})}
              placeholder="Grace Community Church"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
            <textarea
              value={contactInfo.message}
              onChange={(e) => setContactInfo({...contactInfo, message: e.target.value})}
              placeholder="Tell us about your church and how you'd like to use this app..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
              rows="3"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={submitContactForm}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all mb-2"
            >
              Submit Request
            </button>
            <button
              onClick={() => setShowContactForm(false)}
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center pt-2">
            By submitting, you agree to be contacted about the Church Edition. We respect your privacy and will not share your information.
          </p>
        </div>
      </div>
    </div>
  )}

  {/* Footer */}
  <div className="text-center py-8 text-sm text-gray-500">
    <p>© 2025 VerseAid.ai - Biblical guidance powered by AI</p>
  </div>
</div>
);
}
