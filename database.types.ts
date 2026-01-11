export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      invites: {
        Row: {
          created_at: string;
          id: string;
          invited_by_id: string | null;
          invited_to_id: string | null;
          khata_id: string | null;
          status: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          invited_by_id?: string | null;
          invited_to_id?: string | null;
          khata_id?: string | null;
          status?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          invited_by_id?: string | null;
          invited_to_id?: string | null;
          khata_id?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "invites_invited_by_id_fkey";
            columns: ["invited_by_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invites_invited_to_id_fkey";
            columns: ["invited_to_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invites_khata_id_fkey";
            columns: ["khata_id"];
            isOneToOne: false;
            referencedRelation: "khata";
            referencedColumns: ["id"];
          }
        ];
      };
      kharcha: {
        Row: {
          amount: number | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          khata_id: string | null;
          name: string | null;
          payment_mode: string | null;
          type: string | null;
          updated_at: string | null;
        };
        Insert: {
          amount?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          khata_id?: string | null;
          name?: string | null;
          payment_mode?: string | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          amount?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          khata_id?: string | null;
          name?: string | null;
          payment_mode?: string | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "kharcha_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "kharcha_khata_id_fkey";
            columns: ["khata_id"];
            isOneToOne: false;
            referencedRelation: "khata";
            referencedColumns: ["id"];
          }
        ];
      };
      khata: {
        Row: {
          cover_image: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          name: string | null;
          updated_at: string | null;
        };
        Insert: {
          cover_image?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          cover_image?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "khata_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      logged_in_devices: {
        Row: {
          device_name: string | null;
          expo_push_token: string | null;
          id: string;
          logged_in_at: string;
          user_id: string | null;
        };
        Insert: {
          device_name?: string | null;
          expo_push_token?: string | null;
          id?: string;
          logged_in_at?: string;
          user_id?: string | null;
        };
        Update: {
          device_name?: string | null;
          expo_push_token?: string | null;
          id?: string;
          logged_in_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "logged_in_devics_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      members: {
        Row: {
          created_at: string;
          id: string;
          khata_id: string | null;
          role: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          khata_id?: string | null;
          role?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          khata_id?: string | null;
          role?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "members_khata_id_fkey";
            columns: ["khata_id"];
            isOneToOne: false;
            referencedRelation: "khata";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          data: Json | null;
          id: string;
          is_viewed: boolean | null;
          title: string | null;
          type: string | null;
          user_id: string | null;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          data?: Json | null;
          id?: string;
          is_viewed?: boolean | null;
          title?: string | null;
          type?: string | null;
          user_id?: string | null;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          data?: Json | null;
          id?: string;
          is_viewed?: boolean | null;
          title?: string | null;
          type?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          avatar: string | null;
          created_at: string;
          email: string | null;
          expo_push_token: string | null;
          full_name: string | null;
          id: string;
          username: string | null;
        };
        Insert: {
          avatar?: string | null;
          created_at?: string;
          email?: string | null;
          expo_push_token?: string | null;
          full_name?: string | null;
          id?: string;
          username?: string | null;
        };
        Update: {
          avatar?: string | null;
          created_at?: string;
          email?: string | null;
          expo_push_token?: string | null;
          full_name?: string | null;
          id?: string;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_all_kharcha_by_members: {
        Args: Record<PropertyKey, never>;
        Returns: {
          amount: number;
          kharcha_id: string;
          khata_id: string;
          khata_name: string;
          role: string;
          user_id: string;
        }[];
      };
      get_khata_kharcha_for_individual: {
        Args: Record<PropertyKey, never>;
        Returns: {
          khata_id: string;
          khata_name: string;
          role: string;
          total_amount: number;
          user_id: string;
        }[];
      };
      get_khata_kharcha_summary: {
        Args: Record<PropertyKey, never>;
        Returns: {
          khata_id: string;
          khata_name: string;
          role: string;
          total_amount: number;
          user_id: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
