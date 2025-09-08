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
import { Phone, MessageCircle, UserPlus, ChevronDown, StickyNote } from 'lucide-react';

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

interface ConsolidatedLead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  assigned_admin_id: string | null;
  properties: {
    id: string;
    title: string;
    checked?: boolean;
  }[];
  propertyCount: number;
  created_at: string;
  updated_at: string;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  purpose: string | null;
  property_type: string | null;
  budget_range: string | null;
  location: string | null;
  city: string | null;
}

interface AdminUser {
  id: string; // This will be the UUID
  username: string;
  role: 'admin' | 'superadmin' | 'super_super_admin';
  is_active: boolean;
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

function DroppableColumn({ id, children }: { id: LeadStatus; children: React.ReactNode }) {
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
  const [leads, setLeads] = useState<Lead[]>([]);
  // Removed consolidatedLeads state as it's now handled by the 'grouped' useMemo
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [noteLeadId, setNoteLeadId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const currentAdminSession = getCurrentAdminSession();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const { data, error } = await adminSupabase.rpc('get_admin_credentials');
        if (error) throw error;
        setAdminUsers(data || []);
      } catch (e) {
        console.error('Error fetching admin users:', e);
        toast({ title: 'Error', description: 'Failed to load admin users for assignment', variant: 'destructive' });
      }
    };
    fetchAdminUsers();
  }, [toast]);

  const grouped = useMemo(() => {
    const byStatus: Record<LeadStatus, ConsolidatedLead[]> = {
      new: [], contacted: [], qualified: [], closed: []
    };

    const phoneGroups: Record<string, Lead[]> = {};
    leads.forEach(lead => {
      if (!phoneGroups[lead.phone]) {
        phoneGroups[lead.phone] = [];
      }
      phoneGroups[lead.phone].push(lead);
    });

    const consolidated: ConsolidatedLead[] = Object.values(phoneGroups).map(group => {
      const sortedGroup = group.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      const primary = sortedGroup[0];
      
      const properties = group
        .filter(lead => lead.property_id && lead.property_title)
        .reduce((acc, lead) => {
          if (!acc.find(p => p.id === lead.property_id)) {
            acc.push({
              id: lead.property_id!,
              title: lead.property_title!,
              checked: false
            });
          }
          return acc;
        }, [] as { id: string; title: string; checked: boolean }[]);

      return {
        id: primary.id,
        name: primary.name,
        phone: primary.phone,
        email: primary.email,
        status: primary.status,
        priority: primary.priority,
        assigned_admin_id: primary.assigned_admin_id,
        properties,
        propertyCount: properties.length,
        created_at: primary.created_at,
        updated_at: primary.updated_at,
        last_contacted_at: primary.last_contacted_at,
        next_follow_up_at: primary.next_follow_up_at,
        purpose: primary.purpose,
        property_type: primary.property_type,
        budget_range: primary.budget_range,
        location: primary.location,
        city: primary.city,
      };
    });

    consolidated
      .filter((l) =>
        [l.name, l.phone, l.location, l.city, l.purpose, l.property_type, ...l.properties.map(p => p.title)]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(search.toLowerCase()))
      )
      .forEach((l) => byStatus[l.status].push(l));
    return byStatus;
  }, [leads, search]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        // Superadmin can see all leads
        const { data, error } = await adminSupabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setLeads(data as unknown as Lead[]);
      } catch (e) {
        console.error(e);
        toast({ title: 'Error', description: 'Failed to load leads', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();

    const channel = adminSupabase
      .channel('crm-leads-superadmin') // Unique channel name for superadmin
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        // Superadmin sees all changes
        const newLead = payload.new as Lead;
        const oldLead = payload.old as Lead;

        if (payload.eventType === 'INSERT') {
          setLeads((prev) => [newLead, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setLeads((prev) => prev.map((l) => (l.id === newLead.id ? newLead : l)));
        } else if (payload.eventType === 'DELETE') {
          setLeads((prev) => prev.filter((l) => l.id !== oldLead.id));
        }
      })
      .subscribe();
    return () => {
      adminSupabase.removeChannel(channel);
    };
  }, [toast]);

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as LeadStatus;
    const leadPhone = active.id as string;
    
    try {
      // Superadmin can update any lead's status
      const { error } = await adminSupabase
        .from('leads')
        .update({ status: newStatus })
        .eq('phone', leadPhone);
      if (error) throw error;
      
      setLeads((prev) => prev.map((l) => (l.phone === leadPhone ? { ...l, status: newStatus } : l)));
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to move lead', description: 'Please try again', variant: 'destructive' });
    }
  };

  const assignLead = async (phone: string, adminId: string) => {
    const session = getCurrentAdminSession();
    if (!session) {
      toast({ title: 'No admin session', description: 'Please log in again', variant: 'destructive' });
      return;
    }
    
    try {
      // Superadmin can assign to any admin or unassign
      const { error } = await adminSupabase
        .from('leads')
        .update({ assigned_admin_id: adminId === 'unassigned' ? null : adminId })
        .eq('phone', phone); // Superadmin can update any lead
      if (error) throw error;
      
      setLeads((prev) => prev.map((l) => (l.phone === phone ? { ...l, assigned_admin_id: adminId === 'unassigned' ? null : adminId } : l)));
      const assignedAdmin = adminUsers.find(u => u.id === adminId);
      toast({ title: 'Assigned', description: `Lead assigned to ${assignedAdmin?.username || 'Unassigned'}` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to assign', description: 'Please try again', variant: 'destructive' });
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
      // Superadmin can add notes to any lead
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

  const togglePropertyCheck = async (leadPhone: string, propertyId: string) => {
    // This state is local to the component and doesn't affect the database.
    // It's used for UI interaction within the lead card.
    // No need to update consolidatedLeads state directly, as 'grouped' useMemo will re-calculate.
    // For now, this function will not modify state, as consolidatedLeads is no longer a state.
    // If this checkbox needs to persist, it would require a new database field or local storage.
    console.log(`Toggling property ${propertyId} for lead ${leadPhone}`);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, this is PropertyShodh. Following up on your inquiry.`);
    const formatted = phone.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${formatted}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search leads by name, phone, property, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading CRM…</div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {STATUSES.map((col) => (
              <DroppableColumn key={col.id} id={col.id}>
                <Card className="border border-border/60 h-full">
                  <CardHeader className="py-3 px-4 border-b border-border/50 bg-card/50">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{col.title}</span>
                      <Badge variant="outline">{grouped[col.id].length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    {grouped[col.id].length === 0 ? (
                      <div className="text-xs text-muted-foreground py-6 text-center">No leads</div>
                    ) : (
                      grouped[col.id].map((lead) => (
                        <DraggableCard key={lead.phone} id={lead.phone}>
                          <div className="rounded-md border border-border/60 bg-background p-3 shadow-sm">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-medium leading-tight line-clamp-1">{lead.name}</div>
                                <div className="text-xs text-muted-foreground">{lead.phone}</div>
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

                            {/* Properties interested in */}
                            {lead.properties.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs text-muted-foreground mb-1">
                                  Properties interested ({lead.propertyCount}):
                                </div>
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                  {lead.properties.map((property) => (
                                    <div key={property.id} className="flex items-center gap-2">
                                      <Checkbox
                                        id={`${lead.phone}-${property.id}`}
                                        checked={property.checked}
                                        onCheckedChange={() => togglePropertyCheck(lead.phone, property.id)}
                                      />
                                      <label
                                        htmlFor={`${lead.phone}-${property.id}`}
                                        className="text-xs cursor-pointer line-clamp-1 flex-1"
                                      >
                                        {property.title}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                              {[lead.purpose, lead.property_type, lead.budget_range, lead.location, lead.city]
                                .filter(Boolean)
                                .join(' • ')}
                            </div>
                            
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              <Badge variant={priorityColor[lead.priority]}>Priority: {lead.priority}</Badge>
                              {lead.next_follow_up_at && (
                                <Badge variant="outline">Follow-up: {formatDate(lead.next_follow_up_at)}</Badge>
                              )}
                              {lead.assigned_admin_id && (
                                <Badge variant="secondary">
                                  Assigned: {adminUsers.find(u => u.id === lead.assigned_admin_id)?.username || 'Unknown'}
                                </Badge>
                              )}
                            </div>

                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                              <Select onValueChange={(value) => assignLead(lead.phone, value)}>
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
                  </CardContent>
                </Card>
              </DroppableColumn>
            ))}
          </div>
        </DndContext>
      )}

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