export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_activities: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activities_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_credentials: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          last_login: string | null
          password_hash: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          password_hash: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          password_hash?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      admin_login_attempts: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          success: boolean | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          username?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          admin_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          lead_id: string
          note: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          lead_id: string
          note: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_admin_id: string | null
          budget_range: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          last_contacted_at: string | null
          location: string | null
          name: string
          next_follow_up_at: string | null
          notes: string | null
          phone: string
          priority: Database["public"]["Enums"]["lead_priority"]
          property_id: string | null
          property_title: string | null
          property_type: string | null
          purpose: string | null
          source_id: string | null
          source_type: string
          status: Database["public"]["Enums"]["lead_status"]
          tags: string[]
          updated_at: string
        }
        Insert: {
          assigned_admin_id?: string | null
          budget_range?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          location?: string | null
          name: string
          next_follow_up_at?: string | null
          notes?: string | null
          phone: string
          priority?: Database["public"]["Enums"]["lead_priority"]
          property_id?: string | null
          property_title?: string | null
          property_type?: string | null
          purpose?: string | null
          source_id?: string | null
          source_type: string
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[]
          updated_at?: string
        }
        Update: {
          assigned_admin_id?: string | null
          budget_range?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          location?: string | null
          name?: string
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string
          priority?: Database["public"]["Enums"]["lead_priority"]
          property_id?: string | null
          property_title?: string | null
          property_type?: string | null
          purpose?: string | null
          source_id?: string | null
          source_type?: string
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "admin_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data: {
        Row: {
          area_name: string
          avg_price: number
          created_at: string
          demand_level: string
          demand_score: number | null
          demand_trend: string | null
          display_order: number
          growth_rate: number | null
          growth_trend: string | null
          id: string
          is_active: boolean
          price_change: number
          price_trend_direction: string | null
          roi_percentage: number | null
          roi_trend: string | null
          total_properties: number
          trend: string
          updated_at: string
        }
        Insert: {
          area_name: string
          avg_price?: number
          created_at?: string
          demand_level?: string
          demand_score?: number | null
          demand_trend?: string | null
          display_order?: number
          growth_rate?: number | null
          growth_trend?: string | null
          id?: string
          is_active?: boolean
          price_change?: number
          price_trend_direction?: string | null
          roi_percentage?: number | null
          roi_trend?: string | null
          total_properties?: number
          trend?: string
          updated_at?: string
        }
        Update: {
          area_name?: string
          avg_price?: number
          created_at?: string
          demand_level?: string
          demand_score?: number | null
          demand_trend?: string | null
          display_order?: number
          growth_rate?: number | null
          growth_trend?: string | null
          id?: string
          is_active?: boolean
          price_change?: number
          price_trend_direction?: string | null
          roi_percentage?: number | null
          roi_trend?: string | null
          total_properties?: number
          trend?: string
          updated_at?: string
        }
        Relationships: []
      }
      market_insights: {
        Row: {
          color_scheme: string
          created_at: string
          description: string
          display_order: number
          icon_type: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          value: string
        }
        Insert: {
          color_scheme?: string
          created_at?: string
          description: string
          display_order?: number
          icon_type?: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          value: string
        }
        Update: {
          color_scheme?: string
          created_at?: string
          description?: string
          display_order?: number
          icon_type?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          property_id: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          property_id?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          property_id?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_otps: {
        Row: {
          consumed: boolean
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          otp_hash: string
          phone: string
          purpose: string
          updated_at: string
        }
        Insert: {
          consumed?: boolean
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          otp_hash: string
          phone: string
          purpose?: string
          updated_at?: string
        }
        Update: {
          consumed?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          otp_hash?: string
          phone?: string
          purpose?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          mobile_verified: boolean | null
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mobile_verified?: boolean | null
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mobile_verified?: boolean | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          additional_notes: string | null
          age_of_property: number | null
          agent_name: string | null
          agent_phone: string | null
          airport_distance: number | null
          amenities: string[] | null
          appreciation_forecast: string | null
          approval_status: string | null
          approvals_obtained: string[] | null
          backup_power: string | null
          balconies: number | null
          bathroom_fittings: string | null
          bathrooms: number | null
          bhk: number | null
          bhk_type: string | null
          boundary_wall: boolean | null
          broadband_ready: boolean | null
          building_age: number | null
          building_grade: string | null
          built_up_area: number | null
          built_year: number | null
          business_licenses: string[] | null
          cabin_count: number | null
          carpet_area: number | null
          cctv_surveillance: boolean | null
          city: string
          conference_rooms: number | null
          construction_grade: string | null
          construction_materials: string[] | null
          construction_quality: string | null
          construction_status: string | null
          contact_number: string | null
          corner_property: boolean | null
          created_at: string
          crop_history: string[] | null
          description: string | null
          development_permissions: string[] | null
          display_windows: number | null
          documentation_status: string | null
          earthquake_resistant: boolean | null
          electricity_backup: string | null
          electricity_connection: string | null
          electricity_load: number | null
          email_address: string | null
          expected_appreciation: number | null
          facing: string | null
          facing_direction: string | null
          facing_direction_detailed: string | null
          farm_equipment_included: boolean | null
          featured_at: string | null
          featured_until: string | null
          fire_safety_features: string[] | null
          floor: string | null
          floor_details: string | null
          floor_number: number | null
          floor_plan_type: string | null
          foot_traffic_rating: string | null
          front_footage: number | null
          full_name: string | null
          furnishing: string | null
          furnishing_detailed: string | null
          furnishing_status: string | null
          gated_community: boolean | null
          google_map_link: string | null
          highlights: string[] | null
          highway_connectivity: string | null
          id: string
          images: string[] | null
          investment_potential: string | null
          irrigation_type: string | null
          is_featured: boolean
          it_infrastructure: string[] | null
          khata_number: string | null
          language_preference: string | null
          legal_issues: string | null
          lift_available: boolean | null
          listing_status: string | null
          locality: string | null
          location: string
          maintenance_charges: number | null
          maintenance_required: boolean | null
          metro_connectivity: string | null
          modular_kitchen: boolean | null
          office_type: string | null
          owner_details: string | null
          ownership_type: string | null
          parking_spaces: number | null
          parking_type: string | null
          pincode: string | null
          plot_area: number | null
          plot_corner: boolean | null
          plot_length: number | null
          plot_shape: string | null
          plot_width: number | null
          possession_status: string | null
          possession_timeline: string | null
          preferred_contact_time: string[] | null
          price: number
          property_age: string | null
          property_category: string
          property_category_detailed: string | null
          property_condition: string | null
          property_purpose: string | null
          property_subtype: string | null
          property_subtype_detailed: string | null
          property_type: string
          public_transport_distance: number | null
          ready_to_move: boolean | null
          reception_area: boolean | null
          rental_yield: number | null
          revenue_records: string | null
          road_width: string | null
          security_deposit: number | null
          security_features: string[] | null
          sewerage_connection: boolean | null
          society_maintenance: number | null
          society_name: string | null
          soil_type: string | null
          structural_warranty: string | null
          submitted_by_user: boolean | null
          super_built_up_area: number | null
          survey_number: string | null
          title: string
          title_clear: boolean | null
          title_deed_clear: boolean | null
          total_floors: number | null
          transaction_type: string
          transaction_type_detailed: string | null
          under_construction: boolean | null
          updated_at: string
          user_id: string | null
          verification_completed_at: string | null
          verification_documentation: Json | null
          verification_score: number | null
          verification_status: string | null
          verification_submitted_at: string | null
          view_description: string | null
          wardrobes_count: number | null
          water_connection: string | null
          water_connection_type: string | null
          water_source: string[] | null
          water_supply: string | null
          zone_classification: string | null
        }
        Insert: {
          additional_notes?: string | null
          age_of_property?: number | null
          agent_name?: string | null
          agent_phone?: string | null
          airport_distance?: number | null
          amenities?: string[] | null
          appreciation_forecast?: string | null
          approval_status?: string | null
          approvals_obtained?: string[] | null
          backup_power?: string | null
          balconies?: number | null
          bathroom_fittings?: string | null
          bathrooms?: number | null
          bhk?: number | null
          bhk_type?: string | null
          boundary_wall?: boolean | null
          broadband_ready?: boolean | null
          building_age?: number | null
          building_grade?: string | null
          built_up_area?: number | null
          built_year?: number | null
          business_licenses?: string[] | null
          cabin_count?: number | null
          carpet_area?: number | null
          cctv_surveillance?: boolean | null
          city: string
          conference_rooms?: number | null
          construction_grade?: string | null
          construction_materials?: string[] | null
          construction_quality?: string | null
          construction_status?: string | null
          contact_number?: string | null
          corner_property?: boolean | null
          created_at?: string
          crop_history?: string[] | null
          description?: string | null
          development_permissions?: string[] | null
          display_windows?: number | null
          documentation_status?: string | null
          earthquake_resistant?: boolean | null
          electricity_backup?: string | null
          electricity_connection?: string | null
          electricity_load?: number | null
          email_address?: string | null
          expected_appreciation?: number | null
          facing?: string | null
          facing_direction?: string | null
          facing_direction_detailed?: string | null
          farm_equipment_included?: boolean | null
          featured_at?: string | null
          featured_until?: string | null
          fire_safety_features?: string[] | null
          floor?: string | null
          floor_details?: string | null
          floor_number?: number | null
          floor_plan_type?: string | null
          foot_traffic_rating?: string | null
          front_footage?: number | null
          full_name?: string | null
          furnishing?: string | null
          furnishing_detailed?: string | null
          furnishing_status?: string | null
          gated_community?: boolean | null
          google_map_link?: string | null
          highlights?: string[] | null
          highway_connectivity?: string | null
          id?: string
          images?: string[] | null
          investment_potential?: string | null
          irrigation_type?: string | null
          is_featured?: boolean
          it_infrastructure?: string[] | null
          khata_number?: string | null
          language_preference?: string | null
          legal_issues?: string | null
          lift_available?: boolean | null
          listing_status?: string | null
          locality?: string | null
          location: string
          maintenance_charges?: number | null
          maintenance_required?: boolean | null
          metro_connectivity?: string | null
          modular_kitchen?: boolean | null
          office_type?: string | null
          owner_details?: string | null
          ownership_type?: string | null
          parking_spaces?: number | null
          parking_type?: string | null
          pincode?: string | null
          plot_area?: number | null
          plot_corner?: boolean | null
          plot_length?: number | null
          plot_shape?: string | null
          plot_width?: number | null
          possession_status?: string | null
          possession_timeline?: string | null
          preferred_contact_time?: string[] | null
          price: number
          property_age?: string | null
          property_category?: string
          property_category_detailed?: string | null
          property_condition?: string | null
          property_purpose?: string | null
          property_subtype?: string | null
          property_subtype_detailed?: string | null
          property_type: string
          public_transport_distance?: number | null
          ready_to_move?: boolean | null
          reception_area?: boolean | null
          rental_yield?: number | null
          revenue_records?: string | null
          road_width?: string | null
          security_deposit?: number | null
          security_features?: string[] | null
          sewerage_connection?: boolean | null
          society_maintenance?: number | null
          society_name?: string | null
          soil_type?: string | null
          structural_warranty?: string | null
          submitted_by_user?: boolean | null
          super_built_up_area?: number | null
          survey_number?: string | null
          title: string
          title_clear?: boolean | null
          title_deed_clear?: boolean | null
          total_floors?: number | null
          transaction_type?: string
          transaction_type_detailed?: string | null
          under_construction?: boolean | null
          updated_at?: string
          user_id?: string | null
          verification_completed_at?: string | null
          verification_documentation?: Json | null
          verification_score?: number | null
          verification_status?: string | null
          verification_submitted_at?: string | null
          view_description?: string | null
          wardrobes_count?: number | null
          water_connection?: string | null
          water_connection_type?: string | null
          water_source?: string[] | null
          water_supply?: string | null
          zone_classification?: string | null
        }
        Update: {
          additional_notes?: string | null
          age_of_property?: number | null
          agent_name?: string | null
          agent_phone?: string | null
          airport_distance?: number | null
          amenities?: string[] | null
          appreciation_forecast?: string | null
          approval_status?: string | null
          approvals_obtained?: string[] | null
          backup_power?: string | null
          balconies?: number | null
          bathroom_fittings?: string | null
          bathrooms?: number | null
          bhk?: number | null
          bhk_type?: string | null
          boundary_wall?: boolean | null
          broadband_ready?: boolean | null
          building_age?: number | null
          building_grade?: string | null
          built_up_area?: number | null
          built_year?: number | null
          business_licenses?: string[] | null
          cabin_count?: number | null
          carpet_area?: number | null
          cctv_surveillance?: boolean | null
          city?: string
          conference_rooms?: number | null
          construction_grade?: string | null
          construction_materials?: string[] | null
          construction_quality?: string | null
          construction_status?: string | null
          contact_number?: string | null
          corner_property?: boolean | null
          created_at?: string
          crop_history?: string[] | null
          description?: string | null
          development_permissions?: string[] | null
          display_windows?: number | null
          documentation_status?: string | null
          earthquake_resistant?: boolean | null
          electricity_backup?: string | null
          electricity_connection?: string | null
          electricity_load?: number | null
          email_address?: string | null
          expected_appreciation?: number | null
          facing?: string | null
          facing_direction?: string | null
          facing_direction_detailed?: string | null
          farm_equipment_included?: boolean | null
          featured_at?: string | null
          featured_until?: string | null
          fire_safety_features?: string[] | null
          floor?: string | null
          floor_details?: string | null
          floor_number?: number | null
          floor_plan_type?: string | null
          foot_traffic_rating?: string | null
          front_footage?: number | null
          full_name?: string | null
          furnishing?: string | null
          furnishing_detailed?: string | null
          furnishing_status?: string | null
          gated_community?: boolean | null
          google_map_link?: string | null
          highlights?: string[] | null
          highway_connectivity?: string | null
          id?: string
          images?: string[] | null
          investment_potential?: string | null
          irrigation_type?: string | null
          is_featured?: boolean
          it_infrastructure?: string[] | null
          khata_number?: string | null
          language_preference?: string | null
          legal_issues?: string | null
          lift_available?: boolean | null
          listing_status?: string | null
          locality?: string | null
          location?: string
          maintenance_charges?: number | null
          maintenance_required?: boolean | null
          metro_connectivity?: string | null
          modular_kitchen?: boolean | null
          office_type?: string | null
          owner_details?: string | null
          ownership_type?: string | null
          parking_spaces?: number | null
          parking_type?: string | null
          pincode?: string | null
          plot_area?: number | null
          plot_corner?: boolean | null
          plot_length?: number | null
          plot_shape?: string | null
          plot_width?: number | null
          possession_status?: string | null
          possession_timeline?: string | null
          preferred_contact_time?: string[] | null
          price?: number
          property_age?: string | null
          property_category?: string
          property_category_detailed?: string | null
          property_condition?: string | null
          property_purpose?: string | null
          property_subtype?: string | null
          property_subtype_detailed?: string | null
          property_type?: string
          public_transport_distance?: number | null
          ready_to_move?: boolean | null
          reception_area?: boolean | null
          rental_yield?: number | null
          revenue_records?: string | null
          road_width?: string | null
          security_deposit?: number | null
          security_features?: string[] | null
          sewerage_connection?: boolean | null
          society_maintenance?: number | null
          society_name?: string | null
          soil_type?: string | null
          structural_warranty?: string | null
          submitted_by_user?: boolean | null
          super_built_up_area?: number | null
          survey_number?: string | null
          title?: string
          title_clear?: boolean | null
          title_deed_clear?: boolean | null
          total_floors?: number | null
          transaction_type?: string
          transaction_type_detailed?: string | null
          under_construction?: boolean | null
          updated_at?: string
          user_id?: string | null
          verification_completed_at?: string | null
          verification_documentation?: Json | null
          verification_score?: number | null
          verification_status?: string | null
          verification_submitted_at?: string | null
          view_description?: string | null
          wardrobes_count?: number | null
          water_connection?: string | null
          water_connection_type?: string | null
          water_source?: string[] | null
          water_supply?: string | null
          zone_classification?: string | null
        }
        Relationships: []
      }
      property_feature_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          property_id: string
          requested_at: string
          reviewed_at: string | null
          reviewed_by_admin_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          property_id: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          property_id?: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_inquiries: {
        Row: {
          created_at: string
          id: string
          inquiry_type: string
          is_verified: boolean
          message: string | null
          property_id: string
          user_name: string
          user_phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          inquiry_type: string
          is_verified?: boolean
          message?: string | null
          property_id: string
          user_name: string
          user_phone: string
        }
        Update: {
          created_at?: string
          id?: string
          inquiry_type?: string
          is_verified?: boolean
          message?: string | null
          property_id?: string
          user_name?: string
          user_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_verification_details: {
        Row: {
          accuracy_score: number | null
          actual_photos_uploaded: boolean | null
          additional_notes: string | null
          completeness_score: number | null
          construction_status: string | null
          contact_number: string
          created_at: string
          documentation_score: number | null
          email_address: string
          full_name: string
          id: string
          language_preference: string | null
          legal_issues: string | null
          ownership_type: string | null
          preferred_contact_time: string[] | null
          property_age: string | null
          property_condition: string | null
          property_id: string
          submitted_by_user_id: string | null
          title_clear: boolean | null
          updated_at: string
          verification_notes: string | null
          verified_by_admin_id: string | null
        }
        Insert: {
          accuracy_score?: number | null
          actual_photos_uploaded?: boolean | null
          additional_notes?: string | null
          completeness_score?: number | null
          construction_status?: string | null
          contact_number: string
          created_at?: string
          documentation_score?: number | null
          email_address: string
          full_name: string
          id?: string
          language_preference?: string | null
          legal_issues?: string | null
          ownership_type?: string | null
          preferred_contact_time?: string[] | null
          property_age?: string | null
          property_condition?: string | null
          property_id: string
          submitted_by_user_id?: string | null
          title_clear?: boolean | null
          updated_at?: string
          verification_notes?: string | null
          verified_by_admin_id?: string | null
        }
        Update: {
          accuracy_score?: number | null
          actual_photos_uploaded?: boolean | null
          additional_notes?: string | null
          completeness_score?: number | null
          construction_status?: string | null
          contact_number?: string
          created_at?: string
          documentation_score?: number | null
          email_address?: string
          full_name?: string
          id?: string
          language_preference?: string | null
          legal_issues?: string | null
          ownership_type?: string | null
          preferred_contact_time?: string[] | null
          property_age?: string | null
          property_condition?: string | null
          property_id?: string
          submitted_by_user_id?: string | null
          title_clear?: boolean | null
          updated_at?: string
          verification_notes?: string | null
          verified_by_admin_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_verification_details_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      research_report_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          is_verified_user: boolean
          requested_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_verified_user?: boolean
          requested_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_verified_user?: boolean
          requested_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      translations: {
        Row: {
          context: string | null
          created_at: string
          hit_count: number
          id: string
          last_accessed: string | null
          provider: string
          source: string
          source_lang: string
          target_lang: string
          translated: string
          updated_at: string
          usage: Json | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          hit_count?: number
          id?: string
          last_accessed?: string | null
          provider?: string
          source: string
          source_lang?: string
          target_lang?: string
          translated: string
          updated_at?: string
          usage?: Json | null
        }
        Update: {
          context?: string | null
          created_at?: string
          hit_count?: number
          id?: string
          last_accessed?: string | null
          provider?: string
          source?: string
          source_lang?: string
          target_lang?: string
          translated?: string
          updated_at?: string
          usage?: Json | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          property_id: string | null
          search_query: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          property_id?: string | null
          search_query?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          property_id?: string | null
          search_query?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_inquiries: {
        Row: {
          bedrooms: string
          budget_range: string
          created_at: string
          id: string
          is_verified: boolean
          location: string
          name: string
          phone: string
          property_type: string
          purpose: string
        }
        Insert: {
          bedrooms: string
          budget_range: string
          created_at?: string
          id?: string
          is_verified?: boolean
          location: string
          name: string
          phone: string
          property_type: string
          purpose: string
        }
        Update: {
          bedrooms?: string
          budget_range?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          location?: string
          name?: string
          phone?: string
          property_type?: string
          purpose?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_secondary_contacts: {
        Row: {
          contact_number: string
          contact_type: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          contact_number: string
          contact_type?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          contact_number?: string
          contact_type?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_admin: {
        Args: { _password: string; _username: string }
        Returns: {
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          username: string
        }[]
      }
      can_view_contact_info: {
        Args: { property_user_id: string }
        Returns: boolean
      }
      cleanup_expired_admin_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_admin_credential: {
        Args: {
          _password: string
          _role?: Database["public"]["Enums"]["app_role"]
          _username: string
        }
        Returns: string
      }
      create_admin_session: {
        Args: { _admin_id: string; _ip_address?: string; _user_agent?: string }
        Returns: string
      }
      create_lead_from_inquiry: {
        Args: { _source_id: string; _source_type: string }
        Returns: string
      }
      delete_admin_credential: {
        Args: { _admin_id: string }
        Returns: boolean
      }
      get_admin_activities: {
        Args: {
          _action_type?: string
          _admin_id?: string
          _end_date?: string
          _limit?: number
          _offset?: number
          _start_date?: string
          _target_type?: string
        }
        Returns: {
          action_type: string
          admin_id: string
          admin_username: string
          created_at: string
          details: Json
          id: string
          ip_address: string
          target_id: string
          target_type: string
          user_agent: string
        }[]
      }
      get_admin_credentials: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          last_login: string
          role: Database["public"]["Enums"]["app_role"]
          username: string
        }[]
      }
      get_properties_filtered: {
        Args: { include_contact_info?: boolean }
        Returns: {
          age_of_property: number
          agent_name: string
          agent_phone: string
          amenities: string[]
          approval_status: string
          balconies: number
          bathrooms: number
          bhk: number
          bhk_type: string
          built_up_area: number
          built_year: number
          carpet_area: number
          city: string
          construction_status: string
          contact_number: string
          created_at: string
          description: string
          documentation_status: string
          electricity_backup: string
          email_address: string
          facing_direction: string
          featured_at: string
          floor_number: number
          full_name: string
          furnishing_status: string
          highlights: string[]
          id: string
          images: string[]
          is_featured: boolean
          listing_status: string
          locality: string
          location: string
          ownership_type: string
          parking_spaces: number
          parking_type: string
          pincode: string
          plot_area: number
          possession_status: string
          price: number
          property_age: string
          property_category: string
          property_condition: string
          property_subtype: string
          property_type: string
          security_features: string[]
          super_built_up_area: number
          title: string
          total_floors: number
          transaction_type: string
          updated_at: string
          user_id: string
          verification_status: string
          water_supply: string
        }[]
      }
      get_properties_safe: {
        Args: {
          include_contact?: boolean
          limit_count?: number
          property_ids?: string[]
        }
        Returns: {
          additional_notes: string | null
          age_of_property: number | null
          agent_name: string | null
          agent_phone: string | null
          airport_distance: number | null
          amenities: string[] | null
          appreciation_forecast: string | null
          approval_status: string | null
          approvals_obtained: string[] | null
          backup_power: string | null
          balconies: number | null
          bathroom_fittings: string | null
          bathrooms: number | null
          bhk: number | null
          bhk_type: string | null
          boundary_wall: boolean | null
          broadband_ready: boolean | null
          building_age: number | null
          building_grade: string | null
          built_up_area: number | null
          built_year: number | null
          business_licenses: string[] | null
          cabin_count: number | null
          carpet_area: number | null
          cctv_surveillance: boolean | null
          city: string
          conference_rooms: number | null
          construction_grade: string | null
          construction_materials: string[] | null
          construction_quality: string | null
          construction_status: string | null
          contact_number: string | null
          corner_property: boolean | null
          created_at: string
          crop_history: string[] | null
          description: string | null
          development_permissions: string[] | null
          display_windows: number | null
          documentation_status: string | null
          earthquake_resistant: boolean | null
          electricity_backup: string | null
          electricity_connection: string | null
          electricity_load: number | null
          email_address: string | null
          expected_appreciation: number | null
          facing: string | null
          facing_direction: string | null
          facing_direction_detailed: string | null
          farm_equipment_included: boolean | null
          featured_at: string | null
          featured_until: string | null
          fire_safety_features: string[] | null
          floor: string | null
          floor_details: string | null
          floor_number: number | null
          floor_plan_type: string | null
          foot_traffic_rating: string | null
          front_footage: number | null
          full_name: string | null
          furnishing: string | null
          furnishing_detailed: string | null
          furnishing_status: string | null
          gated_community: boolean | null
          google_map_link: string | null
          highlights: string[] | null
          highway_connectivity: string | null
          id: string
          images: string[] | null
          investment_potential: string | null
          irrigation_type: string | null
          is_featured: boolean
          it_infrastructure: string[] | null
          khata_number: string | null
          language_preference: string | null
          legal_issues: string | null
          lift_available: boolean | null
          listing_status: string | null
          locality: string | null
          location: string
          maintenance_charges: number | null
          maintenance_required: boolean | null
          metro_connectivity: string | null
          modular_kitchen: boolean | null
          office_type: string | null
          owner_details: string | null
          ownership_type: string | null
          parking_spaces: number | null
          parking_type: string | null
          pincode: string | null
          plot_area: number | null
          plot_corner: boolean | null
          plot_length: number | null
          plot_shape: string | null
          plot_width: number | null
          possession_status: string | null
          possession_timeline: string | null
          preferred_contact_time: string[] | null
          price: number
          property_age: string | null
          property_category: string
          property_category_detailed: string | null
          property_condition: string | null
          property_purpose: string | null
          property_subtype: string | null
          property_subtype_detailed: string | null
          property_type: string
          public_transport_distance: number | null
          ready_to_move: boolean | null
          reception_area: boolean | null
          rental_yield: number | null
          revenue_records: string | null
          road_width: string | null
          security_deposit: number | null
          security_features: string[] | null
          sewerage_connection: boolean | null
          society_maintenance: number | null
          society_name: string | null
          soil_type: string | null
          structural_warranty: string | null
          submitted_by_user: boolean | null
          super_built_up_area: number | null
          survey_number: string | null
          title: string
          title_clear: boolean | null
          title_deed_clear: boolean | null
          total_floors: number | null
          transaction_type: string
          transaction_type_detailed: string | null
          under_construction: boolean | null
          updated_at: string
          user_id: string | null
          verification_completed_at: string | null
          verification_documentation: Json | null
          verification_score: number | null
          verification_status: string | null
          verification_submitted_at: string | null
          view_description: string | null
          wardrobes_count: number | null
          water_connection: string | null
          water_connection_type: string | null
          water_source: string[] | null
          water_supply: string | null
          zone_classification: string | null
        }[]
      }
      get_secure_property_fields: {
        Args: { include_sensitive?: boolean }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_request: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_activity: {
        Args: {
          _action_type: string
          _admin_id: string
          _details?: Json
          _ip_address?: string
          _target_id?: string
          _target_type?: string
          _user_agent?: string
        }
        Returns: string
      }
      revoke_admin_session: {
        Args: { _session_token: string }
        Returns: boolean
      }
      set_admin_session: {
        Args: { admin_role: string }
        Returns: undefined
      }
      toggle_admin_status: {
        Args: { _admin_id: string }
        Returns: boolean
      }
      update_admin_password: {
        Args: { _admin_id: string; _new_password: string }
        Returns: boolean
      }
      update_admin_username: {
        Args: { _admin_id: string; _new_username: string }
        Returns: boolean
      }
      validate_admin_session: {
        Args: { _session_token: string }
        Returns: {
          admin_id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          username: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "superadmin"
        | "super_super_admin"
      lead_priority: "low" | "medium" | "high" | "urgent"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
        | "archived"
        | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "moderator",
        "user",
        "superadmin",
        "super_super_admin",
      ],
      lead_priority: ["low", "medium", "high", "urgent"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
        "archived",
        "closed",
      ],
    },
  },
} as const
