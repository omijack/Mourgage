'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type DocKey = 'vida_laboral' | 'dni' | 'movimientos_bancarios' | 'renta';

const REQUIRED: { key: DocKey; label: string; hint?: string }[] = [
  { key: 'vida_laboral', label: 'Vida laboral' },
  { key: 'dni', label: 'DNI' },
  { key: 'movimientos_bancarios', label: 'Movimientos bancarios' },
  { key: 'renta', label: 'Renta' },
];

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  const [activeKey, setActiveKey] = useState<DocKey | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState<Record<DocKey, boolean>>({
    vida_laboral: false,
    dni: false,
    movimientos_bancarios: false,
    renta: false,
  });

  // Per forçar reset visual del <input type="file" />
  const [inputKey, setInputKey] = useState(0);

  const storagePrefix = useMemo(() => (userId ? `${userId}` : ''), [userId]);
  const lsKey = useMemo(() => (userId ? `upload_completed_${userId}` : ''), [userId]);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus('❌ No estàs loguejat');
        return;
      }

      setUserId(user.id);

      // 1) Recupera estat local (fallback)
      try {
        const raw = localStorage.getItem(`upload_completed_${user.id}`);
        if (raw) setCompleted((prev) => ({ ...prev, ...(JSON.parse(raw) as any) }));
      } catch {
        // ignore
      }

      // 2) Recalcula estat mirant Storage (carpetes per docKey)
      //    Si hi ha com a mínim 1 fitxer a userId/<docKey>/ -> complet
      const next: Record<DocKey, boolean> = {
        vida_laboral: false,
        dni: false,
        movimientos_bancarios: false,
        renta: false,
      };

      for (const doc of REQUIRED) {
        const { data, error } = await supabase.storage
          .from('documents')
          .list(`${user.id}/${doc.key}`, { limit: 1 });

        if (!error && data && data.length > 0) next[doc.key] = true;
      }

      setCompleted((prev) => ({ ...prev, ...next }));
      try {
        localStorage.setItem(`upload_completed_${user.id}`, JSON.stringify({ ...completed, ...next }));
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lsKey) return;
    try {
      localStorage.setItem(lsKey, JSON.stringify(completed));
    } catch {
      // ignore
    }
  }, [completed, lsKey]);

  const openPickerFor = (key: DocKey) => {
    setStatus('');
    setFile(null);
    setActiveKey(key);
    setInputKey((k) => k + 1);
    // Obrim el selector de fitxer
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleUpload = async () => {
    if (!userId) return setStatus('❌ No estàs loguejat');
    if (!activeKey) return setStatus('❌ Selecciona un tipus de document');
    if (!file) return setStatus('❌ No has seleccionat cap fitxer');

    setBusy(true);
    setStatus('⏳ Pujant fitxer...');

    const filePath = `${userId}/${activeKey}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);

    if (uploadError) {
      setBusy(false);
      setStatus(`❌ Error al pujar: ${uploadError.message}`);
      return;
    }

    // URL signada (1h)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60 * 60);

    if (signedError || !signedData) {
      setBusy(false);
      setStatus('❌ Error al generar l’enllaç segur');
      return;
    }

    // Guardem info a la taula documents (sense canviar esquema)
    const { error: insertError } = await supabase.from('documents').insert({
      user_id: userId,
      name: file.name,
      type: file.type,
      url: signedData.signedUrl,
    });

    if (insertError) {
      setBusy(false);
      setStatus(`❌ Error al guardar al DB: ${insertError.message}`);
      return;
    }

    setCompleted((prev) => ({ ...prev, [activeKey]: true }));
    setStatus(`✅ ${REQUIRED.find((r) => r.key === activeKey)?.label} pujat correctament!`);

    // Reset UI
    setFile(null);
    setActiveKey(null);
    setInputKey((k) => k + 1);
    setBusy(false);
  };

  const total = REQUIRED.length;
  const done = REQUIRED.filter((r) => completed[r.key]).length;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-1">Documents</h2>
        <p className="text-sm text-gray-600 mb-4">
          Progrés: <span className="font-semibold">{done}</span> / {total}
        </p>

        <ul className="space-y-2 mb-4">
          {REQUIRED.map((doc) => {
            const isDone = completed[doc.key];
            const isActive = activeKey === doc.key;

            return (
              <li key={doc.key}>
                <button
                  type="button"
                  onClick={() => openPickerFor(doc.key)}
                  className={[
                    'w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left',
                    isDone ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50',
                    isActive ? 'ring-2 ring-primary' : '',
                  ].join(' ')}
                >
                  <div>
                    <div className="font-medium">{doc.label}</div>
                    <div className="text-xs text-gray-500">
                      {isDone ? 'Complet' : 'Pendent — clica per pujar'}
                    </div>
                  </div>
                  <div className="text-lg" aria-hidden>
                    {isDone ? '✅' : '⬆️'}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Input ocult: s’activa quan cliques un ítem */}
        <input
          key={inputKey}
          ref={fileInputRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />

        {file && activeKey && (
          <div className="mb-4 rounded-lg border border-gray-200 p-3">
            <div className="text-sm">
              <span className="font-semibold">Seleccionat:</span> {file.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Tipus: {REQUIRED.find((r) => r.key === activeKey)?.label}
            </div>

            <button
              onClick={handleUpload}
              disabled={busy}
              className="mt-3 bg-primary text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? 'Pujant...' : 'Pujar fitxer'}
            </button>
          </div>
        )}

        {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
      </div>
    </div>
  );
}
