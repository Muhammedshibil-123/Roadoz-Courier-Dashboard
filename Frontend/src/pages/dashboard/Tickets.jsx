import React, { useState, useEffect } from 'react';
import {
  FaTicketAlt, FaPlus, FaTimes, FaPaperPlane, FaChevronDown, FaChevronUp,
  FaExclamationTriangle, FaClock, FaCheckCircle, FaFilter, FaCommentDots,
} from 'react-icons/fa';
import api from '../../lib/axios';

const CATEGORIES = [
  { value: 'DELIVERY_ISSUE', label: 'Delivery Issue' },
  { value: 'WEIGHT_DISPUTE', label: 'Weight Dispute' },
  { value: 'STUCK_IN_TRANSIT', label: 'Stuck in Transit' },
  { value: 'PAYMENT_ISSUE', label: 'Payment Issue' },
  { value: 'OTHER', label: 'Other' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'text-gray-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-blue-400' },
  { value: 'HIGH', label: 'High', color: 'text-orange-400' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-400' },
];

const priorityColor = (p) => {
  const map = { LOW: 'text-gray-400', MEDIUM: 'text-blue-400', HIGH: 'text-orange-400', URGENT: 'text-red-400' };
  return map[p] || 'text-gray-400';
};

const priorityBg = (p) => {
  const map = { LOW: 'bg-gray-500/10', MEDIUM: 'bg-blue-500/10', HIGH: 'bg-orange-500/10', URGENT: 'bg-red-500/10' };
  return map[p] || 'bg-gray-500/10';
};

const statusBadge = (s) => {
  switch (s) {
    case 'OPEN': return 'bg-[#d4af26]/20 text-[#d4af26]';
    case 'ANSWERED': return 'bg-green-500/20 text-green-400';
    case 'CLOSED': return 'bg-gray-500/20 text-gray-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState({ total: 0, open: 0, answered: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  // Create form state
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formCategory, setFormCategory] = useState('OTHER');
  const [formPriority, setFormPriority] = useState('MEDIUM');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusParam = filter !== 'ALL' ? `?status=${filter}` : '';
      const [ticketsRes, summaryRes] = await Promise.all([
        api.get(`/api/auth/tickets/${statusParam}`, { skipLoading: true }),
        api.get('/api/auth/tickets/summary/', { skipLoading: true }),
      ]);
      setTickets(ticketsRes.data);
      setSummary(summaryRes.data);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleCreate = async () => {
    if (!formSubject.trim() || !formMessage.trim()) return;
    setCreating(true);
    try {
      await api.post('/api/auth/tickets/', {
        subject: formSubject,
        message: formMessage,
        category: formCategory,
        priority: formPriority,
      });
      setShowCreateModal(false);
      setFormSubject('');
      setFormMessage('');
      setFormCategory('OTHER');
      setFormPriority('MEDIUM');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.detail || 'Failed to create ticket.');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/auth/tickets/${ticketId}/reply/`, { message: replyText });
      setReplyText('');
      fetchData();
    } catch {
      alert('Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = async (ticketId) => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;
    try {
      await api.post(`/api/auth/tickets/${ticketId}/close/`);
      fetchData();
    } catch {
      alert('Failed to close ticket.');
    }
  };

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[#d4af26] transition-colors w-full';

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Support Tickets</h1>
          <p className="text-xs mt-0.5">
            <span className="text-[#d4af26]">Dashboard</span>
            <span className="text-[var(--color-text-secondary)]"> &gt; </span>
            <span className="text-[var(--color-text-secondary)]">Tickets</span>
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-5 py-2.5 rounded-md transition-colors"
        >
          <FaPlus className="text-[10px]" /> Create Ticket
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: summary.total, icon: FaTicketAlt, color: 'text-[#d4af26]', bg: 'bg-[#d4af26]/10' },
          { label: 'Open', value: summary.open, icon: FaExclamationTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Answered', value: summary.answered, icon: FaCommentDots, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Closed', value: summary.closed, icon: FaCheckCircle, color: 'text-gray-400', bg: 'bg-gray-500/10' },
        ].map((card) => (
          <div key={card.label} className="bg-[var(--color-bg-surface)] rounded-lg p-4 border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">{card.label}</p>
              <div className={`w-7 h-7 rounded-full ${card.bg} flex items-center justify-center`}>
                <card.icon className={`${card.color} text-xs`} />
              </div>
            </div>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filter + Content */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">My Tickets</h2>
          <div className="flex items-center gap-3">
            <FaFilter className="text-[var(--color-text-secondary)] text-xs" />
            <select className={`${inputClass} !w-36`} value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL" className="bg-white dark:bg-[#1a2332]">All</option>
              <option value="OPEN" className="bg-white dark:bg-[#1a2332]">Open</option>
              <option value="ANSWERED" className="bg-white dark:bg-[#1a2332]">Answered</option>
              <option value="CLOSED" className="bg-white dark:bg-[#1a2332]">Closed</option>
            </select>
            <button onClick={fetchData} className="bg-[#d4af26]/20 text-[#d4af26] hover:bg-[#d4af26]/30 text-xs font-semibold px-4 py-2 rounded-md transition-colors border border-[#d4af26]/30">
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[var(--color-border)]/50 flex items-center justify-center mx-auto">
              <FaTicketAlt className="text-[var(--color-text-secondary)] text-xl" />
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">No tickets found</p>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
              Having an issue with an order? Click "Create Ticket" to reach our support team.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                {/* Ticket Header */}
                <div
                  className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedTicket(expandedTicket === t.ticket_id ? null : t.ticket_id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg ${priorityBg(t.priority)} flex items-center justify-center flex-shrink-0`}>
                      <FaTicketAlt className={`${priorityColor(t.priority)} text-sm`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#d4af26]">{t.ticket_id}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadge(t.status)}`}>{t.status}</span>
                        <span className={`text-[9px] font-semibold ${priorityColor(t.priority)}`}>{t.priority}</span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate mt-0.5">{t.subject}</p>
                      <p className="text-[10px] text-[var(--color-text-secondary)]">
                        {t.category?.replace('_', ' ')} {t.order_tracking_id && `• Order: ${t.order_tracking_id}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-[var(--color-text-secondary)]">Replies</p>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">{t.reply_count}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-[var(--color-text-secondary)]">Created</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{formatDate(t.created_at)}</p>
                    </div>
                    <div className="text-[var(--color-text-secondary)]">
                      {expandedTicket === t.ticket_id ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                    </div>
                  </div>
                </div>

                {/* Expanded: Chat Thread */}
                {expandedTicket === t.ticket_id && (
                  <div className="border-t border-[var(--color-border)] bg-black/5 dark:bg-white/5 px-4 py-4 space-y-4">
                    {/* Original Message */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#d4af26]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-[#d4af26]">You</span>
                      </div>
                      <div className="flex-1 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3">
                        <p className="text-xs text-[var(--color-text-primary)] whitespace-pre-line">{t.message}</p>
                        <p className="text-[9px] text-[var(--color-text-secondary)] mt-2">{formatDate(t.created_at)}</p>
                      </div>
                    </div>

                    {/* Replies */}
                    {t.replies?.map((r) => (
                      <div key={r.id} className={`flex gap-3 ${r.is_admin ? '' : 'flex-row-reverse'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${r.is_admin ? 'bg-green-500/20' : 'bg-[#d4af26]/20'}`}>
                          <span className={`text-[10px] font-bold ${r.is_admin ? 'text-green-400' : 'text-[#d4af26]'}`}>
                            {r.is_admin ? 'RDZ' : 'You'}
                          </span>
                        </div>
                        <div className={`flex-1 max-w-[80%] border rounded-lg p-3 ${
                          r.is_admin 
                            ? 'bg-[var(--color-bg-surface)] border-green-500/20' 
                            : 'bg-[var(--color-bg-surface)] border-[var(--color-border)]'
                        }`}>
                          <p className={`text-[10px] font-bold mb-1 ${r.is_admin ? 'text-green-400' : 'text-[#d4af26]'}`}>
                            {r.sender}
                          </p>
                          <p className="text-xs text-[var(--color-text-primary)] whitespace-pre-line">{r.message}</p>
                          <p className="text-[9px] text-[var(--color-text-secondary)] mt-2">{formatDate(r.created_at)}</p>
                        </div>
                      </div>
                    ))}

                    {/* Reply Input (only if not closed) */}
                    {t.status !== 'CLOSED' ? (
                      <div className="flex gap-2 items-end">
                        <textarea
                          className={`${inputClass} resize-none min-h-[60px]`}
                          placeholder="Type your reply..."
                          value={expandedTicket === t.ticket_id ? replyText : ''}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                        />
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => handleReply(t.ticket_id)}
                            disabled={sending || !replyText.trim()}
                            className="p-2.5 bg-[#d4af26] hover:bg-[#c39f19] text-white rounded-md transition-colors disabled:opacity-50"
                            title="Send Reply"
                          >
                            <FaPaperPlane className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleClose(t.ticket_id)}
                            className="p-2.5 bg-gray-500/20 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-md transition-colors"
                            title="Close Ticket"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-500/10 rounded-md p-3 text-center">
                        <p className="text-xs text-gray-400">This ticket is closed. Create a new ticket for further assistance.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">Create Support Ticket</h3>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">Describe your issue and our team will respond</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors">
                <FaTimes />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold mb-1 block">Category</label>
                  <select className={inputClass} value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value} className="bg-white dark:bg-[#1a2332]">{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold mb-1 block">Priority</label>
                  <select className={inputClass} value={formPriority} onChange={(e) => setFormPriority(e.target.value)}>
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value} className="bg-white dark:bg-[#1a2332]">{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold mb-1 block">Subject *</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Order #12345 marked delivered but customer didn't receive"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold mb-1 block">Describe the issue *</label>
                <textarea
                  className={`${inputClass} resize-none min-h-[120px]`}
                  placeholder="Explain the problem in detail. Include order IDs, dates, and any relevant information..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  rows={5}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-semibold px-4 py-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !formSubject.trim() || !formMessage.trim()}
                className="flex items-center gap-2 bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-5 py-2.5 rounded-md transition-colors disabled:opacity-50"
              >
                {creating ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaPaperPlane className="text-[10px]" />
                )}
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
