// api/mcp/bounded-body.ts
var RequestBodyTooLargeError = class extends Error {
  maxBytes;
  constructor(maxBytes) {
    super(`Request body exceeds ${maxBytes} bytes`);
    this.name = "RequestBodyTooLargeError";
    this.maxBytes = maxBytes;
  }
};
var ResponseBodyTooLargeError = class extends Error {
  maxBytes;
  constructor(maxBytes) {
    super(`MCP server response exceeds ${maxBytes} bytes`);
    this.name = "ResponseBodyTooLargeError";
    this.maxBytes = maxBytes;
  }
};
async function readBoundedBody(source, maxBytes, createTooLargeError) {
  if (!Number.isFinite(maxBytes) || maxBytes < 0) {
    throw new TypeError("maxBytes must be a non-negative finite number");
  }
  const contentLengthRaw = source.headers?.get("content-length");
  if (contentLengthRaw !== null && contentLengthRaw !== void 0 && contentLengthRaw !== "") {
    const contentLength = Number(contentLengthRaw);
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      if (source.body) await source.body.cancel().catch(() => {
      });
      throw createTooLargeError(maxBytes);
    }
  }
  if (!source.body) return new Uint8Array();
  const reader = source.body.getReader();
  const cap = Math.floor(maxBytes);
  let body = new Uint8Array(0);
  let total = 0;
  let cancelled = false;
  const cancel = async () => {
    if (cancelled) return;
    cancelled = true;
    await reader.cancel().catch(() => {
    });
  };
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value || value.byteLength === 0) continue;
      if (total + value.byteLength > maxBytes) {
        await cancel();
        throw createTooLargeError(maxBytes);
      }
      const needed = total + value.byteLength;
      if (needed > body.byteLength) {
        const grown = new Uint8Array(Math.min(cap, Math.max(needed, body.byteLength * 2, 64 * 1024)));
        grown.set(body.subarray(0, total));
        body = grown;
      }
      body.set(value, total);
      total = needed;
    }
  } catch (error) {
    await cancel();
    throw error;
  }
  return body.slice(0, total);
}
async function readBoundedResponseBody(response, maxBytes) {
  return readBoundedBody(response, maxBytes, (limit) => new ResponseBodyTooLargeError(limit));
}
async function readBoundedResponseText(response, maxBytes) {
  const reader = response.body?.getReader();
  if (!reader) {
    const text2 = typeof response.text === "function" ? await response.text().catch(() => "") : "";
    return text2.slice(0, maxBytes);
  }
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let text = "";
  try {
    while (bytesRead < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      const remaining = maxBytes - bytesRead;
      const chunk = value.byteLength > remaining ? value.subarray(0, remaining) : value;
      text += decoder.decode(chunk, { stream: bytesRead + chunk.byteLength < maxBytes });
      bytesRead += chunk.byteLength;
      if (chunk.byteLength < value.byteLength) break;
    }
    text += decoder.decode();
    return text;
  } catch {
    return "";
  } finally {
    await reader.cancel().catch(() => {
    });
  }
}
async function readBoundedRequestBody(request, maxBytes) {
  return readBoundedBody(request, maxBytes, (limit) => new RequestBodyTooLargeError(limit));
}
export {
  RequestBodyTooLargeError,
  ResponseBodyTooLargeError,
  readBoundedRequestBody,
  readBoundedResponseBody,
  readBoundedResponseText
};
