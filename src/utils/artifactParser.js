/**
 * Parse artifact string from API into array of { type, data }.
 * Handles: <artifact type="TYPE">\nJSON\n</artifact>
 * Multiple artifacts can be concatenated in one string.
 */
const ARTIFACT_REGEX = /<artifact\s+type="([^"]+)">\s*([\s\S]*?)<\/artifact>/gi;

export function parseArtifactString(artifactString) {
  if (!artifactString || typeof artifactString !== "string") return [];
  const results = [];
  let m;
  ARTIFACT_REGEX.lastIndex = 0;
  while ((m = ARTIFACT_REGEX.exec(artifactString)) !== null) {
    const type = m[1].trim().toLowerCase();
    let raw = m[2].trim();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }
    results.push({ type, data });
  }
  return results;
}
