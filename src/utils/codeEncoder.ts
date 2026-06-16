/**
 * Encodes a string (code snippet or tabs JSON) to a compressed/abbreviated URL-safe string.
 */
export async function encodeCode(code: string): Promise<string> {
  try {
    if (typeof CompressionStream !== "undefined" && typeof Response !== "undefined") {
      const stream = new Blob([code]).stream();
      const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
      const response = new Response(compressedStream);
      const buffer = await response.arrayBuffer();
      const base64url = btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      return "gz:" + base64url;
    }
  } catch (e) {
    console.error("Failed to compress code using CompressionStream, falling back to base64", e);
  }

  // Fallback to base64url
  const base64url = btoa(unescape(encodeURIComponent(code)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return "b64:" + base64url;
}

/**
 * Decodes an encoded/compressed URL-safe string back to the original code string.
 */
export async function decodeCode(encoded: string): Promise<string> {
  try {
    if (encoded.startsWith("gz:")) {
      const data = encoded.slice(3);
      let base64 = data.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) {
        base64 += "=";
      }
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const stream = new Blob([bytes]).stream();
      const decompressedStream = stream.pipeThrough(new DecompressionStream("gzip"));
      const response = new Response(decompressedStream);
      return await response.text();
    }
  } catch (e) {
    console.error("Failed to decompress gz-compressed code, falling back:", e);
  }

  try {
    const data = encoded.startsWith("b64:") ? encoded.slice(4) : encoded;
    let base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return decodeURIComponent(escape(atob(base64)));
  } catch (e) {
    // If decoding base64 fails, assume raw URL decoded string
    try {
      return decodeURIComponent(encoded);
    } catch (err) {
      return encoded;
    }
  }
}
