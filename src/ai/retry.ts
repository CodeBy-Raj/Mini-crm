/**
 * Executes a Gemini API model task with automatic retries for transient errors
 * (such as 503 Service Unavailable, 429 Rate Limits, or temp model demand spikes).
 */
export async function withGenAIRetry<T>(
  task: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1500,
  backoffFactor = 2
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await task();
    } catch (err: any) {
      attempt++;
      
      // Determine if error is a transient/retryable 503, 429, or UNAVAILABLE error
      const status = err.status || (err.error && err.error.status) || (err.error && err.error.code);
      const errString = String(err).toLowerCase();
      const errMessage = (err.message || "").toLowerCase();
      
      const isTransient = 
        status === 503 ||
        status === 429 ||
        status === "UNAVAILABLE" ||
        status === "RESOURCE_EXHAUSTED" ||
        errString.includes("503") ||
        errString.includes("429") ||
        errString.includes("unavailable") ||
        errString.includes("high demand") ||
        errString.includes("temporary") ||
        errString.includes("too many requests") ||
        errString.includes("service unavailable");

      if (attempt >= maxRetries || !isTransient) {
        throw err;
      }

      const delay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
      console.warn(
        `[Gemini Client Retry] Attempt ${attempt} failed with transient error: ${err.message || err}. ` +
        `Retries remaining: ${maxRetries - attempt}. Retrying in ${delay}ms...`
      );
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
