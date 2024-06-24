import { SuggestionMatch, Trigger } from "@tiptap/suggestion";

export function findSuggestionMatch(config: Trigger): SuggestionMatch | null {
  const { $position } = config;

  // This regex now captures any text following `[[`
  const regexp = /\[\[([^[]*)$/;

  // Fetch the text before the cursor
  const textBeforeCursor = $position.nodeBefore?.isText
    ? $position.nodeBefore.text
    : "";

  // Execute the regex on the text before the cursor
  const match = regexp.exec(textBeforeCursor || "");

  if (match && match[1] !== undefined) {
    const from = $position.pos - match[0].length;
    const to = $position.pos;
    const query = match[1]; // Capture the text inside the brackets as the query

    return {
      range: { from, to },
      query: query, // Now updating the query dynamically based on input
      text: match[0],
    };
  }

  return null;
}
