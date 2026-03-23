import React, { useState } from "react";
import { FaPen, FaSync, FaTrash, FaFilter } from "react-icons/fa";

const mockChannels = [
  {
    id: 72,
    storeName: "asdsd",
    channel: "Shopify",
    apiKey: "sdsd",
    apiSecretKey: "—",
    status: true,
  },
];

const ChannelIntegration = () => {
  const [channels, setChannels] = useState(mockChannels);

  const toggleStatus = (id) => {
    setChannels(
      channels.map((ch) => (ch.id === id ? { ...ch, status: !ch.status } : ch)),
    );
  };

  return (
    <div className="flex-1 p-6 space-y-5">
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Channel Integration
        </h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">
            Channel Integration
          </span>
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Channel Integration
        </h2>
        <button className="border border-[#d4af26] text-[#d4af26] hover:bg-[#d4af26] hover:text-white text-sm font-semibold px-5 py-2 rounded-md transition-colors">
          Add Channel Manually
        </button>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            Connected Channels
          </h3>
          <button className="text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors">
            <FaFilter className="text-sm" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  ID
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Store Name/Channel ID
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Channel
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  API Key
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  API Secret Key
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Status
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {channels.map((ch) => (
                <tr
                  key={ch.id}
                  className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="p-3 text-center text-sm font-bold text-[var(--color-text-primary)]">
                    {ch.id}
                  </td>
                  <td className="p-3 text-center text-sm text-[var(--color-text-primary)]">
                    {ch.storeName}
                  </td>
                  <td className="p-3 text-center text-sm text-[var(--color-text-primary)]">
                    {ch.channel}
                  </td>
                  <td className="p-3 text-center text-sm text-[var(--color-text-primary)]">
                    {ch.apiKey}
                  </td>
                  <td className="p-3 text-center text-sm text-[var(--color-text-secondary)]">
                    {ch.apiSecretKey}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleStatus(ch.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ch.status ? "bg-[#d4af26]" : "bg-gray-500"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ch.status ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors"
                        title="Edit"
                      >
                        <FaPen className="text-xs" />
                      </button>
                      <button
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors"
                        title="Sync"
                      >
                        <FaSync className="text-xs" />
                      </button>
                      <button
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChannelIntegration;
