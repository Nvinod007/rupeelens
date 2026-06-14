export async function parseApiError(
  res: Response,
  fallback: string
): Promise<string> {
  const text = await res.text();
  if (!text) {
    return `${fallback} (${res.status})`;
  }

  try {
    const json = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(json.message)) {
      return json.message.join(", ");
    }
    if (typeof json.message === "string") {
      return json.message;
    }
  } catch {
    // plain text response
  }

  return text;
}
