import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import {
  Home,
  MessageSquare,
  LogIn,
  UserPlus,
  Sparkles,
  Database,
  Zap,
  ArrowRight,
  Code2,
} from "lucide-react";

import { IndexForm } from "../components/IndexForm";
import { indexVideo } from "../services/api";
import { useAuth } from "../contexts/AppContext";

function formatError(error) {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export function IndexPage() {
  const navigate = useNavigate();
  const { user, initializeAuth } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      videoUrl: "",
    },
  });

  async function onSubmit({ videoUrl }) {
    setIsLoading(true);
    setApiError("");
    setResult(null);

    try {
      const data = await indexVideo(videoUrl);

      if (data?.session_id) {
        setResult({
          youtubeId: data.youtube_id,
          message: "Video indexed successfully. Redirecting...",
        });

        reset();

        // Refresh auth state in case a guest cookie was generated
        await initializeAuth();

        setTimeout(() => {
          navigate(`/chat?session_id=${data.session_id}`);
        }, 1200);

        return;
      }

      setResult({
        youtubeId: "",
        message: "Video indexed successfully.",
      });
    } catch (err) {
      setApiError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-tc-bg text-tc-text">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-tc-border bg-tc-bg-3/90 backdrop-blur-md">
        <div className="flex h-[72px] w-full items-center justify-between px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-tc-accent to-tc-accent-2 text-[#1a0f05]">
              <Code2 className="h-4 w-4" strokeWidth={2.4} />
            </span>

            <div>
              <h1 className="text-lg font-semibold">
                TubeChat<span className="text-tc-accent">.ai</span>
              </h1>
            </div>
          </button>

          <div className="flex items-center gap-3">

            {user && !user.is_guest ? (
              <div className="rounded-full border border-tc-border bg-tc-surface px-5 py-2 text-sm font-medium shadow-sm">
                {user.email}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-xl px-4 py-2 hover:bg-tc-surface"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>

                <Link
                  to="/register"
                  className="flex items-center gap-2 rounded-xl bg-tc-accent px-4 py-2 text-[#1a0f05]"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-10 pb-6 text-center">

        <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-[28px] bg-tc-accent/10 border border-tc-accent/10 text-tc-accent">
          <Database className="h-11 w-11" strokeWidth={1.8} />
        </div>

        <h3 className="mx-auto font-bold tracking-tight leading-tight lg:text-4xl">
          Index a YouTube Video
        </h3>

        <p className="mx-auto mt-6 text-lg leading-8 text`">
          Paste any YouTube URL and we'll download its transcript, build a semantic knowledge base, and let you chat with it using AI.
        </p>

      </section>

      {/* Index Card */}

      <section className="mx-auto max-w-3xl px-6">

        <div className="rounded-3xl border border-tc-border bg-tc-surface/80 p-8 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">

          <IndexForm
            register={register}
            errors={errors}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={isLoading}
            apiError={apiError}
            result={result}
          />

        </div>

      </section>

      {/* Features */}

      <section className="mx-auto my-4 grid max-w-6xl gap-6 px-6 pb-16 md:grid-cols-3">

        <div className="rounded-2xl border border-tc-border bg-tc-surface p-6">
          <Zap className="mb-4 h-8 w-8 text-tc-accent" />
          <h3 className="text-lg font-semibold">
            Fast Indexing
          </h3>
          <p className="mt-2 text-sm text-tc-muted">
            Build searchable embeddings from transcripts in seconds.
          </p>
        </div>

        <div className="rounded-2xl border border-tc-border bg-tc-surface p-6">
          <MessageSquare className="mb-4 h-8 w-8 text-tc-accent" />
          <h3 className="text-lg font-semibold">
            AI Conversations
          </h3>
          <p className="mt-2 text-sm text-tc-muted">
            Ask questions naturally and receive grounded answers.
          </p>
        </div>

        <div className="rounded-2xl border border-tc-border bg-tc-surface p-6">
          <ArrowRight className="mb-4 h-8 w-8 text-tc-accent" />
          <h3 className="text-lg font-semibold">
            Persistent Sessions
          </h3>
          <p className="mt-2 text-sm text-tc-muted">
            Continue previous conversations whenever you return.
          </p>
        </div>

      </section>
    </div>
  );
}