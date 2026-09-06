import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen, Landmark, Plus, Search, WalletCards } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { createAccountHead, getChartOfAccounts } from '../../services/accountService'
import './accounts.css'
import './tree.css'
import './account-modal.css'


const flatten = (items) => items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])])

const childrenOf = (account) => account.children ?? account.accounts ?? account.subAccounts ?? account.childAccounts ?? []
const normalizeTree = (accounts) => {
  const source = Array.isArray(accounts) ? accounts : (accounts?.accounts ?? accounts?.coa ?? accounts?.items ?? [])
  const mapNode = (account) => ({ id: String(account.id ?? account.accountId ?? account.code ?? account.accountCode), code: account.headCode ?? account.code ?? account.accountCode ?? '—', name: account.headName ?? account.name ?? account.accountName ?? 'Unnamed account', type: account.headType ?? account.type ?? account.accountType ?? '', nodeType: account.nodeType ?? '', parentName: account.parentHeadName ?? '', isActive: account.isActive ?? true, children: childrenOf(account).map(mapNode) })
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
  const [accountTree, setAccountTree] = useState([])
  const [openNodes, setOpenNodes] = useState({})
  const [selected, setSelected] = useState({ name: 'Select an account' })
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newHead, setNewHead] = useState({ parentId: '', headName: '', isActive: true })
  const [saving, setSaving] = useState(false)
  const applyAccountData = (data) => { const tree = normalizeTree(data); setAccountTree(tree); setOpenNodes(Object.fromEntries(flatten(tree).filter((item) => item.children?.length).map((item) => [item.id, true]))); setSelected(tree[0] || { name: 'No accounts available' }) }
  const loadAccounts = async () => { try { applyAccountData(await getChartOfAccounts()) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load the Chart of Accounts.') } }
  useEffect(() => { getChartOfAccounts().then((data) => { const tree = normalizeTree(data); setAccountTree(tree); setOpenNodes(Object.fromEntries(flatten(tree).filter((item) => item.children?.length).map((item) => [item.id, true]))); setSelected(tree[0] || { name: 'No accounts available' }) }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load the Chart of Accounts.')) }, [])
  const totals = useMemo(() => ({ groups: accountTree.length, accounts: flatten(accountTree).length }), [accountTree])
  const toggle = (id) => setOpenNodes((current) => ({ ...current, [id]: !current[id] }))
  const openCreate = (parent = selected) => { setNewHead({ parentId: parent?.id || '', headName: '', isActive: true }); setError(''); setCreateOpen(true) }
  const submitHead = async (event) => { event.preventDefault(); if (!newHead.parentId || !newHead.headName.trim()) { setError('Select a parent account and enter an account head name.'); return } setSaving(true); setError(''); try { await createAccountHead(newHead); await loadAccounts(); setCreateOpen(false) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to create the account head.') } finally { setSaving(false) } }
  return <AdminLayout title="Chart of Accounts"><div className="coa-page">
    <div className="coa-heading"><div><p>ACCOUNTS</p><h2>Chart of Accounts</h2><span>Organize the financial structure of your business.</span></div><button className="coa-add" onClick={() => openCreate(null)}><Plus size={17} />New Account</button></div>
    <div className="coa-summary"><div><Landmark size={19} /><span><b>{totals.groups}</b> account groups</span></div><div><WalletCards size={19} /><span><b>{totals.accounts}</b> accounts</span></div><div className="coa-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value.toLowerCase())} placeholder="Search account or code" /></div></div>
    {error && <div className="brand-error">{error}</div>}<div className="coa-workspace"><section className="coa-tree-card"><div className="coa-card-title"><div><h3>Account hierarchy</h3><span>Select an account to view details</span></div><button onClick={() => setOpenNodes(Object.fromEntries(flatten(accountTree).filter((item) => item.children?.length).map((item) => [item.id, true])))}>Expand all</button></div><div className="coa-tree">{accountTree.map((node) => <TreeNode key={node.id} node={node} level={0} openNodes={openNodes} toggle={toggle} selected={selected} onSelect={setSelected} search={search} />)}</div></section>
      <aside className="coa-detail-card"><span className="coa-kicker">ACCOUNT DETAILS</span><div className="coa-detail-icon"><FolderOpen size={24} /></div><h3>{selected.name}</h3><p>Review the selected chart of account information.</p><div className="coa-fields"><div><span>Head code</span><strong>{selected.code}</strong></div><div><span>Head type</span><strong>{selected.type || selected.nodeType || 'Sub account'}</strong></div><div><span>Parent head</span><strong>{selected.parentName || 'Chart of Accounts'}</strong></div><div><span>Status</span><b className="coa-active">{selected.isActive ? 'Active' : 'Inactive'}</b></div></div><div className="coa-detail-actions"><button type="button" className="secondary" onClick={() => openCreate(selected)}>Add Sub Account</button></div></aside>
    </div>
    {createOpen && <div className="coa-modal-backdrop" onMouseDown={() => !saving && setCreateOpen(false)}><form className="coa-modal" onSubmit={submitHead} onMouseDown={(event) => event.stopPropagation()}><div><span className="coa-kicker">CREATE ACCOUNT HEAD</span><h3>New Account</h3><p>Add an account under an existing parent head.</p></div><label>Parent Account<select value={newHead.parentId} onChange={(event) => setNewHead((current) => ({ ...current, parentId: event.target.value }))}><option value="">Select parent account</option>{flatten(accountTree).filter((account) => account.children?.length || account.nodeType !== 'ledger').map((account) => <option key={account.id} value={account.id}>{`${account.name} (${account.code})`}</option>)}</select></label><label>Account Head Name<input value={newHead.headName} onChange={(event) => setNewHead((current) => ({ ...current, headName: event.target.value }))} placeholder="Other Customer Receivable" /></label><label className="coa-checkbox"><input type="checkbox" checked={newHead.isActive} onChange={(event) => setNewHead((current) => ({ ...current, isActive: event.target.checked }))} />Active account</label><div className="coa-modal-actions"><button type="button" onClick={() => setCreateOpen(false)}>Cancel</button><button className="coa-add" disabled={saving}>{saving ? 'Saving…' : 'Save Account'}</button></div></form></div>}
  </div></AdminLayout>
}
