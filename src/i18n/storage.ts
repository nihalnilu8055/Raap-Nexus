const P = 'rn.'
export const store = {
  get(k: string): string | null { try { return localStorage.getItem(P + k) } catch { return null } },
  set(k: string, v: string) { try { localStorage.setItem(P + k, v) } catch { /* ignore */ } },
}
