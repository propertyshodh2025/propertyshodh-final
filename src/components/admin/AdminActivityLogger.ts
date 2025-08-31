import { adminSupabase } from '@/lib/adminSupabase';
import { getCurrentAdminSession } from '@/lib/adminSupabase';

export interface AdminActivityDetails {
  propertyId?: string;
  propertyTitle?: string;
  oldValue?: any;
  newValue?: any;
  username?: string;
  userEmail?: string;
  reason?: string;
  [key: string]: any;
}

export class AdminActivityLogger {
  private static getClientInfo() {
    return {
      ip_address: null, // Will be set by the database function
      user_agent: navigator.userAgent,
    };
  }

  static async logActivity(
    actionType: string,
    targetType?: string,
    targetId?: string,
    details?: AdminActivityDetails
  ) {
    try {
      const session = getCurrentAdminSession();
      if (!session) {
        console.warn('No admin session found, cannot log activity');
        return;
      }

      const clientInfo = this.getClientInfo();
      
      // Get admin ID from session
      const adminId = session.id;
      if (!adminId) {
        console.warn('No admin ID found in session');
        return;
      }

      const { data, error } = await adminSupabase.rpc('log_admin_activity', {
        _admin_id: adminId,
        _action_type: actionType,
        _target_type: targetType || null,
        _target_id: targetId || null,
        _details: details ? JSON.stringify(details) : null,
        _ip_address: clientInfo.ip_address,
        _user_agent: clientInfo.user_agent,
      });

      if (error) {
        console.error('Error logging admin activity:', error);
      }

      return data;
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }

  // Convenience methods for common actions
  static async logLogin(username: string) {
    return this.logActivity('login', 'admin', undefined, { username });
  }

  static async logLogout(username: string) {
    return this.logActivity('logout', 'admin', undefined, { username });
  }

  static async logPropertyCreate(propertyId: string, propertyTitle: string) {
    return this.logActivity('create_property', 'property', propertyId, { 
      propertyTitle 
    });
  }

  static async logPropertyUpdate(propertyId: string, propertyTitle: string, changes: any) {
    return this.logActivity('update_property', 'property', propertyId, { 
      propertyTitle, 
      changes 
    });
  }

  static async logPropertyDelete(propertyId: string, propertyTitle: string) {
    return this.logActivity('delete_property', 'property', propertyId, { 
      propertyTitle 
    });
  }

  static async logPropertyApprove(propertyId: string, propertyTitle: string, approved: boolean) {
    return this.logActivity('approve_property', 'property', propertyId, { 
      propertyTitle, 
      approved 
    });
  }

  static async logAdminCreate(username: string, role: string) {
    return this.logActivity('create_admin', 'admin', undefined, { 
      username, 
      role 
    });
  }

  static async logAdminUpdate(adminId: string, username: string, changes: any) {
    return this.logActivity('update_admin', 'admin', adminId, { 
      username, 
      changes 
    });
  }

  static async logAdminDeactivate(adminId: string, username: string) {
    return this.logActivity('deactivate_admin', 'admin', adminId, { 
      username 
    });
  }

  static async logUserAction(actionType: string, userId: string, userEmail: string, details?: any) {
    return this.logActivity(actionType, 'user', userId, { 
      userEmail, 
      ...details 
    });
  }
}