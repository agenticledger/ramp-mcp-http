/**
 * Ramp API Client
 *
 * Base URL: https://api.ramp.com/developer/v1
 * Auth: OAuth 2.0 Client Credentials -> Bearer token
 * Rate limit: 100 req/min
 */

const BASE_URL = 'https://api.ramp.com/developer/v1';
const TOKEN_URL = 'https://api.ramp.com/developer/v1/token';

export class RampClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async ensureToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'transactions:read cards:read cards:write users:read users:write departments:read departments:write locations:read locations:write bills:read bills:write reimbursements:read limits:read limits:write business:read accounting:read accounting:write receipts:read audit_logs:read spend_programs:read entities:read bank_accounts:read cashbacks:read',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OAuth token error ${response.status}: ${text}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Expire 60s early to avoid edge cases
    this.tokenExpiry = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
    return this.accessToken!;
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      params?: Record<string, string | number | boolean | undefined>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, params } = options;
    const token = await this.ensureToken();
    const url = new URL(`${BASE_URL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 204) return {} as T;

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ramp API ${response.status}: ${text}`);
    }

    return response.json();
  }

  // --- Business ---
  async getBusiness() { return this.request<any>('/business'); }
  async getBusinessBalance() { return this.request<any>('/business/balance'); }

  // --- Users ---
  async listUsers(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/users', { params }); }
  async getUser(id: string) { return this.request<any>(`/users/${encodeURIComponent(id)}`); }
  async updateUser(id: string, body: any) { return this.request<any>(`/users/${encodeURIComponent(id)}`, { method: 'PATCH', body }); }

  // --- Departments ---
  async listDepartments(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/departments', { params }); }
  async getDepartment(id: string) { return this.request<any>(`/departments/${encodeURIComponent(id)}`); }
  async createDepartment(body: any) { return this.request<any>('/departments', { method: 'POST', body }); }
  async updateDepartment(id: string, body: any) { return this.request<any>(`/departments/${encodeURIComponent(id)}`, { method: 'PATCH', body }); }

  // --- Locations ---
  async listLocations(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/locations', { params }); }
  async getLocation(id: string) { return this.request<any>(`/locations/${encodeURIComponent(id)}`); }
  async createLocation(body: any) { return this.request<any>('/locations', { method: 'POST', body }); }

  // --- Cards ---
  async listCards(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/cards', { params }); }
  async getCard(id: string) { return this.request<any>(`/cards/${encodeURIComponent(id)}`); }
  async updateCard(id: string, body: any) { return this.request<any>(`/cards/${encodeURIComponent(id)}`, { method: 'PATCH', body }); }
  async createVirtualCard(body: any) { return this.request<any>('/cards/deferred/virtual', { method: 'POST', body }); }
  async createPhysicalCard(body: any) { return this.request<any>('/cards/deferred/physical', { method: 'POST', body }); }
  async suspendCard(id: string) { return this.request<any>(`/cards/${encodeURIComponent(id)}/deferred/suspension`, { method: 'POST' }); }
  async terminateCard(id: string) { return this.request<any>(`/cards/${encodeURIComponent(id)}/deferred/termination`, { method: 'POST' }); }
  async unsuspendCard(id: string) { return this.request<any>(`/cards/${encodeURIComponent(id)}/deferred/unsuspension`, { method: 'POST' }); }
  async getDeferredTaskStatus(taskId: string) { return this.request<any>(`/cards/deferred/status/${encodeURIComponent(taskId)}`); }

  // --- Transactions ---
  async listTransactions(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/transactions', { params }); }
  async getTransaction(id: string) { return this.request<any>(`/transactions/${encodeURIComponent(id)}`); }

  // --- Limits ---
  async listLimits(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/limits', { params }); }
  async getLimit(id: string) { return this.request<any>(`/limits/${encodeURIComponent(id)}`); }
  async updateLimit(id: string, body: any) { return this.request<any>(`/limits/${encodeURIComponent(id)}`, { method: 'PATCH', body }); }

  // --- Bills ---
  async listBills(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/bills', { params }); }
  async getBill(id: string) { return this.request<any>(`/bills/${encodeURIComponent(id)}`); }
  async createBill(body: any) { return this.request<any>('/bills', { method: 'POST', body }); }
  async updateBill(id: string, body: any) { return this.request<any>(`/bills/${encodeURIComponent(id)}`, { method: 'PATCH', body }); }
  async deleteBill(id: string) { return this.request<any>(`/bills/${encodeURIComponent(id)}`, { method: 'DELETE' }); }

  // --- Reimbursements ---
  async listReimbursements(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/reimbursements', { params }); }
  async getReimbursement(id: string) { return this.request<any>(`/reimbursements/${encodeURIComponent(id)}`); }

  // --- Cashbacks ---
  async listCashbacks(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/cashbacks', { params }); }
  async getCashback(id: string) { return this.request<any>(`/cashbacks/${encodeURIComponent(id)}`); }

  // --- Entities ---
  async listEntities(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/entities', { params }); }
  async getEntity(id: string) { return this.request<any>(`/entities/${encodeURIComponent(id)}`); }

  // --- GL Accounts ---
  async listGLAccounts(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/accounting/accounts', { params }); }
  async getGLAccount(id: string) { return this.request<any>(`/accounting/accounts/${encodeURIComponent(id)}`); }

  // --- Accounting Vendors ---
  async listAccountingVendors(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/accounting/vendors', { params }); }
  async getAccountingVendor(id: string) { return this.request<any>(`/accounting/vendors/${encodeURIComponent(id)}`); }

  // --- Spend Programs ---
  async listSpendPrograms(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/spend-programs', { params }); }
  async getSpendProgram(id: string) { return this.request<any>(`/spend-programs/${encodeURIComponent(id)}`); }

  // --- Receipts ---
  async listReceipts(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/receipts', { params }); }
  async getReceipt(id: string) { return this.request<any>(`/receipts/${encodeURIComponent(id)}`); }

  // --- Audit Log ---
  async listAuditLogEvents(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>('/audit-logs/events', { params }); }

  // --- Bank Accounts ---
  async getBankAccount(id: string) { return this.request<any>(`/bank-accounts/${encodeURIComponent(id)}`); }
}
