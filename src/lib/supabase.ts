import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string
          owner_id: string | null
          group_id: string | null
          vin: string | null
          year: number | null
          make: string
          model: string
          trim: string | null
          engine: string | null
          transmission: string | null
          fuel_type: string | null
          license_plate: string | null
          license_state: string | null
          nickname: string | null
          current_odometer: number | null
          odometer_unit: string | null
          purchase_date: string | null
          purchase_price: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id?: string | null
          group_id?: string | null
          vin?: string | null
          year?: number | null
          make: string
          model: string
          trim?: string | null
          engine?: string | null
          transmission?: string | null
          fuel_type?: string | null
          license_plate?: string | null
          license_state?: string | null
          nickname?: string | null
          current_odometer?: number | null
          odometer_unit?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string | null
          group_id?: string | null
          vin?: string | null
          year?: number | null
          make?: string
          model?: string
          trim?: string | null
          engine?: string | null
          transmission?: string | null
          fuel_type?: string | null
          license_plate?: string | null
          license_state?: string | null
          nickname?: string | null
          current_odometer?: number | null
          odometer_unit?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      fuel_logs: {
        Row: {
          id: string
          vehicle_id: string | null
          user_id: string | null
          fill_date: string
          odometer_reading: number
          fuel_amount: number
          fuel_unit: string | null
          price_per_unit: number | null
          total_cost: number | null
          fuel_grade: string | null
          fuel_brand: string | null
          station_location: string | null
          is_full_tank: boolean | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          vehicle_id?: string | null
          user_id?: string | null
          fill_date: string
          odometer_reading: number
          fuel_amount: number
          fuel_unit?: string | null
          price_per_unit?: number | null
          total_cost?: number | null
          fuel_grade?: string | null
          fuel_brand?: string | null
          station_location?: string | null
          is_full_tank?: boolean | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          vehicle_id?: string | null
          user_id?: string | null
          fill_date?: string
          odometer_reading?: number
          fuel_amount?: number
          fuel_unit?: string | null
          price_per_unit?: number | null
          total_cost?: number | null
          fuel_grade?: string | null
          fuel_brand?: string | null
          station_location?: string | null
          is_full_tank?: boolean | null
          notes?: string | null
          created_at?: string | null
        }
      }
      maintenance_logs: {
        Row: {
          id: string
          vehicle_id: string | null
          user_id: string | null
          category_id: string | null
          service_date: string
          odometer_reading: number
          cost: number | null
          service_provider: string | null
          is_diy: boolean | null
          parts_used: string | null
          notes: string | null
          next_service_miles: number | null
          next_service_date: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          vehicle_id?: string | null
          user_id?: string | null
          category_id?: string | null
          service_date: string
          odometer_reading: number
          cost?: number | null
          service_provider?: string | null
          is_diy?: boolean | null
          parts_used?: string | null
          notes?: string | null
          next_service_miles?: number | null
          next_service_date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          vehicle_id?: string | null
          user_id?: string | null
          category_id?: string | null
          service_date?: string
          odometer_reading?: number
          cost?: number | null
          service_provider?: string | null
          is_diy?: boolean | null
          parts_used?: string | null
          notes?: string | null
          next_service_miles?: number | null
          next_service_date?: string | null
          created_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          preferred_units: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          preferred_units?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          preferred_units?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      fuel_statistics: {
        Row: {
          vehicle_id: string | null
          total_fillups: number | null
          avg_fuel_amount: number | null
          total_fuel_cost: number | null
          avg_price_per_unit: number | null
          avg_mpg: number | null
          last_fillup_date: string | null
          first_fillup_date: string | null
        }
      }
    }
  }
}