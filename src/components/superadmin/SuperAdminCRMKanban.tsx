import { useEffect, useMemo, useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { adminSupabase, getCurrentAdminSession } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { formatRelativeTime, formatDate } from '@/lib/dateUtils';
import { Phone, MessageCircle, UserPlus, ChevronDown, StickyNote, Users, LayoutDashboard, ChevronRight, ChevronDown as ChevronDownIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  source_type: 'property_inquiry' | 'user_inquiry' | 'manual' | 'research_report' | 'saved_activity';
  source_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  property_id: string | null;
  property_title: string | null;
  city: string | null;
  location: string | null;
  budget_range: string | null;
  property_type: string | null;
  purpose: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  tags: string[];
  assigned_admin_id: string | null;
  next_follow_up_at: string | null;
  last_contacted_at: string | null;
  notes: string | null;
}

interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'superadmin' | 'super_super_admin';
  is_active: boolean;
}

// New interface for grouped leads
interface GroupedLead {
  id: string; // A unique identifier for the group (e.g., phone, email, or a generated ID)
  primaryContact: string; // The main contact info (phone or email)
  leads: Lead[]; // All individual lead records associated with this contact
  isFullyAssigned: boolean; // True if ALL leads in this group are assigned
  commonAdminId: string | null; // The admin ID if all leads in the group are assigned to the same admin, otherwise null
}

const STATUSES: { id: LeadStatus; title: string }[] = [
  { id: 'new', title: 'New' },
  { id: 'contacted', title: 'Contacted' },
  { id: 'qualified', title: 'Qualified' },
  { id: 'closed', title: 'Closed' },
];

const priorityColor: Record<LeadPriority, 'default' | 'secondary' | 'outline'> = {
  low: 'outline',
  medium: 'secondary',
  high: 'default',
  urgent: 'default',
};

function DroppableColumn({ id, children }: { id: LeadStatus | 'unassigned'; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`rounded-lg border bg-card/50 backdrop-blur-sm ${isOver ? 'ring-2 ring-primary' : ''}`}>
      {children}
    </div>
  );
}

function DraggableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
    cursor: 'grab',
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

export default function SuperAdminCRMKanban() {
  const { toast } = useToast();
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [noteLeadId, setNoteLeadId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [expandedAdminLeads, setExpandedAdminLeads] = useState<Record<string, boolean>>({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [leadsResult, adminUsersResult] = await Promise.all([
          adminSupabase.from('leads').select('*').order('created_at', { ascending: false }),
          adminSupabase.rpc('get_admin_credentials').select('*')
        ]);

        if (leadsResult.error) throw leadsResult.error;
        setAllLeads(leadsResult.data || []);

        if (adminUsersResult.error) throw adminUsersResult.error;
        setAdminUsers(adminUsersResult.data || []);

      } catch (e) {
        console.error('Error fetching CRM data:', e);
        toast({ title: 'Error', description: 'Failed to load CRM data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();

    const channel = adminSupabase
      .channel('superadmin-crm-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAllLeads((prev) => [payload.new as Lead, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setAllLeads((prev) => prev.map((l) => (l.id === payload.new.id ? (payload.new as Lead) : l)));
        } else if (payload.eventType === 'DELETE') {
          setAllLeads((prev) => prev.filter((l) => l.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => {
      adminSupabase.removeChannel(channel);
    };
  }, [toast]);

  const { groupedUnassignedLeads, assignedLeadsByAdmin } = useMemo(() => {
    const filteredLeads = allLeads.filter((l) =>
      [l.name, l.phone, l.email, l.location, l.city, l.purpose, l.property_type, l.property_title, ...l.tags]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(search.toLowerCase()))
    );

    const leadsByContact: Record<string, Lead[]> = {};
    filteredLeads.forEach(lead => {
      // Prioritize phone, then email, then a fallback for unique identification
      const contactKey = lead.phone || lead.email || `${lead.name || 'Unknown'}-${lead.source_type}-${lead.id}`;
      if (!leadsByContact[contactKey]) {
        leadsByContact[contactKey] = [];
      }
      leadsByContact[contactKey].push(lead);
    });

    const groupedLeads: GroupedLead[] = Object.entries(leadsByContact).map(([contactKey, leads]) => {
      const isFullyAssigned = leads.every(l => l.assigned_admin_id !== null);
      const firstAdminId = leads[0]?.assigned_admin_id;
      const commonAdminId = isFullyAssigned && leads.every(l => l.assigned_admin_id === firstAdminId) ? firstAdminId : null;

      return {
        id: contactKey, // Use contactKey as the draggable ID for grouped leads
        primaryContact: contactKey, // Display this
        leads: leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), // Sort by most recent activity
        isFullyAssigned,
        commonAdminId,
      };
    });

    // Only show grouped leads where at least one individual lead is unassigned
    const unassigned = groupedLeads.filter(group => !group.isFullyAssigned);

    const assigned: Record<string, Record<LeadStatus, Lead[]>> = {};
    adminUsers.forEach(admin => {
      assigned[admin.id] = { new: [], contacted: [], qualified: [], closed: [] };
    });

    filteredLeads.forEach(lead => {
      if (lead.assigned_admin_id && assigned[lead.assigned_admin_id]) {
        assigned[lead.assigned_admin_id][lead.status].push(lead);
      }
    });

    return { groupedUnassignedLeads: unassigned, assignedLeadsByAdmin: assigned };
  }, [allLeads, adminUsers, search]);

  // Modify assignLead to accept an array of Lead IDs
  const assignLead = async (leadIds: string[], adminId: string | null) => {
    try {
      const { error } = await adminSupabase
        .from('leads')
        .update({ assigned_admin_id: adminId })
        .in('id', leadIds); // Use .in() for multiple IDs
      if (error) throw error;

      setAllLeads((prev) => prev.map((l) => (leadIds.includes(l.id) ? { ...l, assigned_admin_id: adminId } : l)));
      const assignedAdmin = adminUsers.find(u => u.id === adminId);
      toast({ title: 'Assigned', description: `Leads assigned to ${assignedAdmin?.username || 'Unassigned'}` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to assign leads', description: 'Please try again', variant: 'destructive' });
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const { error } = await adminSupabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);
      if (error) throw error;

      setAllLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
      toast({ title: 'Status Updated', description: `Lead status changed to ${newStatus}` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to update status', description: 'Please try again', variant: 'destructive' });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string; // This could be a GroupedLead ID or an individual Lead ID
    const targetId = over.id as LeadStatus | 'unassigned';

    // Determine if it's a grouped lead being dragged from unassigned
    const draggedGroupedLead = groupedUnassignedLeads.find(g => g.id === activeId);

    if (draggedGroupedLead) {
      // Dragging a grouped lead from unassigned
      const leadIdsToAssign = draggedGroupedLead.leads.map(l => l.id);
      if (targetId === 'unassigned') {
        // Dragged back to unassigned, unassign all
        await assignLead(leadIdsToAssign, null);
      } else if (STATUSES.some(s => s.id === targetId)) {
        // Dragged to an admin's status column, assign all to current superadmin and set status
        const currentAdmin = getCurrentAdminSession();
        if (currentAdmin) {
          await assignLead(leadIdsToAssign, currentAdmin.id);
          // Update status for all leads in the group
          for (const leadId of leadIdsToAssign) {
            await updateLeadStatus(leadId, targetId);
          }
        } else {
          toast({ title: 'Error', description: 'Cannot assign unassigned lead without an active admin session.', variant: 'destructive' });
        }
      }
    } else {
      // Dragging an individual lead (from an assigned admin's column)
      const leadId = activeId; // It's an individual lead ID
      if (targetId === 'unassigned') {
        await assignLead([leadId], null);
      } else if (STATUSES.some(s => s.id === targetId)) {
        await updateLeadStatus(leadId, targetId);
      }
    }
  };

  const saveNote = async () => {
    if (!noteLeadId || !noteText.trim()) return;
    const session = getCurrentAdminSession();
    if (!session) {
      toast({ title: 'No admin session', description: 'Please log in again', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await adminSupabase.from('lead_notes').insert({
        lead_id: noteLeadId,
        admin_id: session.id,
        note: noteText.trim(),
      });
      if (error) throw error;
      toast({ title: 'Note added', description: 'Note successfully saved' });
      setNoteText('');
      setNoteLeadId(null);
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to add note', description: 'Please try again', variant: 'destructive' });
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, this is PropertyShodh. Following up on your inquiry.`);
    const formatted = phone.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${formatted}?text=${message}`, '_blank');
  };

  const getLeadTypeBadge = (type: Lead['source_type']) => {
    switch (type) {
      case 'property_inquiry': return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Property Inquiry</Badge>;
      case 'user_inquiry': return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">User Inquiry</Badge>;
      case 'research_report': return <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">Research Report</Badge>;
      case 'saved_activity': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Saved Property</Badge>;
      case 'manual': return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300">Manual Lead</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">🔄 Loading CRM data...</div>
      </div>
    );
  }

  // Filter admin users to only show 'admin' roles for analytics
  const filteredAdminUsersForAnalytics = adminUsers.filter(admin => admin.role === 'admin');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">CRM Management (Super Admin)</h2>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Input
          placeholder="Search all leads by name, phone, property, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96"
        />
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unassigned Leads Column */}
          <DroppableColumn id="unassigned">
            <Card className="border border-border/60 h-full">
              <CardHeader className="py-3 px-4 border-b border-border/50 bg-card/50">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Unassigned Leads</span>
                  <Badge variant="destructive">{groupedUnassignedLeads.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3 min-h-[200px]">
                {groupedUnassignedLeads.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-6 text-center">No unassigned leads</div>
                ) : (
                  groupedUnassignedLeads.map((groupedLead) => (
                    <DraggableCard key={groupedLead.id} id={groupedLead.id}>
                      <div className="rounded-md border border-border/60 bg-background p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium leading-tight line-clamp-1">{groupedLead.primaryContact}</div>
                            {/* Display individual leads within the grouped lead */}
                            <Accordion type="single" collapsible className="w-full mt-2">
                              <AccordionItem value="activities">
                                <AccordionTrigger className="py-1 text-xs font-medium hover:no-underline">
                                  {groupedLead.leads.length} Activities <ChevronDownIcon className="h-3 w-3 ml-1" />
                                </AccordionTrigger>
                                <AccordionContent className="pt-1 pb-0 space-y-1">
                                  {groupedLead.leads.map((lead, index) => (
                                    <div key={lead.id} className="border-l-2 border-muted-foreground/30 pl-2 py-1">
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        {getLeadTypeBadge(lead.source_type)}
                                        <span className="ml-1">{lead.name || 'N/A'}</span>
                                      </div>
                                      {lead.property_title && <p className="text-xs text-muted-foreground line-clamp-1">Property: {lead.property_title}</p>}
                                      {lead.location && <p className="text-xs text-muted-foreground line-clamp-1">Location: {lead.location}</p>}
                                      <p className="text-xs text-muted-foreground">Created {formatRelativeTime(lead.created_at)}</p>
                                    </div>
                                  ))}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Use the phone from the first lead in the group for contact actions */}
                            {groupedLead.leads[0]?.phone && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => handleCall(groupedLead.leads[0].phone)} aria-label="Call">
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleWhatsApp(groupedLead.leads[0].phone, groupedLead.leads[0].name || 'User')} aria-label="WhatsApp">
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <Select onValueChange={(value) => assignLead(groupedLead.leads.map(l => l.id), value === 'unassigned' ? null : value)}>
                            <SelectTrigger className="w-auto h-8">
                              <div className="flex items-center gap-1">
                                <UserPlus className="h-4 w-4" />
                                <span className="text-xs">Assign to</span>
                                <ChevronDown className="h-3 w-3" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassign</SelectItem>
                              {adminUsers.map(admin => (
                                <SelectItem key={admin.id} value={admin.id}>
                                  {admin.username} ({admin.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {/* Note button for the first lead in the group */}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              setNoteLeadId(groupedLead.leads[0]?.id || null);
                              setNoteText('');
                            }}
                          >
                            <StickyNote className="h-4 w-4 mr-1" />
                            Add note
                          </Button>
                        </div>

                        <div className="mt-2 text-[11px] text-muted-foreground">
                          Latest activity {formatRelativeTime(groupedLead.leads[0]?.created_at || new Date().toISOString())}
                        </div>
                      </div>
                    </DraggableCard>
                  ))
                )}
              </CardContent>
            </Card>
          </DroppableColumn>

          {/* Admin Leads Analytics Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" /> Admin Leads Analytics
            </h3>
            {filteredAdminUsersForAnalytics.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No admin users found for analytics.</div>
            ) : (
              filteredAdminUsersForAnalytics.map(admin => {
                const adminLeads = assignedLeadsByAdmin[admin.id] || { new: [], contacted: [], qualified: [], closed: [] };
                const totalAdminLeads = Object.values(adminLeads).flat().length;

                return (
                  <Card key={admin.id} className="border border-border/60 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="py-3 px-4 border-b border-border/50 bg-card/50">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{admin.username} ({admin.role})</span>
                        </div>
                        <Badge variant="default">Total Leads: {totalAdminLeads}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <Accordion type="single" collapsible className="w-full">
                        {STATUSES.map(statusCol => {
                          const leadsInStatus = adminLeads[statusCol.id];
                          return (
                            <AccordionItem key={statusCol.id} value={statusCol.id}>
                              <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <span>{statusCol.title} ({leadsInStatus.length})</span>
                                  <Badge variant="secondary">{leadsInStatus.length}</Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-2 pb-0">
                                <div className="space-y-2">
                                  {leadsInStatus.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-2">No leads in this status.</p>
                                  ) : (
                                    leadsInStatus.map(lead => (
                                      <DraggableCard key={lead.id} id={lead.id}>
                                        <div className="rounded-md border border-border/60 bg-background p-3 shadow-sm">
                                          <div className="flex items-start justify-between gap-2">
                                            <div>
                                              <div className="font-medium leading-tight line-clamp-1">{lead.name}</div>
                                              <div className="text-xs text-muted-foreground">{lead.phone}</div>
                                              {lead.email && <div className="text-xs text-muted-foreground line-clamp-1">{lead.email}</div>}
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Button variant="ghost" size="icon" onClick={() => handleCall(lead.phone)} aria-label="Call">
                                                <Phone className="h-4 w-4" />
                                              </Button>
                                              <Button variant="ghost" size="icon" onClick={() => handleWhatsApp(lead.phone, lead.name)} aria-label="WhatsApp">
                                                <MessageCircle className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>

                                          <div className="mt-2 flex flex-wrap gap-1">
                                            {getLeadTypeBadge(lead.source_type)}
                                            {lead.property_title && <Badge variant="secondary">{lead.property_title}</Badge>}
                                            {lead.location && <Badge variant="secondary">{lead.location}</Badge>}
                                            {lead.city && <Badge variant="secondary">{lead.city}</Badge>}
                                          </div>

                                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            <Badge variant={priorityColor[lead.priority]}>Priority: {lead.priority}</Badge>
                                            {lead.next_follow_up_at && (
                                              <Badge variant="outline">Follow-up: {formatDate(lead.next_follow_up_at)}</Badge>
                                            )}
                                          </div>

                                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                                            <Select onValueChange={(value) => updateLeadStatus(lead.id, value as LeadStatus)} value={lead.status}>
                                              <SelectTrigger className="w-auto h-8">
                                                <div className="flex items-center gap-1">
                                                  <LayoutDashboard className="h-4 w-4" />
                                                  <span className="text-xs">Status: {lead.status}</span>
                                                  <ChevronDown className="h-3 w-3" />
                                                </div>
                                              </SelectTrigger>
                                              <SelectContent>
                                                {STATUSES.map(s => (
                                                  <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <Button 
                                              size="sm" 
                                              variant="ghost" 
                                              onClick={() => {
                                                setNoteLeadId(lead.id);
                                                setNoteText('');
                                              }}
                                            >
                                              <StickyNote className="h-4 w-4 mr-1" />
                                              Add note
                                            </Button>
                                          </div>

                                          <div className="mt-2 text-[11px] text-muted-foreground">
                                            Updated {formatRelativeTime(lead.updated_at)}
                                          </div>
                                        </div>
                                      </DraggableCard>
                                    ))
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </DndContext>

      <Dialog open={!!noteLeadId} onOpenChange={(open) => !open && (setNoteLeadId(null), setNoteText(''))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Type an update or note for this lead..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-32"
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground text-right">
            {noteText.length}/500 characters
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setNoteLeadId(null); setNoteText(''); }}>Cancel</Button>
            <Button onClick={saveNote} disabled={!noteText.trim()}>Save note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}