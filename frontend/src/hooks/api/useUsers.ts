import { useQuery } from '@tanstack/react-query';
import { toast } from '../use-toast';

export function useUsers(organizationName: string) {
  return useQuery({
    queryKey: ['users', organizationName],
    queryFn: async () => {
      const response = await fetch(`https://basecamp-c3ay.onrender.com/api/account/members/${organizationName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to fetch users ${error}`
      });
    }
  });
}