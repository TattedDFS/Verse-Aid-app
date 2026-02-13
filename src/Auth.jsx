import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignUp = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: username }
      }
    })

    if (error) {
      setMessage(error.message)
    } else {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: username,
        subscription_tier: 'free'
      })
      setMessage('Account created! Please check your email to confirm.')
    }
    setLoading(false)
  }

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Playfair Display, serif'
    }}>
      <div style={{
        background: '#111',
        border: '1px solid #C9A84C',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{
          color: '#C9A84C',
          textAlign: 'center',
          marginBottom: '8px',
          fontSize: '28px'
        }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: '#888', textAlign: 'center', marginBottom: '32px' }}>
          {isLogin ? 'Sign in to VerseAid.ai' : 'Join VerseAid.ai today'}
        </p>

        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={inputStyle}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={isLogin ? handleLogin : handleSignUp}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>

        {message && (
          <p style={{ color: '#C9A84C', textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
            {message}
          </p>
        )}

        <p style={{ color: '#888', textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => { setIsLogin(!isLogin); setMessage('') }}
            style={{ color: '#C9A84C', cursor: 'pointer' }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  marginBottom: '16px',
  background: '#1a1a1a',
  border: '1px solid #C9A84C',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  boxSizing: 'border-box'
}

const buttonStyle = {
  width: '100%',
  padding: '14px',
  background: 'linear-gradient(135deg, #C9A84C, #f0d080)',
  border: 'none',
  borderRadius: '8px',
  color: '#000',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '8px'
}
