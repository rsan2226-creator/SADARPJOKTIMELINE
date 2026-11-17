import { GoogleGenAI } from '@google/genai';

export const DEFAULT_GEMINI_MODEL = 'gemini-4-hydrogen';

export function getGeminiApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

export function createGeminiClient(): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface GeminiErrorInfo {
  code: 'PERMISSION_DENIED' | 'API_KEY_INVALID' | 'RESOURCE_EXHAUSTED' | 'NOT_FOUND' | 'UNKNOWN';
  userMessage: string;
  rawMessage: string;
}

export function logGeminiFallback(feature: string, errInfo: GeminiErrorInfo): void {
  console.info(`[SADARPJOK] ${feature} menggunakan Mode Template otomatis (status: ${errInfo.code}).`);
}

export function classifyGeminiError(error: unknown): GeminiErrorInfo {
  const rawMessage = error instanceof Error ? error.message : String(error ?? 'Unknown error');
  const lower = rawMessage.toLowerCase();

  if (
    lower.includes('403') ||
    lower.includes('permission_denied') ||
    lower.includes('free tier is not available') ||
    lower.includes('billing')
  ) {
    return {
      code: 'PERMISSION_DENIED',
      userMessage:
        'Akses Gemini API ditolak (403 PERMISSION_DENIED: proyek API Key belum mengaktifkan tier berbayar/billing). Dokumen tetap dibuat dalam Mode Template otomatis. Periksa atau ganti API Key di panel Settings > Secrets untuk mengaktifkan generasi AI penuh.',
      rawMessage,
    };
  }

  if (
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    (lower.includes('400') && lower.includes('key'))
  ) {
    return {
      code: 'API_KEY_INVALID',
      userMessage:
        'API Key Gemini tidak valid. Dokumen dibuat menggunakan Mode Template otomatis. Silakan periksa API Key di panel Settings > Secrets.',
      rawMessage,
    };
  }

  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return {
      code: 'RESOURCE_EXHAUSTED',
      userMessage:
        'Kuota Gemini API terlampaui (429 RESOURCE_EXHAUSTED). Dokumen dibuat menggunakan Mode Template otomatis. Silakan periksa kuota atau pilih API Key berbayar di Settings > Secrets.',
      rawMessage,
    };
  }

  if (lower.includes('404') || lower.includes('not_found')) {
    return {
      code: 'NOT_FOUND',
      userMessage:
        'Model Gemini tidak tersedia (404 NOT_FOUND). Dokumen dibuat menggunakan Mode Template otomatis.',
      rawMessage,
    };
  }

  return {
    code: 'UNKNOWN',
    userMessage:
      'Layanan Gemini AI sedang tidak dapat dihubungi. Dokumen tetap disusun menggunakan Mode Template otomatis.',
    rawMessage,
  };
}
