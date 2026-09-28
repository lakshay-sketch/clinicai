import ChatWidget from "./ChatWidget";
import SiteHeader from "@/components/SiteHeader";

export default async function ChatPage({ params }: { params: Promise<{ clinicId: string }> }) {
  const { clinicId } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="max-w-xl mx-auto px-6 py-14 w-full animate-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-ink-50 font-mono mb-4">
            <span className="w-6 h-px bg-line-strong" />
            ClinicAI concierge
            <span className="w-6 h-px bg-line-strong" />
          </div>
          <h1 className="font-serif text-4xl text-ink tracking-tight">Ask ClinicAI</h1>
          <p className="text-sm text-ink-70 mt-3 leading-relaxed">
            Describe your symptoms, or ask about clinic hours, fees, and booking.
          </p>
        </div>
        <ChatWidget clinicId={clinicId} />
      </div>
    </div>
  );
}
