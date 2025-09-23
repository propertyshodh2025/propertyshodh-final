-- Safe Property Deletion Migration
-- This migration creates a function to safely delete properties and all related data
-- while respecting foreign key constraints

-- Create a comprehensive function to safely delete a property and all related data
CREATE OR REPLACE FUNCTION public.safe_delete_property(
    property_id_param UUID,
    user_id_param UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    property_record RECORD;
    deletion_summary JSON;
    notifications_deleted INTEGER := 0;
    activities_deleted INTEGER := 0;
    inquiries_deleted INTEGER := 0;
    verifications_deleted INTEGER := 0;
    featured_log_deleted INTEGER := 0;
    user_inquiries_deleted INTEGER := 0;
    research_leads_deleted INTEGER := 0;
BEGIN
    -- Check if property exists and get details
    SELECT p.id, p.title, p.user_id, p.created_at
    INTO property_record
    FROM public.properties p
    WHERE p.id = property_id_param;
    
    -- If property doesn't exist, return error
    IF property_record.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Property not found',
            'property_id', property_id_param
        );
    END IF;
    
    -- If user_id is provided, check ownership
    IF user_id_param IS NOT NULL AND property_record.user_id != user_id_param THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Not authorized to delete this property',
            'property_id', property_id_param
        );
    END IF;
    
    -- Start the deletion process (order matters due to foreign key constraints)
    
    -- 1. Delete notifications related to this property
    DELETE FROM public.notifications 
    WHERE property_id = property_id_param;
    GET DIAGNOSTICS notifications_deleted = ROW_COUNT;
    
    -- 2. Delete user activities related to this property
    DELETE FROM public.user_activities 
    WHERE property_id = property_id_param;
    GET DIAGNOSTICS activities_deleted = ROW_COUNT;
    
    -- 3. Delete property inquiries
    DELETE FROM public.property_inquiries 
    WHERE property_id = property_id_param;
    GET DIAGNOSTICS inquiries_deleted = ROW_COUNT;
    
    -- 4. Delete property verification details
    DELETE FROM public.property_verification_details 
    WHERE property_id = property_id_param;
    GET DIAGNOSTICS verifications_deleted = ROW_COUNT;
    
    -- 5. Delete featured properties log entries
    DELETE FROM public.featured_properties_log 
    WHERE property_id = property_id_param;
    GET DIAGNOSTICS featured_log_deleted = ROW_COUNT;
    
    -- 6. Delete any user inquiries that might reference this property
    DELETE FROM public.user_inquiries 
    WHERE details::text LIKE '%' || property_id_param::text || '%';
    GET DIAGNOSTICS user_inquiries_deleted = ROW_COUNT;
    
    -- 7. Delete research report leads that might reference this property
    DELETE FROM public.research_report_leads 
    WHERE property_details::text LIKE '%' || property_id_param::text || '%'
       OR additional_notes::text LIKE '%' || property_id_param::text || '%';
    GET DIAGNOSTICS research_leads_deleted = ROW_COUNT;
    
    -- 8. Finally, delete the property itself
    DELETE FROM public.properties 
    WHERE id = property_id_param;
    
    -- Build summary response
    deletion_summary := json_build_object(
        'success', true,
        'property_id', property_id_param,
        'property_title', property_record.title,
        'deleted_records', json_build_object(
            'notifications', notifications_deleted,
            'user_activities', activities_deleted,
            'property_inquiries', inquiries_deleted,
            'verification_details', verifications_deleted,
            'featured_log_entries', featured_log_deleted,
            'user_inquiries_references', user_inquiries_deleted,
            'research_leads_references', research_leads_deleted
        ),
        'deleted_at', NOW()
    );
    
    -- Log the deletion activity (if admin activity logging is available)
    BEGIN
        INSERT INTO public.admin_activities (
            admin_id,
            action_type,
            target_type,
            target_id,
            details,
            created_at
        ) VALUES (
            COALESCE(current_setting('app.current_admin_id', true)::UUID, user_id_param),
            'delete_property',
            'property',
            property_id_param,
            deletion_summary::text,
            NOW()
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- If admin activity logging fails, don't fail the whole operation
            NULL;
    END;
    
    RETURN deletion_summary;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'property_id', property_id_param
        );
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.safe_delete_property(UUID, UUID) TO authenticated;

-- Create a simplified wrapper function for admin use (doesn't require user_id)
CREATE OR REPLACE FUNCTION public.admin_delete_property(property_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT public.is_admin_authenticated() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Admin access required',
            'property_id', property_id_param
        );
    END IF;
    
    -- Call the main deletion function without user_id restriction
    RETURN public.safe_delete_property(property_id_param, NULL);
END;
$$;

-- Grant execution permissions to authenticated users (admin check is inside function)
GRANT EXECUTE ON FUNCTION public.admin_delete_property(UUID) TO authenticated;

-- Create an RPC function for easier frontend integration
CREATE OR REPLACE FUNCTION public.rpc_delete_property(property_id UUID, is_admin BOOLEAN DEFAULT false)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF is_admin THEN
        RETURN public.admin_delete_property(property_id);
    ELSE
        RETURN public.safe_delete_property(property_id, auth.uid());
    END IF;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.rpc_delete_property(UUID, BOOLEAN) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.safe_delete_property(UUID, UUID) IS 'Safely deletes a property and all related data while respecting foreign key constraints. Includes ownership validation when user_id is provided.';
COMMENT ON FUNCTION public.admin_delete_property(UUID) IS 'Admin-only function to delete any property without ownership restrictions';
COMMENT ON FUNCTION public.rpc_delete_property(UUID, BOOLEAN) IS 'RPC function for frontend integration - handles both admin and user property deletion';