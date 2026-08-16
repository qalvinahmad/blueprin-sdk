import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  BaseConnector,
  SupplierConnector,
  BPJSConnector,
  BankConnector,
  MessagingConnector,
  AccountingConnector,
  ConnectorRegistry,
} from '../lib/src/connector/index.ts';
import { CONNECTOR_STATUS } from '../lib/src/core/constants.ts';

describe('Connectors full coverage', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('BaseConnector handles lifecycle, errors and testing', async () => {
    class FailingConnector extends BaseConnector {
      async onConnect() {
        throw new Error('Connect boom');
      }
      async onDisconnect() {}
      async onTest() {
        return true;
      }
    }

    const failing = new FailingConnector();
    await expect(failing.connect({})).rejects.toThrow('Connect boom');
    expect(failing.status).toBe(CONNECTOR_STATUS.ERROR);

    class CustomConnector extends BaseConnector {
      async onConnect() {}
      async onDisconnect() {}
      async onTest() {
        return true;
      }
    }

    const conn = new CustomConnector({ id: 'custom-1', name: 'Custom' });
    expect(conn.id).toBe('custom-1');
    expect(conn.name).toBe('Custom');
    expect(conn.version).toBe('1.0.0');

    // Test before connect
    expect(await conn.test()).toBe(false);

    await conn.connect({ baseUrl: 'https://api.example.com', apiKey: 'test-token' });
    expect(conn.status).toBe(CONNECTOR_STATUS.CONNECTED);
    expect(await conn.test()).toBe(true);
    expect(conn.getInfo().status).toBe(CONNECTOR_STATUS.CONNECTED);

    await conn.disconnect();
    expect(conn.status).toBe(CONNECTOR_STATUS.DISCONNECTED);
  });

  it('SupplierConnector exercises methods', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const supplier = new SupplierConnector();
    await supplier.connect({ baseUrl: 'https://supplier.com' });

    await supplier.getCatalog();
    await supplier.submitPurchaseOrder({ items: [] });
    await supplier.checkOrderStatus('po-1');
    await supplier.getTracking('po-1');
    await supplier.submitRFQ({ items: [] });
    await supplier.getSupplierInfo();

    expect(globalThis.fetch).toHaveBeenCalledTimes(6);
  });

  it('BPJSConnector exercises methods', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const bpjs = new BPJSConnector();
    await bpjs.connect({ baseUrl: 'https://bpjs.go.id' });

    await bpjs.getContributions('202501');
    await bpjs.getClaimStatus('claim-1');
    await bpjs.registerEmployee({ name: 'Budi' });
    await bpjs.getBalance();
    await bpjs.getFaskes('Jakarta');

    expect(globalThis.fetch).toHaveBeenCalledTimes(5);
  });

  it('BankConnector exercises balance, accounts, and verifyVA', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const bank = new BankConnector();
    await bank.connect({ baseUrl: 'https://bank.com' });

    await bank.createTransfer({ amount: 1000 });
    await bank.getBalance('acc-1');
    await bank.getAccounts();
    await bank.verifyVA('1234567890');
    await bank.getMutasi('acc-1', '2025-01-01', '2025-01-31');

    expect(globalThis.fetch).toHaveBeenCalledTimes(5);
  });

  it('MessagingConnector and AccountingConnector methods', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, accounts: [] }),
    });

    const msg = new MessagingConnector();
    await msg.connect({ baseUrl: 'https://msg.com' });
    await msg.sendMessage('628123456789', 'Halo');
    await msg.sendTemplate('628123456789', 'welcome', {});
    await msg.sendBulk(['628123456789'], 'Info');
    await msg.getStatus('msg-1');

    const acc = new AccountingConnector();
    await acc.connect({ baseUrl: 'https://acc.com' });
    await acc.getAccountBalances();
    await acc.createJournalEntry({});
    await acc.syncInvoices({});
    await acc.getChartOfAccounts();
    await acc.createBill({});
    await acc.getTrialBalance('2025');

    expect(globalThis.fetch).toHaveBeenCalledTimes(10);
  });

  it('ConnectorRegistry registers and creates connectors', async () => {
    const registry = new ConnectorRegistry({ storage: null });
    registry.register(SupplierConnector);

    expect(registry.get('SupplierConnector')).toBe(SupplierConnector);
    expect(registry.list().length).toBe(1);

    expect(() => registry.register(SupplierConnector)).toThrow('is already registered');

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const instance = await registry.create('SupplierConnector', { baseUrl: 'https://test.com' });
    expect(instance).toBeDefined();
    expect(registry.getInstance('SupplierConnector')).toBe(instance);

    await registry.disconnectAll();
    expect(registry.getInstance('SupplierConnector')).toBeNull();
  });
});
