import {
  createListHandler,
  createCreateHandler,
} from "@/lib/api/entity-handlers";

export const GET = createListHandler("character");
export const POST = createCreateHandler("character");
