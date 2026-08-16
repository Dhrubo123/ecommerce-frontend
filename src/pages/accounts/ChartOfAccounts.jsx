import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen, Landmark, Plus, Search, WalletCards } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { createAccountHead, getChartOfAccounts } from '../../services/accountService'
import './accounts.css'
import './tree.css'
import './account-modal.css'

const mockAccountTree = [
  { id: 'assets', code: '1000', name: 'Assets', type: 'Asset', children: [
    { id: 'current-asset', code: '1100', name: 'Current Asset', children: [
      { id: 'receivable', code: '1110', name: 'Accounts Receivable', children: [{ id: 'customer-receivable', code: '1111', name: 'Customer Receivable' }, { id: 'employee-receivable', code: '1112', name: 'Employee Receivable' }, { id: 'spama-customer', code: '1113', name: 'Spama Customer' }] },
      { id: 'advance', code: '1120', name: 'Advance', children: [{ id: 'advance-customer', code: '1121', name: 'Advance Against Customer' }, { id: 'advance-employee', code: '1122', name: 'Advance Against Employee' }] },
      { id: 'cash', code: '1130', name: 'Cash', children: [{ id: 'cash-hand', code: '1131', name: 'Cash in Hand' }, { id: 'petty-cash', code: '1132', name: 'Petty Cash' }] },
      { id: 'cash-bank', code: '1140', name: 'Cash at Bank', children: [{ id: 'abc-bank', code: '1141', name: 'ABC Bank' }, { id: 'bank', code: '1142', name: 'Bank' }, { id: 'bkash', code: '1143', name: 'bKash' }, { id: 'islamic-bank', code: '1144', name: 'Islami Bank' }, { id: 'm-pesa', code: '1145', name: 'M-Pesa' }, { id: 'momo', code: '1146', name: 'MOMO' }, { id: 'test-bank', code: '1147', name: 'Test Bank' }] },
      { id: 'inventory', code: '1150', name: 'Inventory', children: [{ id: 'inventory-products', code: '1151', name: 'Inventory Account' }] },
      { id: 'prepaid', code: '1160', name: 'Prepaid Expenses' },
    ] },
  ] },
  { id: 'fixed', code: '1200', name: 'Fixed Assets', type: 'Asset', children: [{ id: 'car', code: '1210', name: 'Car' }, { id: 'goodwills', code: '1220', name: 'Goodwills' }, { id: 'land', code: '1230', name: 'Land' }, { id: 'equipment', code: '1240', name: 'Property & Equipment' }, { id: 'testing-fixed', code: '1250', name: 'Testing Fixed Assets' }] },
  { id: 'liabilities', code: '2000', name: 'Liabilities', type: 'Liability', children: [
    { id: 'current-liabilities', code: '2100', name: 'Current Liabilities', children: [{ id: 'payable', code: '2110', name: 'Accounts Payable', children: [{ id: 'supplier-payable', code: '2111', name: 'Supplier Payable' }] }, { id: 'accrued', code: '2120', name: 'Accrued Expenses' }, { id: 'supplier-name-payable', code: '2130', name: 'Accounts Pay by Name Supplier' }, { id: 'depreciations', code: '2140', name: 'Depreciations', children: [{ id: 'goodwill-depreciation', code: '2141', name: 'Depreciation of Goodwill' }] }, { id: 'provisions', code: '2150', name: 'Provisions', children: [{ id: 'npf-provision', code: '2151', name: 'Provision for NPF Contribution' }, { id: 'tax-provision', code: '2152', name: 'Provision for State Income Tax' }] }, { id: 'unearned', code: '2160', name: 'Unearned Revenue', children: [{ id: 'property-sales', code: '2161', name: 'Property Sales' }] }] },
    { id: 'long-term-liabilities', code: '2200', name: 'Long Term Liabilities', children: [{ id: 'long-term-debt', code: '2210', name: 'Long-Term Debt', children: [{ id: 'debts', code: '2211', name: 'Debts' }] }, { id: 'other-long-term', code: '2220', name: 'Other Long-Term Liabilities', children: [{ id: 'other-long-term-child', code: '2221', name: 'Other Long-Term Liabilities' }] }] },
  ] },
  { id: 'shareholders-equity', code: '3000', name: "Shareholder's Equity", type: 'Equity', children: [{ id: 'equity', code: '3100', name: 'Equity', children: [{ id: 'capital', code: '3110', name: 'Equity Capital', children: [{ id: 'capital-fund', code: '3111', name: 'Capital Fund' }] }, { id: 'earning', code: '3120', name: 'Retained Earnings', children: [{ id: 'current-pl', code: '3121', name: 'Current Year Profit & Loss' }, { id: 'last-pl', code: '3122', name: 'Last Year Profit & Loss' }] }] }] },
  { id: 'income', code: '4000', name: 'Income', type: 'Income', children: [
    { id: 'direct-income', code: '4100', name: 'Direct Income', children: [{ id: 'construction-income', code: '4110', name: 'Construction Income' }, { id: 'reimbursement-income', code: '4120', name: 'Reimbursement Income' }, { id: 'sales-accounts', code: '4130', name: 'Sales Accounts', children: [{ id: 'sales-account', code: '4131', name: 'Sales Account' }] }, { id: 'service-accounts', code: '4140', name: 'Service Accounts', children: [{ id: 'service-account', code: '4141', name: 'Service Account' }] }] },
    { id: 'indirect-income', code: '4200', name: 'Indirect Income' },
  ] },
  { id: 'expense', code: '5000', name: 'Expenses', type: 'Expense', children: [
    { id: 'cogs', code: '5100', name: 'Cost of Goods Sold', children: [{ id: 'cost-goods-sold', code: '5110', name: 'Cost of Goods Sold' }, { id: 'cost-goods-sold-account', code: '5111', name: 'Cost of Goods Sold Account' }, { id: 'job-expenses', code: '5112', name: 'Job Expenses' }] },
    { id: 'overhead', code: '5200', name: 'Over Head Cost', children: [{ id: 'automobile', code: '5210', name: 'Automobile', children: [{ id: 'automobile-purchase', code: '5211', name: 'Purchase' }] }, { id: 'bank-service', code: '5220', name: 'Bank Service Charges' }, { id: 'employer-icf', code: '5230', name: 'Employer ICF Expense', children: [{ id: 'employer-icf-child', code: '5231', name: 'Employer 1% ICF Expense' }] }, { id: 'insurance', code: '5240', name: 'Insurance' }, { id: 'interest', code: '5250', name: 'Interest Expenses' }, { id: 'payroll', code: '5260', name: 'Payroll Expenses', children: [{ id: 'employee-npf-10', code: '5261', name: 'Employee 10% NPF Expenses' }, { id: 'employee-npf-5', code: '5262', name: 'Employee 5% NPF Expenses' }, { id: 'salary', code: '5263', name: 'Salary Expense' }] }, { id: 'postage', code: '5270', name: 'Postage' }, { id: 'fees', code: '5280', name: 'Professional Fees' }, { id: 'purchase-account', code: '5290', name: 'Purchase Account' }, { id: 'repairs', code: '5291', name: 'Repairs' }, { id: 'state-tax', code: '5292', name: 'State Income Tax', children: [{ id: 'state-tax-child', code: '5293', name: 'State Income Tax' }] }, { id: 'tools', code: '5294', name: 'Tools and Machinery' }, { id: 'utilities', code: '5295', name: 'Utilities', children: [{ id: 'electric-bill', code: '5296', name: 'Electric Bill' }, { id: 'house-rent', code: '5297', name: 'House Rent' }] }] },
  ] },
]

const flatten = (items) => items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])])

const childrenOf = (account) => account.children ?? account.accounts ?? account.subAccounts ?? account.childAccounts ?? []
const normalizeTree = (accounts) => {
  const source = Array.isArray(accounts) ? accounts : (accounts?.accounts ?? accounts?.coa ?? accounts?.items ?? [])
  const mapNode = (account) => ({ id: String(account.id ?? account.accountId ?? account.code ?? account.accountCode), code: account.headCode ?? account.code ?? account.accountCode ?? '—', name: account.name ?? account.accountName ?? 'Unnamed account', type: account.headType ?? account.type ?? account.accountType ?? '', nodeType: account.nodeType ?? '', parentName: account.parentHeadName ?? '', isActive: account.isActive ?? true, children: childrenOf(account).map(mapNode) })
  if (source.some((account) => childrenOf(account).length)) return source.map(mapNode)
  const byId = new Map(source.map((account) => [String(account.id ?? account.accountId), { ...mapNode(account), children: [] }]))
  const roots = []
  source.forEach((account) => { const node = byId.get(String(account.id ?? account.accountId)); const parentId = account.parentId ?? account.parentAccountId ?? account.parent_id; if (parentId != null && byId.has(String(parentId))) byId.get(String(parentId)).children.push(node); else roots.push(node) })
  return roots
}

function TreeNode({ node, level, openNodes, toggle, selected, onSelect, search }) {
  const hasChildren = Boolean(node.children?.length)
  const visible = !search || flatten([node]).some((item) => `${item.name} ${item.code}`.toLowerCase().includes(search))
  if (!visible) return null
  const expanded = openNodes[node.id]
  return <>
    <button className={`coa-node ${selected?.id === node.id ? 'is-selected' : ''}`} style={{ '--level': level }} onClick={() => onSelect(node)}>
      {hasChildren ? <span className="coa-chevron" onClick={(event) => { event.stopPropagation(); toggle(node.id) }}>{expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span> : <span className="coa-chevron is-empty" />}
      {hasChildren ? (expanded ? <FolderOpen size={17} /> : <Folder size={17} />) : <span className="coa-leaf" />}
      <span className="coa-node-name">{node.name}</span><code>{node.code}</code>
    </button>
    {hasChildren && expanded && <div className="coa-children">{node.children.map((child) => <TreeNode key={child.id} node={child} level={level + 1} openNodes={openNodes} toggle={toggle} selected={selected} onSelect={onSelect} search={search} />)}</div>}
  </>
}

export default function ChartOfAccounts() {
  const [search, setSearch] = useState('')
  const [accountTree, setAccountTree] = useState(mockAccountTree)
  const [openNodes, setOpenNodes] = useState(() => Object.fromEntries(flatten(mockAccountTree).filter((item) => item.children).map((item) => [item.id, true])))
  const [selected, setSelected] = useState(mockAccountTree[0].children[0])
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newHead, setNewHead] = useState({ parentId: '', headName: '', isActive: true })
  const [saving, setSaving] = useState(false)
  const applyAccountData = (data) => { const tree = normalizeTree(data); if (!tree.length) return; setAccountTree(tree); setOpenNodes(Object.fromEntries(flatten(tree).filter((item) => item.children?.length).map((item) => [item.id, true]))); setSelected(tree[0]) }
  const loadAccounts = async () => { try { applyAccountData(await getChartOfAccounts()) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load the Chart of Accounts.') } }
  useEffect(() => { getChartOfAccounts().then((data) => { const tree = normalizeTree(data); if (!tree.length) return; setAccountTree(tree); setOpenNodes(Object.fromEntries(flatten(tree).filter((item) => item.children?.length).map((item) => [item.id, true]))); setSelected(tree[0]) }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load the Chart of Accounts.')) }, [])
  const totals = useMemo(() => ({ groups: accountTree.length, accounts: flatten(accountTree).length }), [accountTree])
  const toggle = (id) => setOpenNodes((current) => ({ ...current, [id]: !current[id] }))
  const openCreate = (parent = selected) => { setNewHead({ parentId: parent?.id || '', headName: '', isActive: true }); setError(''); setCreateOpen(true) }
  const submitHead = async (event) => { event.preventDefault(); if (!newHead.parentId || !newHead.headName.trim()) { setError('Select a parent account and enter an account head name.'); return } setSaving(true); setError(''); try { await createAccountHead(newHead); await loadAccounts(); setCreateOpen(false) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to create the account head.') } finally { setSaving(false) } }
  return <AdminLayout title="Chart of Accounts"><div className="coa-page">
    <div className="coa-heading"><div><p>ACCOUNTS</p><h2>Chart of Accounts</h2><span>Organize the financial structure of your business.</span></div><button className="coa-add" onClick={() => openCreate(null)}><Plus size={17} />New Account</button></div>
    <div className="coa-summary"><div><Landmark size={19} /><span><b>{totals.groups}</b> account groups</span></div><div><WalletCards size={19} /><span><b>{totals.accounts}</b> accounts</span></div><div className="coa-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value.toLowerCase())} placeholder="Search account or code" /></div></div>
    {error && <div className="brand-error">{error}</div>}<div className="coa-workspace"><section className="coa-tree-card"><div className="coa-card-title"><div><h3>Account hierarchy</h3><span>Select an account to view details</span></div><button onClick={() => setOpenNodes(Object.fromEntries(flatten(accountTree).filter((item) => item.children?.length).map((item) => [item.id, true])))}>Expand all</button></div><div className="coa-tree">{accountTree.map((node) => <TreeNode key={node.id} node={node} level={0} openNodes={openNodes} toggle={toggle} selected={selected} onSelect={setSelected} search={search} />)}</div></section>
      <aside className="coa-detail-card"><span className="coa-kicker">ACCOUNT DETAILS</span><div className="coa-detail-icon"><FolderOpen size={24} /></div><h3>{selected.name}</h3><p>Review the selected chart of account information.</p><div className="coa-fields"><div><span>Head code</span><strong>{selected.code}</strong></div><div><span>Head type</span><strong>{selected.type || selected.nodeType || 'Sub account'}</strong></div><div><span>Parent head</span><strong>{selected.parentName || 'Chart of Accounts'}</strong></div><div><span>Status</span><b className="coa-active">{selected.isActive ? 'Active' : 'Inactive'}</b></div></div><div className="coa-detail-actions"><button type="button">Edit Account</button><button type="button" className="secondary" onClick={() => openCreate(selected)}>Add Sub Account</button></div></aside>
    </div>
    {createOpen && <div className="coa-modal-backdrop" onMouseDown={() => !saving && setCreateOpen(false)}><form className="coa-modal" onSubmit={submitHead} onMouseDown={(event) => event.stopPropagation()}><div><span className="coa-kicker">CREATE ACCOUNT HEAD</span><h3>New Account</h3><p>Add an account under an existing parent head.</p></div><label>Parent Account<select value={newHead.parentId} onChange={(event) => setNewHead((current) => ({ ...current, parentId: event.target.value }))}><option value="">Select parent account</option>{flatten(accountTree).filter((account) => account.children?.length || account.nodeType !== 'ledger').map((account) => <option key={account.id} value={account.id}>{`${account.name} (${account.code})`}</option>)}</select></label><label>Account Head Name<input value={newHead.headName} onChange={(event) => setNewHead((current) => ({ ...current, headName: event.target.value }))} placeholder="Other Customer Receivable" /></label><label className="coa-checkbox"><input type="checkbox" checked={newHead.isActive} onChange={(event) => setNewHead((current) => ({ ...current, isActive: event.target.checked }))} />Active account</label><div className="coa-modal-actions"><button type="button" onClick={() => setCreateOpen(false)}>Cancel</button><button className="coa-add" disabled={saving}>{saving ? 'Saving…' : 'Save Account'}</button></div></form></div>}
  </div></AdminLayout>
}
