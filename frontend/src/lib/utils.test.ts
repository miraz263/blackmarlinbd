import { describe, expect, it } from "vitest";

import { cn, slugify } from "./utils";

describe("utils", () => {
  it("merges conditional class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });

  it("slugifies display text", () => {
    expect(slugify("BlackMarlin BD: AI & Cloud")).toBe("blackmarlin-bd-ai-cloud");
  });

});
