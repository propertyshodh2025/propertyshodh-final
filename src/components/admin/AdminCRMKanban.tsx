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
import { Phone, MessageCircle, StickyNote, LayoutDashboard, UserMinus } from 'lucide-react';
import { formatRelativeTime, formatDate } from '@/lib/dateUtils';

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

export default function AdminCRMKanban() {
  const { toast } = useToast();
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [noteLeadId, setNoteLeadId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const currentAdminSession = useMemo(() => getCurrentAdminSession(), []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!currentAdminSession) {
      setLoading(false);
      return;
    }

    const fetchMyLeads = async () => {
      setLoading(true);
      try {
        // RLS will automatically filter to only leads assigned to this admin
        const { data, error } = await adminSupabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMyLeads(data || []);
      } catch (e) {
        console.error('Error fetching my leads:', e);
        toast({ title: 'Error', description: 'Failed to load your leads', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchMyLeads();

    const channel = adminSupabase
      .channel(`admin-crm-leads-${currentAdminSession.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `assigned_admin_id=eq.${currentAdminSession.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMyLeads((prev) => [payload.new as Lead, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setMyLeads((prev) => prev.map((l) => (l.id === payload.new.id ? (payload.new as Lead) : l)));
        } else if (payload.eventType === 'DELETE') {
          setMyLeads((prev) => prev.filter((l) => l.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads', filter: `assigned_admin_id=is.null` }, (payload) => {
        // If a lead assigned to this admin is unassigned, remove it from view
        if (payload.old.assigned_admin_id === currentAdminSession.id && payload.new.assigned_admin_id === null) {
          setMyLeads((prev) => prev.filter((l) => l.id !== payload.new.id));
        }
      })
      .subscribe();
    return () => {
      adminSupabase.removeChannel(channel);
    };
  }, [toast, currentAdminSession]);

  const leadsByStatus = useMemo(() => {
    const filteredLeads = myLeads.filter((l) =>
      [l.name, l.phone, l.email, l.location, l.city, l.purpose, l.property_type, l.property_title, ...l.tags]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(search.toLowerCase()))
    );

    const grouped: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      closed: [],
    };
    filteredLeads.forEach(lead => {
      if (grouped[lead.status]) {
        grouped[lead.status].push(lead);
      }
    });
    return grouped;
  }, [myLeads, search]);

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const { error } = await adminSupabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);
      if (error) throw error;

      setMyLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus, updated_at: new Date().toISOString() } : l)));
      toast({ title: 'Status Updated', description: `Lead status changed to ${newStatus}` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to update status', description: 'Please try again', variant: 'destructive' });
    }
  };

  const unassignLead = async (leadId: string) => {
    try {
      const { error } = await adminSupabase
        .from('leads')
        .update({ assigned_admin_id: null, updated_at: new Date().toISOString() })
        .eq('id', leadId);
      if (error) throw error;

      setMyLeads((prev) => prev.filter((l) => l.id !== leadId)); // Remove from current admin's view
      toast({ title: 'Lead Unassigned', description: 'Lead has been unassigned from you.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to unassign lead', description: 'Please try again', variant: 'destructive' });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;

    if (STATUSES.some(s => s.id === newStatus)) {
      await updateLeadStatus(leadId, newStatus);
    }
  };

  const saveNote = async () => {
    if (!noteLeadId || !noteText.trim()) return;
    if (!currentAdminSession) {
      toast({ title: 'No admin session', description: 'Please log in again', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await adminSupabase.from('lead_notes').insert({
        lead_id: noteLeadId,
        admin_id: currentAdminSession.id,
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
        <div className="text-lg">🔄 Loading your leads...</div>
      </div>
    );
  }

  if (!currentAdminSession) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Please log in as an admin to view your assigned leads.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Assigned Leads</h2>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Input
          placeholder="Search your leads by name, phone, property, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96"
        />
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATUSES.map(statusCol => (
            <DroppableColumn key={statusCol.id} id={statusCol.id}>
              <Card className="border border-border/60 h-full">
                <CardHeader className="py-3 px-4 border-b border-border/50 bg-card/50">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{statusCol.title}</span>
                    <Badge variant="secondary">{leadsByStatus[statusCol.id].length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3 min-h-[200px]">
                  {leadsByStatus[statusCol.id].length === 0 ? (
                    <div className="text-xs text-muted-foreground py-6 text-center">No leads in this status</div>
                  ) : (
                    leadsByStatus[statusCol.id].map((lead) => (
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
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => unassignLead(lead.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              Unassign
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