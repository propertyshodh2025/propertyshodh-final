"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, MessageSquare, Phone, CalendarDays, Tag, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/database'; // Assuming a Lead type exists

// Define a type for admin users to be used in the dropdown
interface AdminUser {
  id: string; // UUID
  username: string;
}

// Define a type for leads with assigned admin details
interface LeadWithAdmin extends Lead {
  assigned_admin_username?: string;
}

const CRMKanban: React.FC = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<LeadWithAdmin[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data: leadsData, error } = await adminSupabase
        .from('leads')
        .select('*') // Select all columns from leads
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch admin usernames for assigned leads
      const leadsWithAdminUsernames = await Promise.all(
        (leadsData || []).map(async (lead) => {
          if (lead.assigned_admin_id) {
            const { data: adminProfile, error: adminError } = await adminSupabase
              .from('admin_credentials')
              .select('username')
              .eq('id', lead.assigned_admin_id)
              .maybeSingle();

            if (adminError) {
              console.error(`Error fetching admin username for lead ${lead.id}:`, adminError);
            }

            return {
              ...lead,
              assigned_admin_username: adminProfile?.username || 'Unknown Admin'
            };
          }
          return {
            ...lead,
            assigned_admin_username: 'Unassigned'
          };
        })
      );
      setLeads(leadsWithAdminUsernames);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchAdminUsers = useCallback(async () => {
    try {
      const { data, error } = await adminSupabase
        .from('admin_credentials')
        .select('id, username')
        .eq('is_active', true)
        .order('username', { ascending: true });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users for assignment.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchLeads();
    fetchAdminUsers();
  }, [fetchLeads, fetchAdminUsers]);

  const handleAssignLead = async (leadId: string, adminId: string | null) => {
    try {
      const { error } = await adminSupabase
        .from('leads')
        .update({ assigned_admin_id: adminId })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Lead ${leadId} assigned successfully.`,
        variant: "success",
      });
      fetchLeads(); // Refresh leads to show updated assignment
    } catch (error) {
      console.error('Error assigning lead:', error);
      toast({
        title: "Error",
        description: `Failed to assign lead: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  const leadStatuses = ['new', 'contacted', 'qualified', 'unqualified', 'closed_won', 'closed_lost'];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-muted-foreground">Loading CRM data...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {leadStatuses.map(status => (
        <div key={status} className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold capitalize mb-2">{status.replace('_', ' ')} ({getLeadsByStatus(status).length})</h3>
          {getLeadsByStatus(status).map(lead => (
            <Card key={lead.id} className="bg-card/70 backdrop-blur-sm border border-border/50 shadow-sm">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                  <span>{lead.name}</span>
                  <Badge variant="secondary" className="text-xs">{lead.priority}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-sm text-muted-foreground space-y-1">
                <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</p>
                {lead.email && <p className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {lead.email}</p>}
                {lead.property_title && <p>Property: {lead.property_title}</p>}
                {lead.location && <p>Location: {lead.location}</p>}
                {lead.purpose && <p>Purpose: {lead.purpose}</p>}
                <p className="flex items-center gap-1"><User className="h-3 w-3" /> Assigned: {lead.assigned_admin_username || 'Unassigned'}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" /> {new Date(lead.created_at).toLocaleDateString()}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {lead.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" /> {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-3">
                  <Select onValueChange={(value) => handleAssignLead(lead.id, value === 'unassign' ? null : value)} value={lead.assigned_admin_id || 'unassign'}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassign">Unassign</SelectItem>
                      {adminUsers.map(admin => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CRMKanban;