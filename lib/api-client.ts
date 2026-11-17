export interface SafeJsonResult<T = Record<string, unknown>> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

/**
 * Safely POST JSON and parse the response without ever throwing
 * `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`
 * if Next.js dev/proxy temporarily returns an HTML error/restart page.
 * Automatically retries once when receiving HTML or 5xx responses.
 */
export async function postJsonSafe<T = Record<string, unknown>>(
  url: string,
  payload: unknown,
  retries = 1
): Promise<SafeJsonResult<T>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      const trimmed = rawText.trim();

      if (!trimmed || trimmed.startsWith('<')) {
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 900));
          continue;
        }
        return {
          ok: false,
          status: res.status,
          data: null,
          error:
            'Server sedang memproses atau memuat ulang halaman (respons HTML). Silakan klik tombol buat ulang dalam beberapa detik.',
        };
      }

      try {
        const parsed = JSON.parse(trimmed) as T;
        if (!res.ok && attempt < retries && res.status >= 500) {
          await new Promise((resolve) => setTimeout(resolve, 900));
          continue;
        }
        return {
          ok: res.ok,
          status: res.status,
          data: parsed,
        };
      } catch {
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 900));
          continue;
        }
        return {
          ok: false,
          status: res.status,
          data: null,
          error: 'Format respons dari server tidak valid. Silakan coba lagi.',
        };
      }
    } catch {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 900));
        continue;
      }
      return {
        ok: false,
        status: 0,
        data: null,
        error: 'Koneksi ke server terputus. Periksa jaringan Anda lalu coba lagi.',
      };
    }
  }

  return {
    ok: false,
    status: 0,
    data: null,
    error: 'Gagal menghubungi server.',
  };
}
