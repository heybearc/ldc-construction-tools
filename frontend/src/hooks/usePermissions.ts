import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  canManageVolunteers, 
  canImportVolunteers, 
  canExportVolunteers,
  canManageTradeTeams,
  canManageProjects
} from '@/lib/permissions';

export function usePermissions() {
  const { data: session } = useSession();
  const [userOrgRoles, setUserOrgRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/v1/user/roles');
        if (response.ok) {
          const data = await response.json();
          setUserOrgRoles(data.roles || []);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRoles();
  }, [session]);

  return {
    session,
    userOrgRoles,
    loading,
    // Volunteer permissions
    canManageVolunteers: canManageVolunteers(session, userOrgRoles),
    canImportVolunteers: canImportVolunteers(session, userOrgRoles),
    canExportVolunteers: canExportVolunteers(session, userOrgRoles),
    // Trade team permissions
    canManageTradeTeams: canManageTradeTeams(session, userOrgRoles),
    // Project permissions
    canManageProjects: canManageProjects(session, userOrgRoles),
  };
}
