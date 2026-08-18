"use client";

import { useState } from "react";
import { Send, Clock, CheckCircle2, AlertCircle, MessageSquare, Info, Users } from "lucide-react";

export default function BroadcastClient({ initialHistory }: { initialHistory: any[] }) {
    const [history, setHistory] = useState(initialHistory);
    const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");
    
    // Form state
    const [messageType, setMessageType] = useState<"TEMPLATE" | "CUSTOM">("TEMPLATE");
    const [templateName, setTemplateName] = useState("");
    const [message, setMessage] = useState("");
    const [audience, setAudience] = useState("ACTIVE_RESIDENTS");
    const [customNumbers, setCustomNumbers] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error", msg: string } | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);

        try {
            const res = await fetch("/api/admin/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: messageType,
                    templateName: messageType === "TEMPLATE" ? templateName : undefined,
                    message: messageType === "CUSTOM" ? message : undefined,
                    targetAudience: audience,
                    customNumbers: audience === "CUSTOM_NUMBERS" ? customNumbers : undefined
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to send broadcast");

            setFeedback({ type: "success", msg: `Broadcast processed! Sent to ${data.data.sent} out of ${data.data.total} active recipients.` });
            
            if (messageType === "CUSTOM") setMessage("");
            if (messageType === "TEMPLATE") setTemplateName("");
            
            // Note: Ideally we would refresh the history here, but we'll let the user switch tabs or refresh
        } catch (err: any) {
            setFeedback({ type: "error", msg: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-white/10 mb-8 pb-px">
                <button 
                    onClick={() => setActiveTab("compose")}
                    className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${activeTab === "compose" ? "text-[#ff7a1a]" : "text-[#b1b1ba] hover:text-white"}`}
                >
                    Compose Message
                    {activeTab === "compose" && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#ff7a1a] rounded-t-full shadow-[0_0_10px_rgba(255,122,26,0.5)]"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab("history")}
                    className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${activeTab === "history" ? "text-[#ff7a1a]" : "text-[#b1b1ba] hover:text-white"}`}
                >
                    Broadcast History
                    {activeTab === "history" && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#ff7a1a] rounded-t-full shadow-[0_0_10px_rgba(255,122,26,0.5)]"></div>}
                </button>
            </div>

            {/* Compose View */}
            {activeTab === "compose" && (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#121216] rounded-2xl border border-white/5 p-6 shadow-card">
                            <form onSubmit={handleSend} className="space-y-6">
                                
                                {feedback && (
                                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${feedback.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                                        {feedback.type === "success" ? <CheckCircle2 className="shrink-0" /> : <AlertCircle className="shrink-0" />}
                                        <p className="text-sm font-medium">{feedback.msg}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-[#f5f5f7] mb-2">Target Audience</label>
                                    <select 
                                        value={audience} 
                                        onChange={(e) => setAudience(e.target.value)}
                                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors appearance-none"
                                    >
                                        <option value="ACTIVE_RESIDENTS">Active Residents (Default + Auto-Fallback)</option>
                                        <option value="ALL_RESIDENTS">All Hostel Residents (Any Status)</option>
                                        <option value="BOOKINGS">All Guest Bookings</option>
                                        <option value="ALL">Everyone (Residents + Bookings + Customer Profiles)</option>
                                        <option value="CUSTOM_NUMBERS">Custom Phone Numbers (Manual Entry)</option>
                                    </select>
                                </div>

                                {audience === "CUSTOM_NUMBERS" && (
                                    <div>
                                        <label className="block text-sm font-medium text-[#f5f5f7] mb-2">Enter Phone Numbers</label>
                                        <textarea 
                                            required
                                            value={customNumbers}
                                            onChange={(e) => setCustomNumbers(e.target.value)}
                                            placeholder="Enter phone numbers separated by commas or newlines (e.g. 08012345678, 09087654321)"
                                            rows={3}
                                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors resize-none"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-[#f5f5f7] mb-2">Message Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`cursor-pointer flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${messageType === "TEMPLATE" ? "bg-[#ff7a1a]/10 border-[#ff7a1a] text-[#ff7a1a]" : "bg-[#0a0a0c] border-white/10 text-[#b1b1ba] hover:bg-white/5"}`}>
                                            <input type="radio" className="hidden" checked={messageType === "TEMPLATE"} onChange={() => setMessageType("TEMPLATE")} />
                                            Meta Template
                                        </label>
                                        <label className={`cursor-pointer flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${messageType === "CUSTOM" ? "bg-[#ff7a1a]/10 border-[#ff7a1a] text-[#ff7a1a]" : "bg-[#0a0a0c] border-white/10 text-[#b1b1ba] hover:bg-white/5"}`}>
                                            <input type="radio" className="hidden" checked={messageType === "CUSTOM"} onChange={() => setMessageType("CUSTOM")} />
                                            Custom Text
                                        </label>
                                    </div>
                                </div>

                                {messageType === "TEMPLATE" ? (
                                    <div>
                                        <label className="block text-sm font-medium text-[#f5f5f7] mb-2">Template Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={templateName}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                            placeholder="e.g., maintenance_alert"
                                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors"
                                        />
                                        <p className="text-xs text-[#b1b1ba] mt-2 flex items-center gap-1">
                                            <Info size={14} /> Must match the exact template name approved in your Meta Business Suite.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-[#f5f5f7] mb-2">Message Body</label>
                                        <textarea 
                                            required
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Type your message here..."
                                            rows={5}
                                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors resize-none"
                                        />
                                        <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                                            <AlertCircle size={14} /> Warning: Custom messages will fail if the resident has not messaged the hostel within the last 24 hours.
                                        </p>
                                    </div>
                                )}

                                <button 
                                    disabled={isSubmitting || (messageType === "TEMPLATE" ? !templateName : !message) || (audience === "CUSTOM_NUMBERS" && !customNumbers)}
                                    type="submit"
                                    className="w-full bg-[#ff7a1a] hover:bg-[#ff9f5a] text-black font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                    ) : (
                                        <><Send size={18} /> Send Broadcast</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="hidden lg:block">
                        <div className="bg-[#121216] rounded-2xl border border-white/5 p-6 shadow-card sticky top-24">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-[#ff7a1a]" /> WhatsApp Preview</h3>
                            
                            <div className="bg-[#efeae2] rounded-xl p-4 min-h-[250px] relative overflow-hidden shadow-inner flex flex-col justify-end">
                                {/* Chat Background Pattern (Simulated) */}
                                <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/86/Whatsapp_chat_background.png')] bg-cover"></div>
                                
                                <div className="relative z-10 bg-white p-3 rounded-tr-lg rounded-bl-lg rounded-br-lg shadow-sm max-w-[85%] self-start text-sm text-gray-800 break-words mb-2">
                                    {messageType === "TEMPLATE" ? (
                                        <span className="italic text-gray-500">[Template: {templateName || "template_name"}]</span>
                                    ) : (
                                        message || "Your message will appear here..."
                                    )}
                                    <div className="text-[10px] text-gray-400 text-right mt-1">12:00 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History View */}
            {activeTab === "history" && (
                <div className="bg-[#121216] rounded-2xl border border-white/5 overflow-hidden shadow-card">
                    {history.length === 0 ? (
                        <div className="p-12 text-center">
                            <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white">No broadcasts yet</h3>
                            <p className="text-[#b1b1ba] text-sm mt-1">Your broadcast history will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="px-6 py-4 text-xs font-semibold text-[#b1b1ba] uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#b1b1ba] uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#b1b1ba] uppercase tracking-wider">Message</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#b1b1ba] uppercase tracking-wider">Audience</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#b1b1ba] uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#b1b1ba] uppercase tracking-wider">Delivery Stats</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {history.map((item, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#f5f5f7]">
                                                {new Date(item.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#b1b1ba]">
                                                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs">{item.type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#f5f5f7] max-w-[200px] truncate">
                                                {item.type === "TEMPLATE" ? item.templateName : item.message}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#b1b1ba]">
                                                <div className="flex items-center gap-1.5"><Users size={14} /> {item.totalRecipients}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${item.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' : item.status === 'FAILED' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs">
                                                <div className="flex gap-3 text-[#b1b1ba]">
                                                    <span className="text-blue-400" title="Sent">{item.stats.sent} S</span>
                                                    <span className="text-gray-300" title="Delivered">{item.stats.delivered} D</span>
                                                    <span className="text-green-400" title="Read">{item.stats.read} R</span>
                                                    <span className="text-red-400" title="Failed">{item.stats.failed} F</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
