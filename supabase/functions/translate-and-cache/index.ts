import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Supabase client using anon key (RLS allows public read/insert/update on translations)
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

async function callGeminiTranslate(text: string, context?: string, source_lang = "en", target_lang = "mr") {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = `You are a professional Marathi translator for real estate listings.\n\nGuidelines:\n- Translate from ${source_lang} to ${target_lang} (Marathi).\n- Preserve numbers, units (sq ft, BHK), addresses and proper nouns.\n- Keep short, natural, buyer-friendly tone.\n- Do NOT hallucinate or add details.\n- Keep line breaks and basic punctuation.\n- Context: ${context || "general"}.\n\nText:\n${text}`;

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const candidates = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidates || typeof candidates !== "string") {
    throw new Error("Unexpected Gemini response structure");
  }
  return candidates.trim();
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, source_lang = "en", target_lang = "mr", context = null } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'text' string" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return new Response(JSON.stringify({ translated: "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Try cache
    const { data: cached, error: cacheErr } = await supabase
      .from("translations")
      .select("id, translated, hit_count")
      .eq("source", trimmed)
      .eq("source_lang", source_lang)
      .eq("target_lang", target_lang)
      .eq("context", context)
      .maybeSingle();

    if (cacheErr) {
      console.error("Cache lookup error", cacheErr);
    }

    if (cached?.translated) {
      // Update usage asynchronously
      await supabase
        .from("translations")
        .update({ hit_count: (cached.hit_count || 0) + 1, last_accessed: new Date().toISOString() })
        .eq("id", cached.id);

      return new Response(JSON.stringify({ translated: cached.translated, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Translate via Gemini
    const translated = await callGeminiTranslate(trimmed, context, source_lang, target_lang);

    // 3) Upsert into cache
    const { error: upsertErr } = await supabase
      .from("translations")
      .upsert(
        {
          source: trimmed,
          source_lang,
          target_lang,
          context,
          translated,
          provider: "gemini",
          hit_count: 1,
          last_accessed: new Date().toISOString(),
        },
        { onConflict: "source,source_lang,target_lang,context" }
      );

    if (upsertErr) {
      console.error("Cache upsert error", upsertErr);
    }

    return new Response(JSON.stringify({ translated, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate-and-cache error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});