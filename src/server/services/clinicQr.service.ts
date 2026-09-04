import { clinicQrRepo } from "@/server/repositories/clinicQr.repo";
import { NotFoundError } from "@/server/lib/errors";

export const clinicQrService = {
  resolve: async (qrToken: string) => {
    const clinic = await clinicQrRepo.findByToken(qrToken);
    if (!clinic) throw new NotFoundError("Clinic not found for this QR code");
    return clinic;
  },
};
