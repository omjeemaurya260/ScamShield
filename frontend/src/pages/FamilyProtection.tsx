import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Phone,
  Mail,
  Shield,
  Bell,
  BellOff,
  CheckCircle,
  AlertTriangle,
  X,
  Save,
  ChevronDown,
  Info,
  Lock,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  getAlerts,
} from '../services/api';
import type { Contact, Alert } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const RELATIONSHIP_OPTIONS = ['Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Other'] as const;
type Relationship = (typeof RELATIONSHIP_OPTIONS)[number];

const riskColor = (score: number) => {
  if (score >= 70) return 'text-red-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-green-400';
};

const statusConfig: Record<
  Alert['status'],
  { label: string; color: string; bg: string; dotColor: string }
> = {
  simulated: {
    label: 'Simulated',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/30',
    dotColor: 'bg-yellow-400',
  },
  sent: {
    label: 'Sent',
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/30',
    dotColor: 'bg-green-400',
  },
  failed: {
    label: 'Failed',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/30',
    dotColor: 'bg-red-400',
  },
  queued: {
    label: 'Queued',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
    dotColor: 'bg-blue-400',
  },
};

const verdictColor = (verdict: string) => {
  switch (verdict.toUpperCase()) {
    case 'SCAM':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'SUSPICIOUS':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'SAFE':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    default:
      return 'text-slate-400 bg-slate-700/30 border-slate-600/30';
  }
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, size = 'md', disabled = false }: ToggleSwitchProps) {
  const track = size === 'sm' ? 'w-9 h-5' : 'w-12 h-6';
  const thumb = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
  const translate = size === 'sm' ? 'translate-x-4' : 'translate-x-6';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center ${track} rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-cyan-500' : 'bg-slate-600'}`}
    >
      <span
        className={`inline-block ${thumb} w-4 h-4 bg-white rounded-full shadow-lg transform transition-transform duration-300 ml-0.5 ${
          checked ? translate : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────────────────────

interface DeleteModalProps {
  contact: Contact;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ contact, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-slate-100 font-semibold text-lg">Remove Contact</h3>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          Are you sure you want to remove{' '}
          <span className="text-slate-200 font-medium">{contact.name}</span> from your family
          protection contacts? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Contact Card ────────────────────────────────────────────────────────────

interface ContactCardProps {
  contact: Contact;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
}

function ContactCard({ contact, onToggleActive, onDelete, onEdit }: ContactCardProps) {
  return (
    <div
      className={`bg-slate-900/80 backdrop-blur border rounded-2xl p-4 transition-all duration-300 ${
        contact.active
          ? 'border-slate-700/50 hover:border-cyan-500/30'
          : 'border-slate-700/30 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Avatar + Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              contact.active
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-100 font-semibold text-sm truncate">{contact.name}</span>
              {contact.relationship && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40">
                  {contact.relationship}
                </span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  contact.active
                    ? 'bg-green-400/10 border-green-400/30 text-green-400'
                    : 'bg-slate-700/40 border-slate-600/30 text-slate-500'
                }`}
              >
                {contact.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
              {contact.phone && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Phone className="w-3 h-3 shrink-0" />
                  {contact.phone}
                </span>
              )}
              {contact.email && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400 truncate max-w-[200px]">
                  <Mail className="w-3 h-3 shrink-0" />
                  {contact.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onEdit(contact)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
            title="Edit contact"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Remove contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alert toggles + active switch */}
      <div className="mt-3 pt-3 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <ToggleSwitch
              size="sm"
              checked={contact.alert_on_scam}
              onChange={(v) =>
                updateContact(contact.id, { alert_on_scam: v }).catch(() => {})
              }
            />
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Bell className="w-3 h-3 text-red-400" /> Scam alerts
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <ToggleSwitch
              size="sm"
              checked={contact.alert_on_suspicious}
              onChange={(v) =>
                updateContact(contact.id, { alert_on_suspicious: v }).catch(() => {})
              }
            />
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-orange-400" /> Suspicious
            </span>
          </label>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <ToggleSwitch
            size="sm"
            checked={contact.active}
            onChange={(v) => onToggleActive(contact.id, v)}
          />
          <span className="text-xs text-slate-500">{contact.active ? 'Enabled' : 'Disabled'}</span>
        </label>
      </div>
    </div>
  );
}

// ─── Inline Edit Modal ───────────────────────────────────────────────────────

interface EditContactModalProps {
  contact: Contact;
  onSave: (id: string, payload: Partial<Contact>) => Promise<void>;
  onClose: () => void;
}

function EditContactModal({ contact, onSave, onClose }: EditContactModalProps) {
  const [form, setForm] = useState({
    name: contact.name,
    phone: contact.phone ?? '',
    email: contact.email ?? '',
    relationship: contact.relationship ?? '',
    alert_on_scam: contact.alert_on_scam,
    alert_on_suspicious: contact.alert_on_suspicious,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.phone.trim() && !form.email.trim()) {
      setError('Provide at least a phone number or email.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(contact.id, {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        relationship: form.relationship || undefined,
        alert_on_scam: form.alert_on_scam,
        alert_on_suspicious: form.alert_on_suspicious,
      });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-slate-100 font-semibold text-lg flex items-center gap-2">
            <Edit className="w-5 h-5 text-cyan-400" /> Edit Contact
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Relationship</label>
            <div className="relative">
              <select
                value={form.relationship}
                onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
                className="w-full appearance-none bg-slate-800/60 border border-slate-700/50 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors pr-8"
              >
                <option value="">— Select —</option>
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <ToggleSwitch size="sm" checked={form.alert_on_scam} onChange={(v) => setForm((f) => ({ ...f, alert_on_scam: v }))} />
              <span className="text-xs text-slate-400">Alert on SCAM</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <ToggleSwitch size="sm" checked={form.alert_on_suspicious} onChange={(v) => setForm((f) => ({ ...f, alert_on_suspicious: v }))} />
              <span className="text-xs text-slate-400">Alert on SUSPICIOUS</span>
            </label>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FamilyProtection() {
  // ── Family Protection Toggle ─────────────────────────────────────
  const [familyProtectionEnabled, setFamilyProtectionEnabled] = useState(false);

  // ── Contacts State ───────────────────────────────────────────────
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [editTarget, setEditTarget] = useState<Contact | null>(null);

  // ── Add Contact Form ─────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '' as Relationship | '',
    alert_on_scam: true,
    alert_on_suspicious: false,
    consent: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // ── Alerts State ─────────────────────────────────────────────────
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState('');

  // ── Fetch Data ───────────────────────────────────────────────────
  const fetchContacts = useCallback(async () => {
    setContactsLoading(true);
    setContactsError('');
    try {
      const data = await getContacts();
      setContacts(Array.isArray(data) ? data : data.contacts ?? []);
    } catch (e: unknown) {
      setContactsError(e instanceof Error ? e.message : 'Failed to load contacts.');
    } finally {
      setContactsLoading(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setAlertsLoading(true);
    setAlertsError('');
    try {
      const data = await getAlerts();
      setAlerts(Array.isArray(data) ? data : data.alerts ?? []);
    } catch (e: unknown) {
      setAlertsError(e instanceof Error ? e.message : 'Failed to load alert history.');
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchAlerts();
  }, [fetchContacts, fetchAlerts]);

  // ── Form Validation ──────────────────────────────────────────────
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required.';
    if (!formData.phone.trim() && !formData.email.trim())
      errs.contact = 'Provide at least a phone number or email.';
    if (!formData.consent) errs.consent = 'You must provide consent to add this contact.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Add Contact Handler ──────────────────────────────────────────
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormSubmitting(true);
    try {
      const newContact = await createContact({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        relationship: formData.relationship || undefined,
        alert_on_scam: formData.alert_on_scam,
        alert_on_suspicious: formData.alert_on_suspicious,
      });
      setContacts((prev) => [newContact, ...prev]);
      setFormData({
        name: '', phone: '', email: '', relationship: '',
        alert_on_scam: true, alert_on_suspicious: false, consent: false,
      });
      setFormErrors({});
      setFormOpen(false);
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (e: unknown) {
      setFormErrors({ submit: e instanceof Error ? e.message : 'Failed to add contact.' });
    } finally {
      setFormSubmitting(false);
    }
  };

  // ── Toggle Contact Active ────────────────────────────────────────
  const handleToggleActive = async (id: string, active: boolean) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active } : c))
    );
    try {
      await updateContact(id, { active });
    } catch {
      // Revert on error
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !active } : c))
      );
    }
  };

  // ── Delete Contact ───────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteContact(id);
    } catch {
      // Re-fetch if deletion fails
      fetchContacts();
    }
  };

  // ── Edit Contact Save ────────────────────────────────────────────
  const handleEditSave = async (id: string, payload: Partial<Contact>) => {
    const updated = await updateContact(id, payload as Record<string, unknown>);
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  // ── Lookup contact name for alerts ──────────────────────────────
  const contactName = (id: string) =>
    contacts.find((c) => c.id === id)?.name ?? 'Unknown Contact';

  // ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-8 px-4">
      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteModal
          contact={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <EditContactModal
          contact={editTarget}
          onSave={handleEditSave}
          onClose={() => setEditTarget(null)}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20">
            <Users className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Family Protection</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Automatically alert trusted contacts when scams are detected
            </p>
          </div>
        </div>

        {/* ── Success toast ─────────────────────────────────────── */}
        {formSuccess && (
          <div className="flex items-center gap-3 bg-green-400/10 border border-green-400/30 rounded-xl px-4 py-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <span className="text-green-300 text-sm font-medium">Contact added successfully!</span>
          </div>
        )}

        {/* ── 1. Family Protection Toggle Card ─────────────────── */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl transition-colors ${
                  familyProtectionEnabled
                    ? 'bg-cyan-500/15 border border-cyan-500/25'
                    : 'bg-slate-800 border border-slate-700/50'
                }`}
              >
                <Shield
                  className={`w-6 h-6 ${
                    familyProtectionEnabled ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                />
              </div>
              <div>
                <h2 className="text-slate-100 font-semibold text-base">Family Protection Mode</h2>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs mt-0.5 font-medium ${
                    familyProtectionEnabled ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      familyProtectionEnabled ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  {familyProtectionEnabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <ToggleSwitch
              checked={familyProtectionEnabled}
              onChange={setFamilyProtectionEnabled}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/40">
            <p className="text-slate-400 text-sm leading-relaxed">
              When enabled, ScamShield will automatically notify your trusted contacts whenever a
              scam or suspicious message is detected. Contacts are notified via their registered
              phone or email. <span className="text-cyan-400 font-medium">Your message content is
              never shared</span> — only the risk level and category.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-cyan-500" />
                Instant alerts on detection
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-500" />
                Message content stays private
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-500" />
                Per-contact customization
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. Privacy Notice ─────────────────────────────────── */}
        <div className="bg-blue-950/40 backdrop-blur border border-blue-500/20 rounded-2xl p-5">
          <div className="flex gap-3">
            <div className="shrink-0 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 self-start">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-blue-300 font-semibold text-sm mb-1">Privacy & Data Sharing</h3>
              <p className="text-blue-200/70 text-xs leading-relaxed">
                <strong className="text-blue-200">Your message content is NOT automatically shared with contacts.</strong>{' '}
                When an alert is sent, contacts receive only: your name (or alias), the risk level
                (e.g. HIGH), the category (e.g. Phishing), and the detection timestamp. No
                screenshots, transcripts, or message text are included. You control who receives
                alerts and for which severity levels.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Add Contact Section ────────────────────────────── */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Plus className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-slate-100 font-semibold">Add Trusted Contact</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${formOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {formOpen && (
            <form onSubmit={handleAddContact} noValidate>
              <div className="px-5 pb-5 space-y-4 border-t border-slate-700/40 pt-4">

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    className={`w-full bg-slate-800/60 border rounded-xl px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors ${
                      formErrors.name ? 'border-red-500/50' : 'border-slate-700/50 focus:border-cyan-500/50'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>
                  )}
                </div>

                {/* Phone + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 555 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                      className={`w-full bg-slate-800/60 border rounded-xl px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors ${
                        formErrors.contact ? 'border-red-500/50' : 'border-slate-700/50 focus:border-cyan-500/50'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                      className={`w-full bg-slate-800/60 border rounded-xl px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors ${
                        formErrors.contact ? 'border-red-500/50' : 'border-slate-700/50 focus:border-cyan-500/50'
                      }`}
                    />
                  </div>
                </div>
                {formErrors.contact && (
                  <p className="-mt-2 text-xs text-red-400">{formErrors.contact}</p>
                )}

                {/* Relationship */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Relationship
                  </label>
                  <div className="relative">
                    <select
                      value={formData.relationship}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, relationship: e.target.value as Relationship | '' }))
                      }
                      className="w-full appearance-none bg-slate-800/60 border border-slate-700/50 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors pr-8"
                    >
                      <option value="">— Select relationship —</option>
                      {RELATIONSHIP_OPTIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Alert Toggles */}
                <div className="flex flex-wrap gap-6 py-1">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <ToggleSwitch
                      checked={formData.alert_on_scam}
                      onChange={(v) => setFormData((f) => ({ ...f, alert_on_scam: v }))}
                    />
                    <div>
                      <p className="text-slate-200 text-sm font-medium flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-red-400" /> Alert on SCAM
                      </p>
                      <p className="text-slate-500 text-xs">Notify when scam is detected</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <ToggleSwitch
                      checked={formData.alert_on_suspicious}
                      onChange={(v) => setFormData((f) => ({ ...f, alert_on_suspicious: v }))}
                    />
                    <div>
                      <p className="text-slate-200 text-sm font-medium flex items-center gap-1.5">
                        <BellOff className="w-3.5 h-3.5 text-orange-400" /> Alert on SUSPICIOUS
                      </p>
                      <p className="text-slate-500 text-xs">Notify on suspicious content</p>
                    </div>
                  </label>
                </div>

                {/* Consent Checkbox */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    formErrors.consent
                      ? 'border-red-500/40 bg-red-500/5'
                      : formData.consent
                      ? 'border-cyan-500/30 bg-cyan-500/5'
                      : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.consent}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, consent: e.target.checked }))
                      }
                    />
                    <div
                      className={`w-4.5 h-4.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        formData.consent
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'bg-transparent border-slate-600'
                      }`}
                    >
                      {formData.consent && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-200 text-sm font-medium">
                      I consent to share scan alerts with this contact
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Only risk level and category will be shared — never message content.
                    </p>
                    {formErrors.consent && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.consent}</p>
                    )}
                  </div>
                </label>

                {/* Submit error */}
                {formErrors.submit && (
                  <div className="flex items-center gap-2 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-red-400 text-xs">{formErrors.submit}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Adding Contact…
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Contact
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── 4. Contacts List ──────────────────────────────────── */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-100 font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Trusted Contacts
              {contacts.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40">
                  {contacts.length}
                </span>
              )}
            </h2>
            <button
              onClick={fetchContacts}
              disabled={contactsLoading}
              className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors disabled:opacity-50"
              title="Refresh contacts"
            >
              <RefreshCw className={`w-4 h-4 ${contactsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {contactsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-800/40 animate-pulse border border-slate-700/30" />
              ))}
            </div>
          ) : contactsError ? (
            <div className="flex items-center gap-3 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium">Failed to load contacts</p>
                <p className="text-red-400/70 text-xs mt-0.5">{contactsError}</p>
              </div>
              <button
                onClick={fetchContacts}
                className="ml-auto text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No contacts yet</p>
              <p className="text-slate-600 text-xs mt-1">
                Add a trusted contact above to start receiving alerts
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onToggleActive={handleToggleActive}
                  onDelete={setDeleteTarget}
                  onEdit={setEditTarget}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── 5. Alert History ──────────────────────────────────── */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-100 font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Alert History
            </h2>
            <button
              onClick={fetchAlerts}
              disabled={alertsLoading}
              className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors disabled:opacity-50"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-4 h-4 ${alertsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Simulated notice */}
          <div className="flex items-start gap-2 bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-4 py-3 mb-4">
            <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-yellow-200/80 text-xs leading-relaxed">
              <span className="font-semibold text-yellow-300">Simulated</span> alerts are logged for
              testing purposes only and are{' '}
              <span className="font-semibold text-yellow-300">NOT actually delivered</span> to your
              contacts. Only <span className="font-semibold text-green-400">Sent</span> alerts have
              been delivered.
            </p>
          </div>

          {alertsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-800/40 animate-pulse border border-slate-700/30" />
              ))}
            </div>
          ) : alertsError ? (
            <div className="flex items-center gap-3 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium">Failed to load alert history</p>
                <p className="text-red-400/70 text-xs mt-0.5">{alertsError}</p>
              </div>
              <button
                onClick={fetchAlerts}
                className="ml-auto text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No alerts sent yet</p>
              <p className="text-slate-600 text-xs mt-1">
                Alerts will appear here once a scan triggers a notification
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((alert) => {
                const sc = statusConfig[alert.status] ?? statusConfig.simulated;
                return (
                  <div
                    key={alert.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3 hover:border-slate-600/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${sc.bg}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${sc.dotColor}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-200 text-sm font-medium truncate">
                            {contactName(alert.contact_id)}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${verdictColor(alert.verdict)}`}
                          >
                            {alert.verdict}
                          </span>
                          <span className="text-xs text-slate-500">{alert.category}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className={`text-xs font-semibold ${sc.color}`}>{sc.label}</span>
                          {alert.status === 'simulated' && (
                            <span className="text-xs text-slate-600 italic">Not delivered</span>
                          )}
                          <span className={`text-xs font-medium ${riskColor(alert.risk_score)}`}>
                            Risk {alert.risk_score}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 sm:text-right">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-xs text-slate-500">{formatDate(alert.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer spacing ─────────────────────────────────────── */}
        <div className="h-4" />
      </div>
    </div>
  );
}
