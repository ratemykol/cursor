import { useQuery } from "@tanstack/react-query";

export function useAdmin() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/auth/admin-status"],
    queryFn: async () => {
      const response = await fetch("/api/auth/admin-status");
      if (!response.ok) {
        if (response.status === 401) {
          return { isAdmin: false };
        }
        throw new Error("Failed to fetch admin status");
      }
      return response.json();
    },
    retry: false,
  });

  // If there's an error (like 401 unauthorized), the user is not an admin
  const isAdmin = error ? false : ((data as any)?.isAdmin || false);

  return {
    isAdmin,
    isLoading,
  };
}