type SearchParams = Record<string, string | string[] | undefined> | URLSearchParams;

export type AiUrlState = {
  segment?: string;
};

/**
 * Extract AI Platform URL state from search params
 */
export function getAiUrlState(searchParams: SearchParams): AiUrlState {
  const params = searchParams instanceof URLSearchParams
    ? searchParams
    : new URLSearchParams(
        Object.entries(searchParams).flatMap(([key, value]) => {
          if (Array.isArray(value)) {
            return value.map(v => [key, v] as [string, string]);
          }
          if (value !== undefined && value !== null) {
            return [[key, String(value)] as [string, string]];
          }
          return [];
        })
      );

  return {
    segment: params.get('segment') || undefined,
  };
}

/**
 * Set a single query parameter, returning the query string
 * If value is undefined/null/empty, removes the key
 */
export function setQueryParam(
  current: URLSearchParams | SearchParams,
  key: string,
  value?: string | null
): string {
  const params = current instanceof URLSearchParams
    ? new URLSearchParams(current)
    : new URLSearchParams(
        Object.entries(current).flatMap(([k, v]) => {
          if (Array.isArray(v)) {
            return v.map(val => [k, String(val)] as [string, string]);
          }
          if (v !== undefined && v !== null) {
            return [[k, String(v)] as [string, string]];
          }
          return [];
        })
      );

  if (value === undefined || value === null || value === '') {
    params.delete(key);
  } else {
    params.set(key, value);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Merge query parameter updates into current params
 * Updates can include undefined to remove keys
 */
export function mergeQueryParams(
  current: URLSearchParams | SearchParams,
  updates: Record<string, string | undefined | null>
): string {
  const params = current instanceof URLSearchParams
    ? new URLSearchParams(current)
    : new URLSearchParams(
        Object.entries(current).flatMap(([k, v]) => {
          if (Array.isArray(v)) {
            return v.map(val => [k, String(val)] as [string, string]);
          }
          if (v !== undefined && v !== null) {
            return [[k, String(v)] as [string, string]];
          }
          return [];
        })
      );

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Preserve AI Platform params (segment) when constructing hrefs
 * Only appends if not already present in the href
 */
export function preserveAiParams(
  href: string,
  current: URLSearchParams | SearchParams,
  keys: string[] = ['segment']
): string {
  const [path, existingQuery] = href.split('?');
  const existingParams = existingQuery ? new URLSearchParams(existingQuery) : new URLSearchParams();
  
  const currentParams = current instanceof URLSearchParams
    ? current
    : new URLSearchParams(
        Object.entries(current).flatMap(([k, v]) => {
          if (Array.isArray(v)) {
            return v.map(val => [k, String(val)] as [string, string]);
          }
          if (v !== undefined && v !== null) {
            return [[k, String(v)] as [string, string]];
          }
          return [];
        })
      );

  // Only preserve keys that aren't already in the href
  keys.forEach(key => {
    if (!existingParams.has(key) && currentParams.has(key)) {
      existingParams.set(key, currentParams.get(key)!);
    }
  });

  const queryString = existingParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

