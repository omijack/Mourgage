import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, nom, telefon } = body;

  // Validació bàsica
  if (!email || !password || !nom || !telefon) {
    return NextResponse.json(
      { error: 'Tots els camps són obligatoris.' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: 'La contrasenya ha de tenir almenys 6 caràcters.' },
      { status: 400 }
    );
  }

  // Comprovem si l'usuari ja existeix
  const { data: userExists, error: checkError } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .maybeSingle();

  if (checkError) {
    return NextResponse.json(
      { error: 'Error consultant la base de dades.' },
      { status: 500 }
    );
  }

  if (userExists) {
    return NextResponse.json(
      { error: 'Aquest correu electrònic ja està registrat.' },
      { status: 409 }
    );
  }

  // Crear usuari
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nom,
        telefon,
      },
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: 'Usuari creat correctament', user: data.user },
    { status: 200 }
  );
}
