/**
 * GraphQL fetcher for quiz plugin codegen.
 * Uses the same /graphql endpoint as the host app.
 */
export const fetchData = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  _options?: RequestInit["headers"],
): (() => Promise<TData>) => {
  return async () => {
    const response = await fetch("/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json();

    if (json.errors && json.errors.length > 0) {
      const error = new Error(json.errors[0].message);
      (error as Error & { graphQLErrors?: unknown[]; response?: unknown }).graphQLErrors =
        json.errors;
      (error as Error & { graphQLErrors?: unknown[]; response?: unknown }).response = json;
      throw error;
    }

    return json.data;
  };
};
