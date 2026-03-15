import { z } from 'zod';
import { RampClient } from './api-client.js';

/**
 * Ramp MCP Tool Definitions
 *
 * 44 tools covering: Business, Users, Departments, Locations,
 * Cards, Transactions, Limits, Bills, Reimbursements, Cashbacks,
 * Entities, GL Accounts, Accounting Vendors, Spend Programs,
 * Receipts, Audit Log, Bank Accounts
 */

interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  handler: (client: RampClient, args: any) => Promise<any>;
}

// Reusable cursor-based pagination params
const paginationParams = {
  start: z.string().optional().describe('pagination cursor'),
  page_size: z.number().optional().describe('results per page'),
};

export const tools: ToolDef[] = [
  // --- Business (2) ---
  {
    name: 'business_get',
    description: 'Get company information',
    inputSchema: z.object({}),
    handler: async (client: RampClient) => client.getBusiness(),
  },
  {
    name: 'business_balance_get',
    description: 'Get company balance',
    inputSchema: z.object({}),
    handler: async (client: RampClient) => client.getBusinessBalance(),
  },

  // --- Users (3) ---
  {
    name: 'users_list',
    description: 'List users',
    inputSchema: z.object({
      ...paginationParams,
      department_id: z.string().optional().describe('filter by department'),
      location_id: z.string().optional().describe('filter by location'),
    }),
    handler: async (client: RampClient, args: any) => client.listUsers(args),
  },
  {
    name: 'user_get',
    description: 'Get user by ID',
    inputSchema: z.object({ id: z.string().describe('user ID') }),
    handler: async (client: RampClient, args: any) => client.getUser(args.id),
  },
  {
    name: 'user_update',
    description: 'Update a user',
    inputSchema: z.object({
      id: z.string().describe('user ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: RampClient, args: any) => client.updateUser(args.id, JSON.parse(args.data)),
  },

  // --- Departments (4) ---
  {
    name: 'departments_list',
    description: 'List departments',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: RampClient, args: any) => client.listDepartments(args),
  },
  {
    name: 'department_get',
    description: 'Get department by ID',
    inputSchema: z.object({ id: z.string().describe('department ID') }),
    handler: async (client: RampClient, args: any) => client.getDepartment(args.id),
  },
  {
    name: 'department_create',
    description: 'Create a department',
    inputSchema: z.object({
      name: z.string().describe('department name'),
      data: z.string().optional().describe('full JSON body override'),
    }),
    handler: async (client: RampClient, args: any) => {
      const body = args.data ? JSON.parse(args.data) : { name: args.name };
      return client.createDepartment(body);
    },
  },
  {
    name: 'department_update',
    description: 'Update a department',
    inputSchema: z.object({
      id: z.string().describe('department ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: RampClient, args: any) => client.updateDepartment(args.id, JSON.parse(args.data)),
  },

  // --- Locations (3) ---
  {
    name: 'locations_list',
    description: 'List locations',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: RampClient, args: any) => client.listLocations(args),
  },
  {
    name: 'location_get',
    description: 'Get location by ID',
    inputSchema: z.object({ id: z.string().describe('location ID') }),
    handler: async (client: RampClient, args: any) => client.getLocation(args.id),
  },
  {
    name: 'location_create',
    description: 'Create a location',
    inputSchema: z.object({
      name: z.string().describe('location name'),
      data: z.string().optional().describe('full JSON body override'),
    }),
    handler: async (client: RampClient, args: any) => {
      const body = args.data ? JSON.parse(args.data) : { name: args.name };
      return client.createLocation(body);
    },
  },

  // --- Cards (9) ---
  {
    name: 'cards_list',
    description: 'List cards',
    inputSchema: z.object({
      ...paginationParams,
      user_id: z.string().optional().describe('filter by user'),
    }),
    handler: async (client: RampClient, args: any) => client.listCards(args),
  },
  {
    name: 'card_get',
    description: 'Get card by ID',
    inputSchema: z.object({ id: z.string().describe('card ID') }),
    handler: async (client: RampClient, args: any) => client.getCard(args.id),
  },
  {
    name: 'card_update',
    description: 'Update card name or restrictions',
    inputSchema: z.object({
      id: z.string().describe('card ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: RampClient, args: any) => client.updateCard(args.id, JSON.parse(args.data)),
  },
  {
    name: 'card_create_virtual',
    description: 'Create a virtual card (async)',
    inputSchema: z.object({ data: z.string().describe('full JSON card request body') }),
    handler: async (client: RampClient, args: any) => client.createVirtualCard(JSON.parse(args.data)),
  },
  {
    name: 'card_create_physical',
    description: 'Create a physical card (async)',
    inputSchema: z.object({ data: z.string().describe('full JSON card request body') }),
    handler: async (client: RampClient, args: any) => client.createPhysicalCard(JSON.parse(args.data)),
  },
  {
    name: 'card_suspend',
    description: 'Suspend a card (reversible)',
    inputSchema: z.object({ id: z.string().describe('card ID') }),
    handler: async (client: RampClient, args: any) => client.suspendCard(args.id),
  },
  {
    name: 'card_unsuspend',
    description: 'Unsuspend a card',
    inputSchema: z.object({ id: z.string().describe('card ID') }),
    handler: async (client: RampClient, args: any) => client.unsuspendCard(args.id),
  },
  {
    name: 'card_terminate',
    description: 'Terminate a card (permanent)',
    inputSchema: z.object({ id: z.string().describe('card ID') }),
    handler: async (client: RampClient, args: any) => client.terminateCard(args.id),
  },
  {
    name: 'card_deferred_status',
    description: 'Check async card task status',
    inputSchema: z.object({ task_id: z.string().describe('deferred task ID') }),
    handler: async (client: RampClient, args: any) => client.getDeferredTaskStatus(args.task_id),
  },

  // --- Transactions (2) ---
  {
    name: 'transactions_list',
    description: 'List transactions',
    inputSchema: z.object({
      ...paginationParams,
      from_date: z.string().optional().describe('start date ISO'),
      to_date: z.string().optional().describe('end date ISO'),
      merchant: z.string().optional().describe('merchant name filter'),
    }),
    handler: async (client: RampClient, args: any) => client.listTransactions(args),
  },
  {
    name: 'transaction_get',
    description: 'Get transaction by ID',
    inputSchema: z.object({ id: z.string().describe('transaction ID') }),
    handler: async (client: RampClient, args: any) => client.getTransaction(args.id),
  },

  // --- Limits (3) ---
  {
    name: 'limits_list',
    description: 'List spend limits',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: RampClient, args: any) => client.listLimits(args),
  },
  {
    name: 'limit_get',
    description: 'Get limit by ID',
    inputSchema: z.object({ id: z.string().describe('limit ID') }),
    handler: async (client: RampClient, args: any) => client.getLimit(args.id),
  },
  {
    name: 'limit_update',
    description: 'Update a spend limit',
    inputSchema: z.object({
      id: z.string().describe('limit ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: RampClient, args: any) => client.updateLimit(args.id, JSON.parse(args.data)),
  },

  // --- Bills (5) ---
  {
    name: 'bills_list',
    description: 'List bills',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: RampClient, args: any) => client.listBills(args),
  },
  {
    name: 'bill_get',
    description: 'Get bill by ID',
    inputSchema: z.object({ id: z.string().describe('bill ID') }),
    handler: async (client: RampClient, args: any) => client.getBill(args.id),
  },
  {
    name: 'bill_create',
    description: 'Create a bill',
    inputSchema: z.object({ data: z.string().describe('full JSON bill body') }),
    handler: async (client: RampClient, args: any) => client.createBill(JSON.parse(args.data)),
  },
  {
    name: 'bill_update',
    description: 'Update a bill',
    inputSchema: z.object({
      id: z.string().describe('bill ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: RampClient, args: any) => client.updateBill(args.id, JSON.parse(args.data)),
  },
  {
    name: 'bill_delete',
    description: 'Archive a bill',
    inputSchema: z.object({ id: z.string().describe('bill ID') }),
    handler: async (client: RampClient, args: any) => client.deleteBill(args.id),
  },

  // --- Reimbursements (2) ---
  {
    name: 'reimbursements_list',
    description: 'List reimbursements',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: RampClient, args: any) => client.listReimbursements(args),
  },
  {
    name: 'reimbursement_get',
    description: 'Get reimbursement by ID',
    inputSchema: z.object({ id: z.string().describe('reimbursement ID') }),
    handler: async (client: RampClient, args: any) => client.getReimbursement(args.id),
  },

  // --- Cashbacks (2) ---
  {
    name: 'cashbacks_list',
    description: 'List cashback payments',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: RampClient, args: any) => client.listCashbacks(args),
  },
  {
    name: 'cashback_get',
    description: 'Get cashback payment by ID',
    inputSchema: z.object({ id: z.string().describe('cashback ID') }),
    handler: async (client: RampClient, args: any) => client.getCashback(args.id),
  },

  // --- Entities (2) ---
  {
    name: 'entities_list',
    description: 'List business entities',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: RampClient, args: any) => client.listEntities(args),
  },
  {
    name: 'entity_get',
    description: 'Get business entity by ID',
    inputSchema: z.object({ id: z.string().describe('entity ID') }),
    handler: async (client: RampClient, args: any) => client.getEntity(args.id),
  },

  // --- GL Accounts (2) ---
  {
    name: 'gl_accounts_list',
    description: 'List general ledger accounts',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: RampClient, args: any) => client.listGLAccounts(args),
  },
  {
    name: 'gl_account_get',
    description: 'Get GL account by ID',
    inputSchema: z.object({ id: z.string().describe('GL account ID') }),
    handler: async (client: RampClient, args: any) => client.getGLAccount(args.id),
  },

  // --- Accounting Vendors (2) ---
  {
    name: 'accounting_vendors_list',
    description: 'List accounting vendors',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: RampClient, args: any) => client.listAccountingVendors(args),
  },
  {
    name: 'accounting_vendor_get',
    description: 'Get accounting vendor by ID',
    inputSchema: z.object({ id: z.string().describe('vendor ID') }),
    handler: async (client: RampClient, args: any) => client.getAccountingVendor(args.id),
  },

  // --- Spend Programs (2) ---
  {
    name: 'spend_programs_list',
    description: 'List spend programs',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: RampClient, args: any) => client.listSpendPrograms(args),
  },
  {
    name: 'spend_program_get',
    description: 'Get spend program by ID',
    inputSchema: z.object({ id: z.string().describe('spend program ID') }),
    handler: async (client: RampClient, args: any) => client.getSpendProgram(args.id),
  },

  // --- Receipts (2) ---
  {
    name: 'receipts_list',
    description: 'List receipts',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: RampClient, args: any) => client.listReceipts(args),
  },
  {
    name: 'receipt_get',
    description: 'Get receipt by ID',
    inputSchema: z.object({ id: z.string().describe('receipt ID') }),
    handler: async (client: RampClient, args: any) => client.getReceipt(args.id),
  },

  // --- Audit Log (1) ---
  {
    name: 'audit_log_list',
    description: 'List audit log events',
    inputSchema: z.object({
      ...paginationParams,
      from_date: z.string().optional().describe('start date ISO'),
      to_date: z.string().optional().describe('end date ISO'),
    }),
    handler: async (client: RampClient, args: any) => client.listAuditLogEvents(args),
  },

  // --- Bank Accounts (1) ---
  {
    name: 'bank_account_get',
    description: 'Get bank account by ID',
    inputSchema: z.object({ id: z.string().describe('bank account ID') }),
    handler: async (client: RampClient, args: any) => client.getBankAccount(args.id),
  },
];
