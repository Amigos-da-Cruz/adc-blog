import { useState, type FormEvent } from 'react';
import type { ReaderComment } from '@amigos-da-cruz/adc-design-system';

type AdminComment = ReaderComment & { articleSlug: string; articleTitle: string };

export function CommentsAdmin() {
  const [accessToken, setAccessToken] = useState('');
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  async function load(token = accessToken) {
    const response = await fetch('/api/comments?admin=1', { headers: { 'X-Comments-Admin-Token': token } });
    const data = await response.json() as { comments?: AdminComment[]; error?: string };
    if (!response.ok) throw new Error(data.error || 'Não foi possível carregar os comentários');
    setComments(data.comments || []);
    setUnlocked(true);
  }

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try { await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Acesso negado'); }
    finally { setBusy(false); }
  }

  async function reply(comment: AdminComment) {
    const message = drafts[comment.id]?.trim() || '';
    if (message.length < 3) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Comments-Admin-Token': accessToken },
        body: JSON.stringify({ slug: comment.articleSlug, name: 'Amigos da Cruz', message, parentId: comment.id }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Não foi possível responder');
      setDrafts((current) => ({ ...current, [comment.id]: '' }));
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível responder'); }
    finally { setBusy(false); }
  }

  async function hide(comment: AdminComment) {
    if (!window.confirm('Ocultar este comentário e apagar o seu conteúdo?')) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/comments/${comment.id}`, { method: 'DELETE', headers: { 'X-Comments-Admin-Token': accessToken } });
      if (!response.ok) throw new Error('Não foi possível ocultar');
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível ocultar'); }
    finally { setBusy(false); }
  }

  return (
    <div className="comments-admin">
      {!unlocked ? (
        <form onSubmit={unlock}>
          <label htmlFor="comments-access">Chave de acesso da equipa</label>
          <input id="comments-access" type="password" value={accessToken} onChange={(event) => setAccessToken(event.target.value)} autoComplete="off" required />
          <button className="adc-btn adc-btn--primary" disabled={busy}>Entrar</button>
        </form>
      ) : (
        <>
          <p>Últimos 100 comentários. A chave fica apenas nesta página até a fechares.</p>
          <button className="adc-btn adc-btn--secondary" type="button" onClick={() => load().catch(() => setError('Não foi possível atualizar'))}>Atualizar</button>
          <ol>
            {comments.map((comment) => (
              <li key={comment.id}>
                <p><a href={`/artigos/${comment.articleSlug}#comentarios`}>{comment.articleTitle}</a> · {new Date(comment.createdAt).toLocaleString('pt-PT')}</p>
                <strong>{comment.status === 'hidden' ? 'Comentário oculto' : comment.name}{comment.authorRole === 'editor' ? ' · Equipa ADC' : ''}</strong>
                <p>{comment.status === 'hidden' ? 'Conteúdo removido.' : comment.message}</p>
                {comment.status !== 'hidden' && (
                  <>
                    <label htmlFor={`reply-${comment.id}`}>Responder</label>
                    <textarea id={`reply-${comment.id}`} value={drafts[comment.id] || ''} onChange={(event) => setDrafts((current) => ({ ...current, [comment.id]: event.target.value }))} maxLength={2000} rows={3} />
                    <div className="comments-admin__actions">
                      <button className="adc-btn adc-btn--primary" type="button" disabled={busy || (drafts[comment.id]?.trim().length || 0) < 3} onClick={() => reply(comment)}>Publicar resposta</button>
                      <button className="adc-btn adc-btn--text" type="button" disabled={busy} onClick={() => hide(comment)}>Ocultar comentário</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
