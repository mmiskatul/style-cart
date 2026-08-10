/** Generates product tags with Lovable AI. Server-only. */
export async function generateProductTags(input: {
  name: string;
  description: string;
  category: string;
}): Promise<string[]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured.");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-3.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You tag products for a small retail catalog. Return 4-6 short, human-readable tags (1-2 words, Title Case) describing material, use case, audience and product type. No duplicates, no punctuation, no hashtags.",
        },
        {
          role: "user",
          content: `Product name: ${input.name}\nCategory: ${input.category}\nDescription: ${input.description}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "product_tags",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              tags: { type: "array", items: { type: "string" } },
            },
            required: ["tags"],
          },
        },
      },
    }),
  });

  if (response.status === 429) throw new Error("AI rate limit reached. Please try again shortly.");
  if (response.status === 402) throw new Error("AI credits exhausted. Please top up to continue.");
  if (!response.ok) {
    console.error("AI gateway error", response.status, await response.text());
    throw new Error("Tag generation failed. Please try again.");
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = payload.choices?.[0]?.message?.content;
  if (!raw) throw new Error("AI returned an empty response.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI returned malformed data.");
  }

  const tags = (parsed as { tags?: unknown }).tags;
  if (!Array.isArray(tags)) throw new Error("AI returned malformed data.");

  const clean = Array.from(
    new Set(
      tags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim().replace(/^#/, "").slice(0, 40))
        .filter((t) => t.length > 1),
    ),
  ).slice(0, 8);

  if (clean.length === 0) throw new Error("AI did not return usable tags.");
  return clean;
}
