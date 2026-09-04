import ChatWidget from "./ChatWidget";

export default async function ChatPage({ params }: { params: Promise<{ clinicId: string }> }) {
  const { clinicId } = await params;

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="font-serif text-2xl text-ink">Ask ClinicAI</h1>
      <p className="text-sm text-ink-60 mt-1">
        Describe your symptoms, or ask about clinic hours, fees, and booking.
      </p>
      <div className="mt-8">
        <ChatWidget clinicId={clinicId} />
      </div>
    </div>
  );
}
