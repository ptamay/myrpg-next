import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  
  if (role !== 'gm' && role !== 'player') {
    return NextResponse.json({ error: "Role inválido. Use ?role=gm ou ?role=player" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Você precisa estar logado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', user.id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, newRole: role, userEmail: user.email, message: `Papel atualizado para ${role} com sucesso!` });
}
