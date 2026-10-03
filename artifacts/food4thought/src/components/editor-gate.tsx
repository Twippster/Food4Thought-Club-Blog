import { type FormEvent, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ArrowUpRight, Lock } from 'lucide-react';

const EDITOR_PASSWORD = import.meta.env.VITE_EDITOR_PASSWORD || 'food4thought';
const STORAGE_KEY = 'f4t-editor-auth';

export function useEditorAuth() {
  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'granted';
    } catch {
      return false;
    }
  });

  const unlock = (password: string): boolean => {
    if (password === EDITOR_PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, 'granted');
      } catch {
        /* sessionStorage unavailable — keep session-only state */
      }
      setAuthed(true);
      return true;
    }
    return false;
  };

  return { authed, unlock };
}

export function EditorLockScreen({ onUnlock }: { onUnlock: (password: string) => boolean }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onUnlock(password)) setError(true);
  };

  return (
    <div className="editor-gate">
      <div className="editor-gate-card">
        <div className="editor-gate-icon"><Lock size={28} /></div>
        <div className="eyebrow editor-accent">Publishing desk</div>
        <h1 className="display">Editor access</h1>
        <p>Enter the password to reach the publishing desk.</p>
        <form className="editor-gate-form" onSubmit={submit}>
          <input
            type="password"
            aria-label="Editor password"
            placeholder="Password"
            autoFocus
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
          />
          {error && <span className="editor-gate-error">Wrong password. Try again.</span>}
          <button className="editor-primary-button" type="submit">Unlock <ArrowUpRight size={15} /></button>
        </form>
        <Link href="/" className="editor-gate-back"><ArrowLeft size={14} /> Back to publication</Link>
      </div>
    </div>
  );
}
