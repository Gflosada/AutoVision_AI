import type {
  CustomizationType,
  FinishType,
  GenerationStatus,
  VehicleStyle,
} from "./app";
import type { SubscriptionPlan } from "./subscription";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_plan: SubscriptionPlan | null;
          stripe_customer_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_plan?: SubscriptionPlan | null;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_plan?: SubscriptionPlan | null;
          stripe_customer_id?: string | null;
        };
        Relationships: [];
      };
      vehicle_projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          vehicle_make: string;
          vehicle_model: string;
          vehicle_year: string;
          trim: string | null;
          body_type: string | null;
          current_color: string | null;
          original_image_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          vehicle_make: string;
          vehicle_model: string;
          vehicle_year: string;
          trim?: string | null;
          body_type?: string | null;
          current_color?: string | null;
          original_image_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicle_projects"]["Insert"]>;
        Relationships: [];
      };
      customization_generations: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          prompt: string;
          ai_prompt: string;
          customization_types: CustomizationType[];
          style: VehicleStyle | null;
          finish: FinishType | null;
          generated_image_url: string | null;
          original_image_url: string | null;
          is_saved: boolean;
          status: GenerationStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          prompt: string;
          ai_prompt: string;
          customization_types?: CustomizationType[];
          style?: VehicleStyle | null;
          finish?: FinishType | null;
          generated_image_url?: string | null;
          original_image_url?: string | null;
          is_saved?: boolean;
          status?: GenerationStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customization_generations"]["Insert"]>;
        Relationships: [];
      };
      usage_limits: {
        Row: {
          id: string;
          user_id: string;
          plan: SubscriptionPlan;
          monthly_limit: number;
          monthly_used: number;
          reset_date: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: SubscriptionPlan;
          monthly_limit?: number;
          monthly_used?: number;
          reset_date: string;
        };
        Update: {
          plan?: SubscriptionPlan;
          monthly_limit?: number;
          monthly_used?: number;
          reset_date?: string;
        };
        Relationships: [];
      };
      shop_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          logo_url: string | null;
          website: string | null;
          contact_email: string;
          phone: string | null;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          logo_url?: string | null;
          website?: string | null;
          contact_email: string;
          phone?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["shop_profiles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
