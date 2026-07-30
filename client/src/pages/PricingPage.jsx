import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initializePaddle } from "@paddle/paddle-js";
import { getBillingConfig } from "../services/api";
import { Sparkles, Database, MessageSquare, Zap, CheckCircle2, Loader2 } from "lucide-react";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 15000;
const REDIRECT_DELAY_MS = 4000;

export function PricingPage() {
    const navigate = useNavigate();
    const [paddle, setPaddle] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false); // true while polling after checkout
    const pollTimerRef = useRef(null);
    const redirectTimerRef = useRef(null);

    useEffect(() => {
        async function setup() {
            const { data } = await getBillingConfig();
            setConfig(data);

            const paddleInstance = await initializePaddle({
                environment: data.environment,
                token: data.client_side_token,
                eventCallback: (event) => {
                    if (event.name === "checkout.completed") {
                        startConfirmingPro();
                    }
                },
            });
            setPaddle(paddleInstance);
        }
        setup();

        return () => {
            clearInterval(pollTimerRef.current);
            clearTimeout(redirectTimerRef.current);
        };
    }, []);

    // Poll the backend until the webhook has actually updated plan to "pro",
    // instead of trusting the client-side checkout event alone.
    function startConfirmingPro() {
        setConfirming(true);
        const startedAt = Date.now();

        pollTimerRef.current = setInterval(async () => {
            const { data } = await getBillingConfig();
            setConfig(data);

            if (data.plan === "pro") {
                clearInterval(pollTimerRef.current);
                setConfirming(false);
                redirectTimerRef.current = setTimeout(() => {
                    navigate("/");
                }, REDIRECT_DELAY_MS);
            } else if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
                clearInterval(pollTimerRef.current);
                setConfirming(false); // stop polling; config.plan is still "free" here, so upgrade screen shows again with a note
            }
        }, POLL_INTERVAL_MS);
    }

    function handleUpgrade() {
        if (!paddle || !config) return;
        setLoading(true);
        paddle.Checkout.open({
            items: [{ priceId: config.price_id, quantity: 1 }],
            customer: { email: config.user_email },
            customData: { user_id: config.user_id },
        });
        setLoading(false);
    }

    const isPro = config?.plan === "pro";

    // Payment done client-side, waiting for our backend/webhook to confirm
    if (confirming) {
        return (
            <div className="min-h-screen bg-tc-bg text-tc-text flex items-center justify-center px-6">
                <div className="max-w-md rounded-3xl border border-tc-border bg-tc-surface/80 p-10 text-center shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-tc-accent" />
                    <h2 className="mt-4 text-xl font-semibold">Confirming your payment...</h2>
                    <p className="mt-2 text-tc-muted">This usually takes just a few seconds.</p>
                </div>
            </div>
        );
    }

    // Confirmed pro (either on page load, or right after successful poll)
    if (isPro) {
        return (
            <div className="min-h-screen bg-tc-bg text-tc-text flex items-center justify-center px-6">
                <div className="max-w-md rounded-3xl border border-tc-border bg-tc-surface/80 p-10 text-center shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-tc-accent" />
                    <h2 className="mt-4 text-2xl font-bold">You're on TubeChat Pro 🎉</h2>
                    <p className="mt-2 text-tc-muted">
                        Unlimited video indexing and unlimited AI conversations are unlocked.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-6 rounded-xl bg-tc-accent px-6 py-3 font-medium text-[#1a0f05] transition-all hover:scale-[1.02]"
                    >
                        Go to Home
                    </button>
                    <p className="mt-3 text-xs text-tc-muted">Redirecting you shortly...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tc-bg text-tc-text">
            {/* Hero */}
            <section className="mx-auto max-w-5xl px-5 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-10 text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    Upgrade to <span className="text-tc-accent">TubeChat Pro</span>
                </h1>
                <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-tc-muted sm:text-lg sm:leading-8">
                    Unlock unlimited video indexing, unlimited AI conversations, and
                    premium features designed for researchers, students, and creators.
                </p>
            </section>

            {/* Pricing Card */}
            <section className="mx-auto max-w-6xl px-5 sm:px-6">
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
                    {/* Checkout Card */}
                    <div className="rounded-3xl border border-tc-border bg-gradient-to-b from-tc-surface to-tc-bg p-8 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">
                        <div className="mb-5 inline-flex rounded-full border border-tc-accent/20 bg-tc-accent/10 px-4 py-1 text-sm font-medium text-tc-accent">
                            Most Popular
                        </div>

                        <h2 className="text-3xl font-bold">TubeChat Pro</h2>

                        <div className="mt-8">
                            <div className="flex items-end gap-2">
                                <span className="text-6xl font-bold">$6.99</span>
                                <span className="mb-2 text-lg text-tc-muted">/month</span>
                            </div>
                            <p className="mt-3 text-sm text-tc-muted">
                                Cancel anytime. No hidden charges.
                            </p>
                        </div>

                        <button
                            onClick={handleUpgrade}
                            disabled={!paddle || loading}
                            className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-tc-accent px-6 py-4 text-lg font-semibold text-[#1a0f05] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Loading..." : "Upgrade to Pro"}
                        </button>

                        <div className="mt-8 space-y-3 border-t border-tc-border pt-6 text-sm text-tc-muted">
                            <div className="flex items-center justify-between">
                                <span>Video Indexing</span>
                                <span className="font-medium text-tc-text">Unlimited</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>AI Conversations</span>
                                <span className="font-medium text-tc-text">Unlimited</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Support</span>
                                <span className="font-medium text-tc-text">Priority</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Future Pro Features</span>
                                <span className="font-medium text-tc-text">Included</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}