
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "club_consent": {
                  Row: {
                    "granted_at": string,"owner_id": string,"owner_label": string,"revoked_at": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "granted_at"?: string,"owner_id": string,"owner_label"?: string,"revoked_at"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "granted_at"?: string,"owner_id"?: string,"owner_label"?: string,"revoked_at"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"club_examples": {
                  Row: {
                    "created_at": string,"day_count": number,"id": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"day_count"?: number,"id"?: string,"name": string
                  }
                  Update: {
                    "created_at"?: string,"day_count"?: number,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"diary_entries": {
                  Row: {
                    "action": string,"body": string,"created_at": string,"day_number": number,"id": string,"lived_on": string,"milestone": boolean,"mood": string | null,"tree_id": string,"weather": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"body": string,"created_at"?: string,"day_number": number,"id"?: string,"lived_on": string,"milestone"?: boolean,"mood"?: string | null,"tree_id": string,"weather"?: Json | null
                  }
                  Update: {
                    "action"?: string,"body"?: string,"created_at"?: string,"day_number"?: number,"id"?: string,"lived_on"?: string,"milestone"?: boolean,"mood"?: string | null,"tree_id"?: string,"weather"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "diary_entries_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "trees"
      referencedColumns: ["id"]
    }
                  ]
                },"gifts": {
                  Row: {
                    "created_at": string,"gift": string,"how": string,"id": string,"included": boolean,"letter_id": string | null,"month_number": number,"tree_id": string,"use": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"gift": string,"how": string,"id"?: string,"included"?: boolean,"letter_id"?: string | null,"month_number": number,"tree_id": string,"use": string
                  }
                  Update: {
                    "created_at"?: string,"gift"?: string,"how"?: string,"id"?: string,"included"?: boolean,"letter_id"?: string | null,"month_number"?: number,"tree_id"?: string,"use"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "gifts_letter_id_fkey"
      columns: ["letter_id"]
isOneToOne: false
      referencedRelation: "letters"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "gifts_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "trees"
      referencedColumns: ["id"]
    }
                  ]
                },"letters": {
                  Row: {
                    "body": string,"created_at": string,"day_number": number,"emailed_at": string | null,"id": string,"kind": string,"read_at": string | null,"subject": string,"tree_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"created_at"?: string,"day_number"?: number,"emailed_at"?: string | null,"id"?: string,"kind": string,"read_at"?: string | null,"subject": string,"tree_id": string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"day_number"?: number,"emailed_at"?: string | null,"id"?: string,"kind"?: string,"read_at"?: string | null,"subject"?: string,"tree_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "letters_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "trees"
      referencedColumns: ["id"]
    }
                  ]
                },"messages": {
                  Row: {
                    "author": string,"body": string,"created_at": string,"id": string,"tree_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author": string,"body": string,"created_at"?: string,"id"?: string,"tree_id": string
                  }
                  Update: {
                    "author"?: string,"body"?: string,"created_at"?: string,"id"?: string,"tree_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "trees"
      referencedColumns: ["id"]
    }
                  ]
                },"morning_questions": {
                  Row: {
                    "answer": string | null,"answered_at": string | null,"created_at": string,"day_number": number,"id": string,"options": NonNullable<Json>,"question": string,"tree_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answer"?: string | null,"answered_at"?: string | null,"created_at"?: string,"day_number": number,"id"?: string,"options": NonNullable<Json>,"question": string,"tree_id": string
                  }
                  Update: {
                    "answer"?: string | null,"answered_at"?: string | null,"created_at"?: string,"day_number"?: number,"id"?: string,"options"?: NonNullable<Json>,"question"?: string,"tree_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "morning_questions_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "trees"
      referencedColumns: ["id"]
    }
                  ]
                },"tree_months": {
                  Row: {
                    "closed_at": string | null,"first_day": number,"id": string,"number": number,"recap": Json | null,"started_at": string,"tree_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "closed_at"?: string | null,"first_day"?: number,"id"?: string,"number": number,"recap"?: Json | null,"started_at"?: string,"tree_id": string
                  }
                  Update: {
                    "closed_at"?: string | null,"first_day"?: number,"id"?: string,"number"?: number,"recap"?: Json | null,"started_at"?: string,"tree_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "tree_months_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "trees"
      referencedColumns: ["id"]
    }
                  ]
                },"tree_weeks": {
                  Row: {
                    "best_day": number,"caption": string,"created_at": string,"emailed_at": string | null,"first_day": number,"id": string,"last_day": number,"note": string,"number": number,"subject": string,"tree_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "best_day": number,"caption": string,"created_at"?: string,"emailed_at"?: string | null,"first_day": number,"id"?: string,"last_day": number,"note": string,"number": number,"subject": string,"tree_id": string
                  }
                  Update: {
                    "best_day"?: number,"caption"?: string,"created_at"?: string,"emailed_at"?: string | null,"first_day"?: number,"id"?: string,"last_day"?: number,"note"?: string,"number"?: number,"subject"?: string,"tree_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "tree_weeks_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "trees"
      referencedColumns: ["id"]
    }
                  ]
                },"trees": {
                  Row: {
                    "biography": NonNullable<Json>,"city": string,"created_at": string,"day_count": number,"id": string,"last_weather": Json | null,"latitude": number,"longitude": number,"mood": string,"name": string,"owner_id": string,"owner_name": string | null,"path": string | null,"path_scores": NonNullable<Json>,"plan": string,"planted_at": string,"timezone": string,"today_action": string,"today_caption": string | null,"traits": NonNullable<Json>,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "biography"?: NonNullable<Json>,"city": string,"created_at"?: string,"day_count"?: number,"id"?: string,"last_weather"?: Json | null,"latitude": number,"longitude": number,"mood"?: string,"name": string,"owner_id": string,"owner_name"?: string | null,"path"?: string | null,"path_scores"?: NonNullable<Json>,"plan"?: string,"planted_at"?: string,"timezone"?: string,"today_action"?: string,"today_caption"?: string | null,"traits": NonNullable<Json>,"updated_at"?: string
                  }
                  Update: {
                    "biography"?: NonNullable<Json>,"city"?: string,"created_at"?: string,"day_count"?: number,"id"?: string,"last_weather"?: Json | null,"latitude"?: number,"longitude"?: number,"mood"?: string,"name"?: string,"owner_id"?: string,"owner_name"?: string | null,"path"?: string | null,"path_scores"?: NonNullable<Json>,"plan"?: string,"planted_at"?: string,"timezone"?: string,"today_action"?: string,"today_caption"?: string | null,"traits"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"unlocks": {
                  Row: {
                    "day_number": number,"id": string,"item": string,"mentioned": boolean,"tree_id": string,"unlocked_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "day_number": number,"id"?: string,"item": string,"mentioned"?: boolean,"tree_id": string,"unlocked_at"?: string
                  }
                  Update: {
                    "day_number"?: number,"id"?: string,"item"?: string,"mentioned"?: boolean,"tree_id"?: string,"unlocked_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "unlocks_tree_id_fkey"
      columns: ["tree_id"]
isOneToOne: false
      referencedRelation: "trees"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "club_forest": {
                  Row: {
                    "crescita": number | null,"esempio": boolean | null,"modello": number | null,"nome": string | null,"persona": string | null,"seme": string | null,"x": number | null,"z": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "club_contatori":
{ Args: Record<PropertyKey, never>; Returns: {
              "alberi": number,"esempi": number,"in_foresta": number,"questo_mese": number
            }[]
                           },
"club_frazione":
{ Args: { "testo": string }; Returns: number
                           },
"club_imul":
{ Args: { "a": number,"b": number }; Returns: number
                           },
"club_modello":
{ Args: { "testo": string }; Returns: number
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
