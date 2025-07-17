'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) return setStatus('❌ No has seleccionat cap fitxer');

    setStatus('⏳ Pujant fitxer...');

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setStatus('❌ No estàs loguejat');
      return;
    }

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      setStatus(`❌ Error al pujar: ${uploadError.message}`);
      return;
    }

    // Generem URL signada (privada, 1 hora de validesa)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60 * 120); // 2 hores

    if (signedError || !signedData) {
      setStatus('❌ Error al generar l’enllaç segur');
      return;
    }

    // Guardem la info a la taula documents
    const { error: insertError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: file.name,
        type: file.type,
        url: signedData.signedUrl,
      });

    if (insertError) {
      setStatus(`❌ Error al guardar al DB: ${insertError.message}`);
      return;
    }

    setStatus('✅ Fitxer pujat i registrat correctament!');
    setFile(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Pujar document</h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Pujar fitxer
        </button>

        {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
      </div>
    </div>
  );
}
