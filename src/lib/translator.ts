import { supabase } from "@/integrations/supabase/client";
import { Language } from "@/contexts/LanguageContext";

// Cache-only lookup. Never calls Gemini at runtime.
export async function getCachedTranslation(
  text: string,
  target_lang: string = "mr",
  context?: string
): Promise<string | null> {
  if (!text) return null;
  try {
    const { data, error } = await supabase
      .from("translations")
      .select("translated")
      .eq("source", text)
      .eq("target_lang", target_lang)
      .maybeSingle();

    if (error) {
      console.error("getCachedTranslation error", error);
      return null;
    }

    return (data as any)?.translated ?? null;
  } catch (e) {
    console.error("getCachedTranslation exception", e);
    return null;
  }
}

// One-time translate-and-cache, used on submit/update flows only.
export async function translateAndCache(
  text: string,
  { source_lang = "en", target_lang = "mr", context }: { source_lang?: string; target_lang?: string; context?: string } = {}
): Promise<string> {
  if (!text) return "";
  try {
    const { data, error } = await supabase.functions.invoke("translate-and-cache", {
      body: { text, source_lang, target_lang, context: context || null },
    });
    if (error) {
      console.error("translate-and-cache invoke error", error);
      return text;
    }
    return (data as any)?.translated || text;
  } catch (e) {
    console.error("translateAndCache error", e);
    return text;
  }
}

// Backward compatible helper: only reads from cache at render time.
export async function translateIfNeeded(text: string, language: Language, context?: string): Promise<string> {
  if (!text) return "";
  if (language !== "marathi") return text;

  const cached = await getCachedTranslation(text, "mr", context);
  return cached ?? text;
}
