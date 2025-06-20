import { useQuery } from "@tanstack/react-query";

export function useAdmin() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/auth/admin-status"],
    retry: false,
  });

  // If there's an error (like 401 unauthorized), the user is not an admin
  const isAdmin = error ? false : ((data as any)?.isAdmin || false);

  return {
    isAdmin,
    isLoading,
  };
}