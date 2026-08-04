/**
 * Auth Module - SDK interface for authentication
 */

export class AuthClient {
  private _storage: any;
  private _events: any;
  private _supabase: any;
  constructor({ storage, events, supabaseClient }) {
    this._storage = storage;
    this._events = events;
    this._supabase = supabaseClient;
  }

  async getSession() {
    if (this._supabase) {
      const { data, error } = await this._supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    }
    return null;
  }

  async getUser() {
    const session = await this.getSession();
    return session?.user || null;
  }

  async signIn({ email, password }) {
    if (!this._supabase) throw new Error('Supabase client not configured');

    const { data, error } = await this._supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    this._events.emit('blueprin:auth:signed:in', { user: data.user });
    return data;
  }

  async signUp({ email, password, metadata = {} }) {
    if (!this._supabase) throw new Error('Supabase client not configured');

    const { data, error } = await this._supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    if (this._supabase) {
      const { error } = await this._supabase.auth.signOut();
      if (error) throw error;
    }
    this._events.emit('blueprin:auth:signed:out', {});
  }

  onAuthStateChange(callback) {
    if (this._supabase) {
      const { data } = this._supabase.auth.onAuthStateChange((event, session) => {
        callback({ event, session, user: session?.user || null });
      });
      return () => data.subscription.unsubscribe();
    }
    return () => {};
  }
}
