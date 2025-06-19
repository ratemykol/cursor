import { useQuery } from "@tanstack/react-query";

export function useAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/auth/admin-status"],
    retry: false,
  });

  return {
    isAdmin: data?.isAdmin || false,
    isLoading,
  };
}