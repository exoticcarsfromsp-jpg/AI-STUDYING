// FORJA · Edge Function "ai": coach IA y análisis de fotos de comida.
// Reenvía la conversación a la API de Claude con la clave guardada como secreto ANTHROPIC_API_KEY.
// Límite: 40 peticiones por usuario y día (tabla en memoria por instancia; suficiente para uso normal).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-haiku-5-5";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const uso = new Map<string, { d: string; n: number }>();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const quien = auth.slice(-24) || "anon";
    const hoy = new Date().toISOString().slice(0, 10);
    const u = uso.get(quien);
    if (u && u.d === hoy && u.n >= 40) return json({ error: "limit" }, 429);
    uso.set(quien, { d: hoy, n: u && u.d === hoy ? u.n + 1 : 1 });

    const { messages, tools, max_tokens } = await req.json();
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "", "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: Math.min(max_tokens ?? 1200, 2000), messages, tools }),
    });
    const data = await r.json();
    return json(data, r.ok ? 200 : r.status);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
