import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge'; // Added this import
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Shield, CheckCircle, XCircle, PlusCircle, LogOut } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminCredential {
  id: string;
  username: string;
  role: 'admin' | 'superadmin' | 'super_super_admin';
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  created_by: string | null;
}

const SuperAdminDashboard: React.FC = () => {
  const { adminSession, signOutAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [admins, setAdmins] = useState<AdminCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'superadmin'>('admin');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_admin_credentials');

    if (error) {
      console.error('Error fetching admin credentials:', error);
      toast({
        title: t('error'),
        description: t('failed_to_fetch_admin_credentials'),
        variant: 'destructive',
      });
    } else {
      setAdmins(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      const { data, error } = await supabase.rpc('create_admin_credential', {
        _username: newAdminUsername,
        _password: newAdminPassword,
        _role: newAdminRole,
      });

      if (error) {
        console.error('Error creating admin:', error);
        toast({
          title: t('error'),
          description: error.message || t('failed_to_create_admin'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('success'),
          description: t('admin_created_successfully'),
        });
        setNewAdminUsername('');
        setNewAdminPassword('');
        setNewAdminRole('admin');
        fetchAdmins(); // Refresh the list
      }
    } catch (err) {
      console.error('Error creating admin:', err);
      toast({
        title: t('error'),
        description: t('failed_to_create_admin'),
        variant: 'destructive',
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleToggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    const { error } = await supabase.rpc('toggle_admin_status', { _admin_id: adminId });
    if (error) {
      console.error('Error toggling admin status:', error);
      toast({
        title: t('error'),
        description: error.message || t('failed_to_toggle_admin_status'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('success'),
        description: currentStatus ? t('admin_deactivated') : t('admin_activated'),
      });
      fetchAdmins(); // Refresh the list
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!window.confirm(t('confirm_delete_admin'))) return;

    const { error } = await supabase.rpc('delete_admin_credential', { _admin_id: adminId });
    if (error) {
      console.error('Error deleting admin:', error);
      toast({
        title: t('error'),
        description: error.message || t('failed_to_delete_admin'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('success'),
        description: t('admin_deleted_successfully'),
      });
      fetchAdmins(); // Refresh the list
    }
  };

  const filteredAdmins = admins.filter(admin => admin.role !== 'super_super_admin');
  const totalAdmins = filteredAdmins.length;
  const activeAdmins = filteredAdmins.filter(admin => admin.is_active).length;
  const superAdmins = filteredAdmins.filter(admin => admin.role === 'superadmin').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">
            <TranslatableText text="Super Admin Dashboard" />
          </h1>
          <Button onClick={signOutAdmin} variant="outline" className="flex items-center gap-2">
            <LogOut size={16} />
            <TranslatableText text="Sign Out" />
          </Button>
        </div>

        {/* Admin Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <TranslatableText text="Total Admins" />
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAdmins}</div>
              <p className="text-xs text-muted-foreground">
                <TranslatableText text="Excluding Omega Admins" />
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <TranslatableText text="Active Admins" />
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAdmins}</div>
              <p className="text-xs text-muted-foreground">
                <TranslatableText text="Currently active" />
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <TranslatableText text="Super Admins" />
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{superAdmins}</div>
              <p className="text-xs text-muted-foreground">
                <TranslatableText text="With elevated privileges" />
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create New Admin */}
        <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl">
              <TranslatableText text="Create New Admin" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="username"><TranslatableText text="Username" /></Label>
                <Input
                  id="username"
                  type="text"
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  placeholder={t('enter_username')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password"><TranslatableText text="Password" /></Label>
                <Input
                  id="password"
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder={t('enter_password')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role"><TranslatableText text="Role" /></Label>
                <Select value={newAdminRole} onValueChange={(value: 'admin' | 'superadmin') => setNewAdminRole(value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder={t('select_role')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin"><TranslatableText text="Admin" /></SelectItem>
                    <SelectItem value="superadmin"><TranslatableText text="Super Admin" /></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={creatingAdmin} className="md:col-span-3">
                {creatingAdmin ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                <TranslatableText text="Create Admin" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin List */}
        <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl">
              <TranslatableText text="Manage Admins" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><TranslatableText text="Username" /></TableHead>
                    <TableHead><TranslatableText text="Role" /></TableHead>
                    <TableHead><TranslatableText text="Status" /></TableHead>
                    <TableHead><TranslatableText text="Last Login" /></TableHead>
                    <TableHead className="text-right"><TranslatableText text="Actions" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.username}</TableCell>
                      <TableCell>{admin.role}</TableCell>
                      <TableCell>
                        <Badge variant={admin.is_active ? 'default' : 'destructive'}>
                          {admin.is_active ? t('active') : t('inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>{admin.last_login ? new Date(admin.last_login).toLocaleString() : t('never')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAdminStatus(admin.id, admin.is_active)}
                          disabled={admin.id === adminSession?.admin_id} // Prevent deactivating self
                        >
                          {admin.is_active ? <XCircle size={16} className="mr-1" /> : <CheckCircle size={16} className="mr-1" />}
                          {admin.is_active ? t('deactivate') : t('activate')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          disabled={admin.id === adminSession?.admin_id} // Prevent deleting self
                        >
                          <TranslatableText text="Delete" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;