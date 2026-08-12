import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthClient } from '../lib/src/auth/index.ts';
import { EventBus } from '../lib/src/core/event-bus.ts';
import { Logger } from '../lib/src/core/logger.ts';

function createMockSupabase() {
  const mockUnsubscribe = vi.fn();
  const mockSubscription = { unsubscribe: mockUnsubscribe };
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u1', email: 'test@test.com' } } }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'u1', email: 'test@test.com' }, session: {} }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'u2', email: 'new@test.com' } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: mockSubscription } }),
    },
    _mockUnsubscribe: mockUnsubscribe,
  };
}

describe('AuthClient', () => {
  let events;
  let logger;

  beforeEach(() => {
    logger = new Logger({ prefix: '[Test]', debug: false });
    events = new EventBus({ logger });
  });

  it('should return null session when no supabase client', async () => {
    const auth = new AuthClient({ storage: null, events, supabaseClient: null });
    const session = await auth.getSession();
    expect(session).toBeNull();
  });

  it('should return session from supabase', async () => {
    const mock = createMockSupabase();
    const auth = new AuthClient({ storage: null, events, supabaseClient: mock });
    const session = await auth.getSession();
    expect(session.user.id).toBe('u1');
  });

  it('should throw on getSession error', async () => {
    const mock = createMockSupabase();
    mock.auth.getSession.mockResolvedValue({ data: { session: null }, error: new Error('session error') });
    const auth = new AuthClient({ storage: null, events, supabaseClient: mock });
    await expect(auth.getSession()).rejects.toThrow('session error');
  });

  it('should get user from session', async () => {
    const mock = createMockSupabase();
    const auth = new AuthClient({ storage: null, events, supabaseClient: mock });
    const user = await auth.getUser();
    expect(user.id).toBe('u1');
  });

  it('should return null user when no session', async () => {
    const mock = createMockSupabase();
    mock.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    const auth = new AuthClient({ storage: null, events, supabaseClient: mock });
    const user = await auth.getUser();
    expect(user).toBeNull();
  });

  it('should sign in with email and password', async () => {
    const mock = createMockSupabase();
    const auth = new AuthClient({ storage: null, events, supabaseClient: mock });

    let emitted = false;
    events.on('blueprin:auth:signed:in', () => { emitted = true; });

    const result = await auth.signIn({ email: 'test@test.com', password: 'pass' });
    expect(result.user.id).toBe('u1');
    expect(emitted).toBe(true);
  });

  it('should throw when signIn without supabase', async () => {
    const auth = new AuthClient({ storage: null, events, supabaseClient: null });
    await expect(auth.signIn({ email: 'a@b.com', password: 'x' })).rejects.toThrow('Supabase client not configured');
  });

  it('should throw on signIn error', async () => {
    const mock = createMockSupabase();
    mock.auth.signInWithPassword.mockResolvedValue({ data: null, error: new Error('invalid credentials') });
    const auth = new AuthClient({ storage: null, events, supabaseClient: mock });
    await expect(auth.signIn({ email: 'a@b.com', password: 'x' })).rejects.toThrow('invalid credentials');
  });

  it('should sign up', async () => {
    const mock = createMockSupabase();
    const auth = new AuthClient({ storage: null, events, supabaseClient: mock });
    const result = await auth.signUp({ email: 'new@test.com', password: 'pass', metadata: { name: 'Test' } });
    expect(result.user.id).toBe('u2');
    expect(mock.auth.signUp).toHaveBeenCalledWith({
      email: 'new@test.com',
      password: 'pass',
      options: { data: { name: 'Test' } },
    });
  });

  it('should throw when signUp without supabase', async () => {
    const auth = new AuthClient({ storage: null, events, supabaseClient: null });
    await expect(auth.signUp({ email: 'a@b.com', password: 'x' })).rejects.toThrow('Supabase client not configured');
  });

  it('should throw on signUp error', async () => {
    const mock = createMockSupabase();
    mock.auth.signUp.mockResolvedValue({ data: null, error: new Error('signup failed') });
    const auth = new AuthClient({ storage: null, events, supabaseClient: mock });
    await expect(auth.signUp({ email: 'a@b.com', password: 'x' })).rejects.toThrow('signup failed');
  });

  it('should sign out and emit event', async () => {
    const mock = createMockSupabase();
    const auth = new AuthClient({ storage: null, events, supabaseClient: mock });

    let emitted = false;
    events.on('blueprin:auth:signed:out', () => { emitted = true; });

    await auth.signOut();
    expect(emitted).toBe(true);
    expect(mock.auth.signOut).toHaveBeenCalled();
  });

  it('should sign out without supabase and still emit', async () => {
    const auth = new AuthClient({ storage: null, events, supabaseClient: null });
    let emitted = false;
    events.on('blueprin:auth:signed:out', () => { emitted = true; });
    await auth.signOut();
    expect(emitted).toBe(true);
  });

  it('should throw on signOut error', async () => {
    const mock = createMockSupabase();
    mock.auth.signOut.mockResolvedValue({ error: new Error('signout failed') });
    const auth = new AuthClient({ storage: null, events, supabaseClient: mock });
    await expect(auth.signOut()).rejects.toThrow('signout failed');
  });

  it('should subscribe to auth state changes', async () => {
    const mock = createMockSupabase();
    const auth = new AuthClient({ storage: null, events, supabaseClient: mock });

    let callbackData = null;
    const unsub = auth.onAuthStateChange((data) => { callbackData = data; });

    // Simulate auth state change
    const stateCallback = mock.auth.onAuthStateChange.mock.calls[0][0];
    stateCallback('SIGNED_IN', { user: { id: 'u1' } });

    expect(callbackData.event).toBe('SIGNED_IN');
    expect(callbackData.user.id).toBe('u1');

    unsub();
    expect(mock._mockUnsubscribe).toHaveBeenCalled();
  });

  it('should return no-op unsubscribe when no supabase', () => {
    const auth = new AuthClient({ storage: null, events, supabaseClient: null });
    const unsub = auth.onAuthStateChange(() => {});
    expect(typeof unsub).toBe('function');
    unsub(); // Should not throw
  });
});
