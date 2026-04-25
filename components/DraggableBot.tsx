"use client";

import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Image as ImageIcon } from "lucide-react";

export default function DraggableBot() {
    const [position, setPosition] = useState({ x: -1, y: -1 });
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const botRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"ASK" | "DONE" | "DISMISSED">("ASK");
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    // Load configuration
    useEffect(() => {
        fetch("/api/settings").then(r => r.json()).then(data => {
            setSettings(data);
            if (typeof window !== "undefined") {
                // Default position bottom right with arbitrary safe offset
                setPosition({
                    x: window.innerWidth - 350,
                    y: window.innerHeight - 250
                });
            }
            setLoading(false);

            // Don't auto-pop if they already turned it on! Just stay as a quiet icon
            if (data.pictorial_display_enabled === "true") {
                setStep("DISMISSED");
            } else {
                // Auto pop open the greeting after 3 seconds
                setTimeout(() => setIsOpen(true), 3000);
            }
        });
    }, []);

    const handlePointerDown = (e: React.PointerEvent) => {
        // Don't trigger drag if clicking interacting elements
        if ((e.target as HTMLElement).closest('button')) return;
        setDragging(true);
        const rect = botRef.current!.getBoundingClientRect();
        setOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (dragging) {
            setPosition({
                x: e.clientX - offset.x,
                y: e.clientY - offset.y
            });
        }
    };

    const handlePointerUp = () => setDragging(false);

    useEffect(() => {
        if (dragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [dragging, offset]);

    async function handleResponse(isYes: boolean) {
        if (isYes) {
            await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "pictorial_display_enabled", value: "true" })
            });
        }
        setStep("DONE");
    }

    if (loading || step === "DISMISSED") return null;

    const botName = settings.bot_greeting_name || "Miss Azubuike";
    const botInitials = settings.bot_avatar_initials || "HOJ";

    return (
        <div
            ref={botRef}
            onPointerDown={handlePointerDown}
            style={{
                position: 'fixed',
                left: position.x >= 0 ? position.x : 'auto',
                top: position.y >= 0 ? position.y : 'auto',
                touchAction: 'none'
            }}
            className="z-[9999] cursor-grab active:cursor-grabbing flex flex-col items-end gap-3 drop-shadow-2xl"
        >
            {isOpen && (
                <div className={`bg-[#121216] border border-[#ff7a1a]/40 shadow-[0_10px_40px_rgba(255,122,26,0.15)] rounded-2xl p-5 w-[300px] transform origin-bottom border-b-4 border-b-[#ff7a1a]`}>
                    <button onClick={() => setStep("DISMISSED")} className="absolute top-3 right-3 text-gray-500 hover:text-white transition">
                        <X size={16} />
                    </button>
                    <div className="flex gap-3 items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] flex items-center justify-center text-[#111] font-black text-sm shadow-md shrink-0">
                            {botInitials}
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm leading-tight">Project AI</h4>
                            <p className="text-[10px] uppercase tracking-wider text-green-400 font-bold flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>

                    <div className="text-sm text-gray-200 mb-5 leading-relaxed font-medium">
                        {step === "ASK" ? (
                            <p>Hi <b className="text-white bg-white/10 px-1 py-0.5 rounded">{botName}</b>, {settings.bot_greeting_text || "are photos ready for rooms?"}</p>
                        ) : (
                            <p>Alright, I'll be around anytime you need me 😘<br /><span className="text-xs text-gray-500 mt-2 block font-normal">(You can still configure this manually in your Admin site settings.)</span></p>
                        )}
                    </div>

                    {step === "ASK" ? (
                        <div className="flex gap-2 w-full">
                            <button onClick={() => handleResponse(true)} className="flex-[3] py-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white font-bold hover:brightness-110 !cursor-pointer transition flex items-center justify-center gap-1.5 text-xs shadow-lg">
                                <ImageIcon size={14} /> Yes, display photos
                            </button>
                            <button onClick={() => handleResponse(false)} className="flex-[2] py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 !cursor-pointer transition text-xs">
                                Not yet
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setStep("DISMISSED")} className="w-full py-2.5 rounded-xl bg-[#ff7a1a] text-[#111] font-bold hover:brightness-110 transition text-xs shadow-lg !cursor-pointer">
                            Close window
                        </button>
                    )}
                </div>
            )}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-[#121216] border-2 border-[#ff7a1a] shadow-[0_0_20px_rgba(255,122,26,0.3)] flex items-center justify-center text-[#ff7a1a] hover:bg-[#ff7a1a] hover:text-[#111] transition-all cursor-pointer z-50 float-right self-end"
            >
                <Sparkles size={24} className={isOpen ? "rotate-45" : ""} />
            </div>
        </div>
    );
}
