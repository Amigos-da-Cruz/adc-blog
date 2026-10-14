import { useEffect, useRef, useState } from 'react';
import { CommentSection, type ReaderComment } from '@amigos-da-cruz/adc-design-system';

interface TurnstileApi {
  render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; 'expired-callback': () => void }) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window { turnstile?: TurnstileApi }
}

export function CommentsApp({ slug, siteKey }: { slug: string; siteKey: string }) {
  const [comments, setComments] = useState<ReaderComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const challengeElement = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const token = useRef('');

  async function load() {
    const response = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
    if (!response.ok) throw new Error('Não foi possível carregar os comentários');
    const data = await response.json() as { comments: ReaderComment[] };
    setComments(data.comments);
  }

  useEffect(() => {
    load().catch(() => setError('Não foi possível carregar os comentários.')).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!challengeElement.current) return;
    let cancelled = false;
    function render() {
      if (cancelled || !window.turnstile || !challengeElement.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(challengeElement.current, {
        sitekey: siteKey,
        callback: (value) => { token.current = value; setError(''); },
        'expired-callback': () => { token.current = ''; },
      });
    }
    if (window.turnstile) render();
    else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey, loading]);

  async function submit(name: string, message: string, parentId: string | null) {
    if (!token.current) {
      setError('Conclui a proteção anti spam antes de publicar.');
      throw new Error('Turnstile pendente');
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name, message, parentId, turnstileToken: token.current, website: '' }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Não foi possível publicar.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível publicar.');
      throw cause;
    } finally {
      token.current = '';
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
      setSubmitting(false);
    }
  }

  if (loading) return <p className="article-comments__intro">A carregar comentários…</p>;
  return <CommentSection comments={comments} onSubmit={submit} submitting={submitting} error={error} challenge={<div ref={challengeElement} />} />;
}
