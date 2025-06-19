import { useQuery } from "@tanstack/react-query";

export function useAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/auth/admin-status"],
    retry: false,
  });

  return {
    isAdmin: (data as any)?.isAdmin || false,
    isLoading,
  };
}