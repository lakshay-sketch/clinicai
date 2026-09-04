import CheckinWidget from "./CheckinWidget";

async function getClinicByToken(token: string) {
  const res = await fetch(`http://localhost:3000/api/clinics/qr/${token}`, { cache: "no-store" });
  const json = await res.json();
  return json.success ? json.data : null;
}

export default async function CheckinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const clinic = await getClinicByToken(token);

  if (!clinic) {
    return (
      <div className="max-w-md mx-auto px-6 py-10">
        <p className="text-sm text-red">This QR code isn't recognized. Please ask reception for help.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <p className="text-sm text-ink-60">Walk-in check-in</p>
      <h1 className="font-serif text-2xl text-ink mt-1">{clinic.name}</h1>
      <p className="text-sm text-ink-60 mt-1">{clinic.area}, {clinic.city}</p>

      <div className="mt-8 border-t border-line pt-8">
        <h2 className="text-sm font-medium text-ink mb-4">Choose a doctor to join the queue</h2>
        <CheckinWidget doctors={clinic.doctors} />
      </div>
    </div>
  );
}
