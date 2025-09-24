const BASE_URL = "";

const buildUrl = (path: string): string => {
  if (path.startsWith("http")) {
    return path;
  }

  return `${BASE_URL}${path}`;
};

type RequestOptions = Omit<RequestInit, "body">;

const resolveErrorMessage = async (response: Response): Promise<string> => {
  try {
    const raw = await response.text();

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;

        if (typeof parsed === "string") {
          return parsed;
        }

        if (parsed && typeof parsed === "object") {
          const record = parsed as Record<string, unknown>;
          if (typeof record.error === "string") {
            return record.error;
          }

          if (typeof record.message === "string") {
            return record.message;
          }
        }
      } catch {
        return raw;
      }

      return raw;
    }
  } catch {
    // ignore parsing errors
  }

  return response.statusText || `Request failed with status ${response.status}`;
};

const request = async (url: string, init: RequestInit): Promise<Response> => {
  const response = await fetch(buildUrl(url), init);

  if (!response.ok) {
    const message = await resolveErrorMessage(response);
    throw new Error(message);
  }

  return response;
};

export const getJSON = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.headers ?? {})
  };

  const response = await request(url, {
    ...options,
    headers
  });

  return (await response.json()) as T;
};

export const postForm = async <T>(
  url: string,
  formData: FormData,
  options: RequestOptions = {}
): Promise<T> => {
  const response = await request(url, {
    method: "POST",
    body: formData,
    ...options
  });

  return (await response.json()) as T;
};
