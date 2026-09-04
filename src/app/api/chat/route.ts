import { handleChatMessage } from "@/server/controllers/chat.controller";

export async function POST(req: Request) {
  return handleChatMessage(req);
}
