import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, User, Shield, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { adminSupabase, getCurrentAdminSession } from '@/lib/adminSupabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

interface AdminCredential {
  id: string;
  username: string;
  role: 'admin' | 'superadmin' | 'super_super_admin';
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export function AdminManagementContent() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'superadmin' | 'super_super_admin'>('admin');
  const [editingAdmin, setEditingAdmin] = useState<AdminCredential | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'superadmin' | 'super_super_admin'>('admin');

  const currentAdminSession = getCurrentAdminSession();
  const isSuperAdminOrHigher = currentAdminSession?.role === 'superadmin' || currentAdminSession?.role === 'super_super_admin';
  const isSuperSuperAdmin = currentAdminSession?.role === 'super_super_admin';

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminSupabase.rpc('get_admin_credentials');
      if (error) throw error;
      
      // Filter out super_super_admin users if current user is only a superadmin
      let filteredData = data || [];
      if (!isSuperSuperAdmin) {
        filteredData = filteredData.filter((admin: AdminCredential) => admin.role !== 'super_super_admin');
      }
      
      setAdmins(filteredData);
    } catch (error) {
      console.error('Error fetching admin credentials:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users. You might not have the necessary permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminUsername || !newAdminPassword) {
      toast({ title: "Error", description: "Username and password are required.", variant: "destructive" });
      return;
    }
    
    // Prevent superadmins from creating super_super_admin accounts
    if (!isSuperSuperAdmin && newAdminRole === 'super_super_admin') {
      toast({ 
        title: "Error", 
        description: "You don't have permission to create Super Super Admin accounts.", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      const { data, error } = await adminSupabase.rpc('create_admin_credential', {
        _username: newAdminUsername,
        _password: newAdminPassword,
        _role: newAdminRole,
      });
      if (error) throw error;
      toast({ title: "Success", description: "Admin user created successfully." });
      setNewAdminUsername('');
      setNewAdminPassword('');
      setNewAdminRole('admin');
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAdmin = async (adminId: string) => {
    if (!editingAdmin) return;

    try {
      let updated = false;
      if (editUsername !== editingAdmin.username) {
        const { error } = await adminSupabase.rpc('update_admin_username', {
          _admin_id: adminId,
          _new_username: editUsername,
        });
        if (error) throw error;
        updated = true;
      }
      if (editPassword) {
        const { error } = await adminSupabase.rpc('update_admin_password', {
          _admin_id: adminId,
          _new_password: editPassword,
        });
        if (error) throw error;
        updated = true;
      }
      // Role update logic would go here if allowed, but currently not implemented in RPC
      // if (editRole !== editingAdmin.role) { ... }

      if (updated) {
        toast({ title: "Success", description: "Admin user updated successfully." });
        setEditingAdmin(null);
        setEditPassword('');
        fetchAdmins();
      } else {
        toast({ title: "Info", description: "No changes detected." });
      }
    } catch (error: any) {
      console.error('Error updating admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update admin user.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const { error } = await adminSupabase.rpc('delete_admin_credential', {
        _admin_id: adminId,
      });
      if (error) throw error;
      toast({ title: "Success", description: "Admin user deleted successfully." });
      fetchAdmins();
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete admin user.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAdminStatus = async (adminId: string) => {
    try {
      const { error } = await adminSupabase.rpc('toggle_admin_status', {
        _admin_id: adminId,
      });
      if (error) throw error;
      toast({ title: "Success", description: "Admin status toggled successfully." });
      fetchAdmins();
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle admin status.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (admin: AdminCredential) => {
    setEditingAdmin(admin);
    setEditUsername(admin.username);
    setEditRole(admin.role);
    setEditPassword(''); // Clear password field for security
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-muted-foreground">Loading admin users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Manage Admin Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isSuperAdminOrHigher && (
            <div className="border p-4 rounded-lg space-y-4 bg-muted/20">
              <h3 className="text-lg font-semibold">Create New Admin</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Username"
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                />
                <Select value={newAdminRole} onValueChange={(value: 'admin' | 'superadmin' | 'super_super_admin') => setNewAdminRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    {isSuperAdminOrHigher && <SelectItem value="superadmin">Super Admin</SelectItem>}
                    {isSuperSuperAdmin && <SelectItem value="super_super_admin">Super Super Admin</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateAdmin} disabled={!newAdminUsername || !newAdminPassword}>
                <Plus className="mr-2 h-4 w-4" /> Create Admin
              </Button>
            </div>
          )}

          <h3 className="text-lg font-semibold">Existing Admins</h3>
          <div className="space-y-3">
            {admins.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No admin users found.</p>
            ) : (
              admins.map((admin) => (
                <Card key={admin.id} className="border-border/70 bg-background">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">{admin.username}</span>
                        <Badge variant="secondary">{admin.role}</Badge>
                        <Badge variant={admin.is_active ? "default" : "destructive"}>
                          {admin.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Created: {new Date(admin.created_at).toLocaleString()}
                        {admin.last_login && ` | Last Login: ${new Date(admin.last_login).toLocaleString()}`}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {isSuperAdminOrHigher && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(admin)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            variant={admin.is_active ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleAdminStatus(admin.id)}
                          >
                            {admin.is_active ? <X className="h-4 w-4 mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                            {admin.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the admin account
                                  and remove their access.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteAdmin(admin.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Admin Dialog */}
      <AlertDialog open={!!editingAdmin} onOpenChange={(open) => !open && setEditingAdmin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Admin: {editingAdmin?.username}</AlertDialogTitle>
            <AlertDialogDescription>
              Update the admin's details. Leave password blank to keep current.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="edit-username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Username</label>
              <Input
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="edit-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">New Password (optional)</label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            {/* Role editing is more complex due to permissions, keeping it simple for now */}
            {/* <div>
              <label htmlFor="edit-role" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Role</label>
              <Select value={editRole} onValueChange={(value: 'admin' | 'superadmin' | 'super_super_admin') => setEditRole(value)}>
                <SelectTrigger id="edit-role" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  {isSuperSuperAdmin && <SelectItem value="superadmin">Super Admin</SelectItem>}
                  {isSuperSuperAdmin && <SelectItem value="super_super_admin">Super Super Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div> */}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => editingAdmin && handleUpdateAdmin(editingAdmin.id)}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}