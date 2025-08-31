import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { adminSupabase } from '@/lib/adminSupabase';
import { formatDateTime } from '@/lib/dateUtils';
import { AdminActivityLogger } from '@/components/admin/AdminActivityLogger';
import { AdminActivityFeed } from '@/components/admin/AdminActivityFeed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Shield, 
  Eye,
  EyeOff,
  Calendar,
  Activity
} from 'lucide-react';

interface AdminCredential {
  id: string;
  username: string;
  role: 'admin' | 'superadmin' | 'super_super_admin';
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdminAuthenticated, adminRole, loading, adminLogout } = useAdminAuth();
  
  const [adminCredentials, setAdminCredentials] = useState<AdminCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminCredential | null>(null);
  
  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'superadmin'>('admin');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAdminAuthenticated) {
        navigate('/admin-login');
        return;
      }
      if (adminRole !== 'superadmin' && adminRole !== 'super_super_admin') {
        navigate('/admin');
        return;
      }
      fetchAdminCredentials();
    }
  }, [isAdminAuthenticated, adminRole, loading, navigate]);

  const fetchAdminCredentials = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('admin_credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter based on role hierarchy - superadmin can't see super_super_admin accounts
      let filteredData = data || [];
      if (adminRole === 'superadmin') {
        filteredData = filteredData.filter(admin => admin.role !== 'super_super_admin');
      }
      
      setAdminCredentials(filteredData);
    } catch (error) {
      console.error('Error fetching admin credentials:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsername.trim() || !newPassword.trim()) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await adminSupabase.rpc('create_admin_credential', {
        _username: newUsername.trim(),
        _password: newPassword,
        _role: newRole
      });

      if (error) throw error;

      // Log the activity
      await AdminActivityLogger.logAdminCreate(newUsername.trim(), newRole);

      toast({
        title: "Success",
        description: "Admin credential created successfully",
      });

      setNewUsername('');
      setNewPassword('');
      setNewRole('admin');
      setShowCreateForm(false);
      fetchAdminCredentials();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin credential",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async (adminId: string, newPassword: string) => {
    try {
      const { error } = await adminSupabase.rpc('update_admin_password', {
        _admin_id: adminId,
        _new_password: newPassword
      });

      if (error) throw error;

      // Log the activity
      const adminToUpdate = adminCredentials.find(a => a.id === adminId);
      if (adminToUpdate) {
        await AdminActivityLogger.logAdminUpdate(adminId, adminToUpdate.username, {
          action: 'password_updated'
        });
      }

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setEditingAdmin(null);
      fetchAdminCredentials();
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUsername = async (adminId: string, newUsername: string) => {
    try {
      const { error } = await adminSupabase.rpc('update_admin_username', {
        _admin_id: adminId,
        _new_username: newUsername
      });

      if (error) throw error;

      // Log the activity
      const adminToUpdate = adminCredentials.find(a => a.id === adminId);
      if (adminToUpdate) {
        await AdminActivityLogger.logAdminUpdate(adminId, adminToUpdate.username, {
          action: 'username_updated',
          old_username: adminToUpdate.username,
          new_username: newUsername
        });
      }

      toast({
        title: "Success",
        description: "Username updated successfully",
      });

      setEditingAdmin(null);
      fetchAdminCredentials();
    } catch (error: any) {
      console.error('Error updating username:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (adminId: string, isActive: boolean) => {
    try {
      const { error } = await adminSupabase
        .from('admin_credentials')
        .update({ is_active: !isActive })
        .eq('id', adminId);

      if (error) throw error;

      // Log the activity
      const adminToUpdate = adminCredentials.find(a => a.id === adminId);
      if (adminToUpdate) {
        if (!isActive) {
          await AdminActivityLogger.logAdminUpdate(adminId, adminToUpdate.username, {
            action: 'activated'
          });
        } else {
          await AdminActivityLogger.logAdminDeactivate(adminId, adminToUpdate.username);
        }
      }

      toast({
        title: "Success",
        description: `Admin ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });

      fetchAdminCredentials();
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast({
        title: "Error",
        description: "Failed to update admin status",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin-login');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">SuperAdmin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage admin credentials and permissions</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminCredentials.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adminCredentials.filter(admin => admin.is_active).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SuperAdmins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adminCredentials.filter(admin => admin.role === 'superadmin').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credentials" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin Credentials
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Admin Activities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credentials" className="space-y-6">
            {/* Create Admin Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Admin Credentials Management</CardTitle>
                  <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Admin
                  </Button>
                </div>
              </CardHeader>
              
              {showCreateForm && (
                <CardContent>
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="Enter username"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={newRole} onValueChange={(value: 'admin' | 'superadmin') => setNewRole(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            {/* Only super_super_admin can create superadmin accounts */}
                            {adminRole === 'super_super_admin' && (
                              <SelectItem value="superadmin">SuperAdmin</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button type="submit">Create Admin</Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              )}
            </Card>

            {/* Admin Credentials List */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Admin Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminCredentials.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{admin.username}</span>
                            <Badge variant={
                              admin.role === 'super_super_admin' ? 'default' : 
                              admin.role === 'superadmin' ? 'default' : 'secondary'
                            }>
                              {admin.role === 'super_super_admin' ? 'Super Super Admin' : 
                               admin.role === 'superadmin' ? 'SuperAdmin' : 'Admin'}
                            </Badge>
                            <Badge variant={admin.is_active ? 'default' : 'destructive'}>
                              {admin.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Created: {formatDateTime(admin.created_at)}
                            </span>
                            {admin.last_login && (
                              <span>
                                Last login: {formatDateTime(admin.last_login)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {/* Prevent superadmin from editing higher-level accounts */}
                        {(adminRole === 'super_super_admin' || 
                          (adminRole === 'superadmin' && admin.role === 'admin')) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingAdmin(admin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Prevent superadmin from deactivating higher-level accounts */}
                        {(adminRole === 'super_super_admin' || 
                          (adminRole === 'superadmin' && admin.role === 'admin')) && (
                          <Button
                            variant={admin.is_active ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleActive(admin.id, admin.is_active)}
                          >
                            {admin.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <AdminActivityFeed />
          </TabsContent>
        </Tabs>

        {/* Edit Admin Modal */}
        {editingAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Edit Admin: {editingAdmin.username}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Update Username Form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const username = formData.get('username') as string;
                    if (username.trim() && username !== editingAdmin.username) {
                      handleUpdateUsername(editingAdmin.id, username.trim());
                    }
                  }}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-username">Username</Label>
                        <Input
                          id="new-username"
                          name="username"
                          type="text"
                          placeholder="Enter new username"
                          defaultValue={editingAdmin.username}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Update Username</Button>
                    </div>
                  </form>

                  <div className="border-t pt-4">
                    {/* Update Password Form */}
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const password = formData.get('password') as string;
                      if (password.trim()) {
                        handleUpdatePassword(editingAdmin.id, password);
                      }
                    }}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            name="password"
                            type="password"
                            placeholder="Enter new password"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">Update Password</Button>
                      </div>
                    </form>
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" variant="outline" onClick={() => setEditingAdmin(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;