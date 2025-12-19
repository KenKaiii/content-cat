import {
  createListHandler,
  createCreateHandler,
} from "@/lib/api/entity-handlers";

export const GET = createListHandler("product");
export const POST = createCreateHandler("product");
