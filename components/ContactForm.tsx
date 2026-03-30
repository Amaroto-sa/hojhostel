"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle, RefreshCw, MessageSquare } from "lucide-react";

export default function ContactForm() {
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0, input: "" });

    const generateCaptcha = () => {
        const n1 = Math.floor(Math.random() * 9) + 1;
        const n2 = Math.floor(Math.random() * 9) + 1;
        setCaptcha({ num1: n1, num2: n2, answer: n1 + n2, input: "" });
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    const resetForm = () => {
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        setSuccess(false);
        setError("");
        generateCaptcha();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        if (parseInt(captcha.input) !== captcha.answer) {
            setError("Incorrect captcha answer. Are you human?");
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch("/api/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    captchaAnswer: captcha.answer,
                    captchaInput: captcha.input,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to send inquiry");
                generateCaptcha();
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("Something went wrong. Please try again later.");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="glass p-10 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 mb-6 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                    <CheckCircle2 size={40} />
                </div>
                <h3 className="font-display text-2xl mb-3 text-white">Inquiry Sent Successfully!</h3>
                <p className="text-[#b1b1ba] mb-8 max-w-sm mx-auto">Thank you for reaching out. Our team has received your message and will get back to you shortly.</p>
                <button
                    onClick={resetForm}
                    className="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 transition font-bold text-sm"
                >
                    Send Another Message
                </button>
            </div>
        );
    }

    return (
        <div className="glass p-8 md:p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 -translate-y-4 translate-x-4 pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                <MessageSquare size={120} />
            </div>

            <div className="mb-8">
                <h3 className="font-display text-2xl mb-2 text-white">Send us a Message</h3>
                <p className="text-[#b1b1ba] text-sm">Have an inquiry? Fill the form below for a quick response.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#ff7a1a] transition-all placeholder:text-gray-600"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="john@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#ff7a1a] transition-all placeholder:text-gray-600"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Phone (Optional)</label>
                        <input
                            type="tel"
                            placeholder="+234..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#ff7a1a] transition-all placeholder:text-gray-600"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Subject</label>
                        <input
                            type="text"
                            required
                            placeholder="General Inquiry"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#ff7a1a] transition-all placeholder:text-gray-600"
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Your Message</label>
                    <textarea
                        required
                        rows={4}
                        placeholder="Tell us how we can help you..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#ff7a1a] transition-all placeholder:text-gray-600 resize-none"
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                    />
                </div>

                {/* SELF CAPTCHA */}
                <div className="p-4 rounded-xl bg-[rgba(255,122,26,0.05)] border border-[rgba(255,122,26,0.1)] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="font-bold text-[#ff7a1a] tracking-widest text-lg bg-[#ff7a1a]/10 px-4 py-2 rounded-lg border border-[#ff7a1a]/20">
                            {captcha.num1} + {captcha.num2} = ?
                        </div>
                        <button type="button" onClick={generateCaptcha} className="text-gray-500 hover:text-[#ff7a1a] transition p-1">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                    <input
                        type="number"
                        required
                        placeholder="Sum"
                        value={captcha.input}
                        onChange={e => setCaptcha({ ...captcha, input: e.target.value })}
                        className="w-24 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-center text-white font-bold focus:outline-none focus:border-[#ff7a1a]"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in slide-in-from-top-2">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-extrabold py-4 rounded-xl shadow-[0_10px_30px_rgba(255,122,26,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base"
                >
                    {submitting ? (
                        <>
                            <RefreshCw className="animate-spin" size={20} />
                            Sending Inqury...
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            Send Message
                        </>
                    )}
                </button>

                <p className="text-[10px] text-[#b1b1ba] text-center mt-4">
                    Your information is secure. We never share your data with third parties or marketers.
                </p>
            </form>
        </div>
    );
}
