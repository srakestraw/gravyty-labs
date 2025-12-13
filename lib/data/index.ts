import type { DataProvider } from "@/lib/data/provider";
import { mockProvider } from "@/lib/data/providers/mockProvider";
// future:
// import { httpProvider } from "@/lib/data/providers/httpProvider";
// import { mcpProvider } from "@/lib/data/providers/mcpProvider";

function createProvider(): DataProvider {
  const mode = process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock";
  switch (mode) {
    case "mock":
    default:
      return mockProvider;
    // future cases:
    // case "http":
    //   return httpProvider;
    // case "mcp":
    //   return mcpProvider;
  }
}

export const dataClient = createProvider();

