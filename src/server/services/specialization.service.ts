import { specializationRepo } from "@/server/repositories/specialization.repo";

export const specializationService = {
  listAll: async () => {
    return specializationRepo.findAll();
  },
};
