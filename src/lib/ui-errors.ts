export function formatUserFacingError(raw: string): string {
  const message = raw.toLowerCase();

  if (message.includes("403") || message.includes("auth") || message.includes("signature") || message.includes("credential")) {
    return "Authentication failed. Please verify your API gateway credentials and try again.";
  }

  if (message.includes("timeout") || message.includes("aborted") || message.includes("network") || message.includes("failed to fetch")) {
    return "Request timed out or network was unstable. Please try again.";
  }

  if (message.includes("429") || message.includes("rate")) {
    return "Rate limit reached. Please wait a moment and retry.";
  }

  if (message.includes("500") || message.includes("gateway") || message.includes("upstream")) {
    return "Service is temporarily unavailable. Please retry in a moment.";
  }

  if (message.includes("invalid request") || message.includes("400")) {
    return "The request could not be processed. Please adjust your input and try again.";
  }

  return "Something went wrong while running the pipeline. Please try again.";
}
