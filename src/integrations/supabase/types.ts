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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admission_applications: {
        Row: {
          aadhaar_number: string | null
          activities: string[] | null
          address: string | null
          admission_number: string | null
          allergies: string | null
          application_number: string | null
          applying_class: string | null
          assessment_date: string | null
          assessment_mode: string | null
          assessment_remarks: string | null
          assessment_result: string | null
          blood_group: string | null
          category: string | null
          city: string | null
          created_at: string
          current_step: number
          date_of_birth: string | null
          documents: Json
          email: string | null
          enrolled_at: string | null
          enrolled_student_id: string | null
          father_name: string | null
          father_occupation: string | null
          father_phone: string | null
          fee_breakdown: Json | null
          fee_total: number | null
          full_name: string | null
          gender: string | null
          guardian_name: string | null
          guardian_phone: string | null
          height: string | null
          hostel_required: boolean | null
          id: string
          medical_conditions: string | null
          medium: string | null
          mobile: string | null
          mother_name: string | null
          mother_occupation: string | null
          mother_phone: string | null
          nationality: string | null
          payment_date: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          pincode: string | null
          previous_class: string | null
          previous_marks: string | null
          previous_school: string | null
          religion: string | null
          resume_dob: string | null
          state: string | null
          status: string
          transport_required: boolean | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          activities?: string[] | null
          address?: string | null
          admission_number?: string | null
          allergies?: string | null
          application_number?: string | null
          applying_class?: string | null
          assessment_date?: string | null
          assessment_mode?: string | null
          assessment_remarks?: string | null
          assessment_result?: string | null
          blood_group?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          current_step?: number
          date_of_birth?: string | null
          documents?: Json
          email?: string | null
          enrolled_at?: string | null
          enrolled_student_id?: string | null
          father_name?: string | null
          father_occupation?: string | null
          father_phone?: string | null
          fee_breakdown?: Json | null
          fee_total?: number | null
          full_name?: string | null
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          height?: string | null
          hostel_required?: boolean | null
          id?: string
          medical_conditions?: string | null
          medium?: string | null
          mobile?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_phone?: string | null
          nationality?: string | null
          payment_date?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          pincode?: string | null
          previous_class?: string | null
          previous_marks?: string | null
          previous_school?: string | null
          religion?: string | null
          resume_dob?: string | null
          state?: string | null
          status?: string
          transport_required?: boolean | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          activities?: string[] | null
          address?: string | null
          admission_number?: string | null
          allergies?: string | null
          application_number?: string | null
          applying_class?: string | null
          assessment_date?: string | null
          assessment_mode?: string | null
          assessment_remarks?: string | null
          assessment_result?: string | null
          blood_group?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          current_step?: number
          date_of_birth?: string | null
          documents?: Json
          email?: string | null
          enrolled_at?: string | null
          enrolled_student_id?: string | null
          father_name?: string | null
          father_occupation?: string | null
          father_phone?: string | null
          fee_breakdown?: Json | null
          fee_total?: number | null
          full_name?: string | null
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          height?: string | null
          hostel_required?: boolean | null
          id?: string
          medical_conditions?: string | null
          medium?: string | null
          mobile?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_phone?: string | null
          nationality?: string | null
          payment_date?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          pincode?: string | null
          previous_class?: string | null
          previous_marks?: string | null
          previous_school?: string | null
          religion?: string | null
          resume_dob?: string | null
          state?: string | null
          status?: string
          transport_required?: boolean | null
          updated_at?: string
          weight?: string | null
        }
        Relationships: []
      }
      admissions: {
        Row: {
          address: string
          class_applying: string
          created_at: string
          date_of_birth: string
          documents_url: string | null
          father_name: string
          gender: string
          id: string
          mother_name: string
          parent_email: string
          parent_phone: string
          previous_school: string | null
          status: string
          student_name: string
          updated_at: string
        }
        Insert: {
          address: string
          class_applying: string
          created_at?: string
          date_of_birth: string
          documents_url?: string | null
          father_name: string
          gender: string
          id?: string
          mother_name: string
          parent_email: string
          parent_phone: string
          previous_school?: string | null
          status?: string
          student_name: string
          updated_at?: string
        }
        Update: {
          address?: string
          class_applying?: string
          created_at?: string
          date_of_birth?: string
          documents_url?: string | null
          father_name?: string
          gender?: string
          id?: string
          mother_name?: string
          parent_email?: string
          parent_phone?: string
          previous_school?: string | null
          status?: string
          student_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          image_url: string | null
          is_upcoming: boolean
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          image_url?: string | null
          is_upcoming?: boolean
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          image_url?: string | null
          is_upcoming?: boolean
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_subjects: {
        Row: {
          class: string
          created_at: string
          exam_date: string
          exam_id: string
          exam_time: string
          id: string
          subject_name: string
        }
        Insert: {
          class?: string
          created_at?: string
          exam_date: string
          exam_id: string
          exam_time?: string
          id?: string
          subject_name: string
        }
        Update: {
          class?: string
          created_at?: string
          exam_date?: string
          exam_id?: string
          exam_time?: string
          id?: string
          subject_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_subjects_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          academic_year: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          academic_year?: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fee_payments: {
        Row: {
          academic_year: string
          amount: number
          created_at: string
          father_name: string | null
          fee_category: string
          id: string
          payment_date: string
          payment_mode: string
          receipt_number: string
          remarks: string | null
          roll_number: string | null
          student_class: string
          student_name: string
        }
        Insert: {
          academic_year: string
          amount: number
          created_at?: string
          father_name?: string | null
          fee_category: string
          id?: string
          payment_date?: string
          payment_mode?: string
          receipt_number: string
          remarks?: string | null
          roll_number?: string | null
          student_class: string
          student_name: string
        }
        Update: {
          academic_year?: string
          amount?: number
          created_at?: string
          father_name?: string | null
          fee_category?: string
          id?: string
          payment_date?: string
          payment_mode?: string
          receipt_number?: string
          remarks?: string | null
          roll_number?: string | null
          student_class?: string
          student_name?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          title?: string
        }
        Relationships: []
      }
      mock_attempts: {
        Row: {
          answers: Json
          id: string
          percentage: number
          score: number
          started_at: string
          student_class: string
          student_name: string
          student_roll: string
          submitted_at: string | null
          test_id: string
          total: number
        }
        Insert: {
          answers?: Json
          id?: string
          percentage?: number
          score?: number
          started_at?: string
          student_class: string
          student_name: string
          student_roll: string
          submitted_at?: string | null
          test_id: string
          total?: number
        }
        Update: {
          answers?: Json
          id?: string
          percentage?: number
          score?: number
          started_at?: string
          student_class?: string
          student_name?: string
          student_roll?: string
          submitted_at?: string | null
          test_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "mock_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "mock_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_questions: {
        Row: {
          correct_option: string
          created_at: string
          difficulty: string | null
          id: string
          marks: number
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          position: number
          question_text: string
          question_type: string
          test_id: string
        }
        Insert: {
          correct_option: string
          created_at?: string
          difficulty?: string | null
          id?: string
          marks?: number
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          position?: number
          question_text: string
          question_type?: string
          test_id: string
        }
        Update: {
          correct_option?: string
          created_at?: string
          difficulty?: string | null
          id?: string
          marks?: number
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          position?: number
          question_text?: string
          question_type?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "mock_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_tests: {
        Row: {
          class: string
          created_at: string
          duration_minutes: number
          id: string
          instructions: string | null
          is_active: boolean
          subject: string
          title: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          class: string
          created_at?: string
          duration_minutes?: number
          id?: string
          instructions?: string | null
          is_active?: boolean
          subject: string
          title: string
          total_marks?: number
          updated_at?: string
        }
        Update: {
          class?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          instructions?: string | null
          is_active?: boolean
          subject?: string
          title?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          title?: string
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
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_results: {
        Row: {
          academic_year: string
          class: string
          created_at: string
          exam_type: string
          id: string
          rank: number | null
          roll_number: string
          section: string
          student_name: string
          subjects: Json
          updated_at: string
        }
        Insert: {
          academic_year?: string
          class: string
          created_at?: string
          exam_type?: string
          id?: string
          rank?: number | null
          roll_number: string
          section?: string
          student_name: string
          subjects?: Json
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class?: string
          created_at?: string
          exam_type?: string
          id?: string
          rank?: number | null
          roll_number?: string
          section?: string
          student_name?: string
          subjects?: Json
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          admission_date: string | null
          allergies: string | null
          blood_group: string | null
          city: string | null
          class: string
          created_at: string
          date_of_birth: string
          documents_url: string | null
          email: string | null
          father_name: string | null
          father_phone: string | null
          gender: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relation: string | null
          height: string | null
          id: string
          medical_conditions: string | null
          mother_name: string | null
          mother_phone: string | null
          name: string
          phone: string | null
          photo_url: string | null
          pincode: string | null
          roll_number: string
          section: string
          session: string | null
          state: string | null
          status: string
          student_id: string | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          allergies?: string | null
          blood_group?: string | null
          city?: string | null
          class: string
          created_at?: string
          date_of_birth: string
          documents_url?: string | null
          email?: string | null
          father_name?: string | null
          father_phone?: string | null
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relation?: string | null
          height?: string | null
          id?: string
          medical_conditions?: string | null
          mother_name?: string | null
          mother_phone?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          pincode?: string | null
          roll_number: string
          section?: string
          session?: string | null
          state?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          allergies?: string | null
          blood_group?: string | null
          city?: string | null
          class?: string
          created_at?: string
          date_of_birth?: string
          documents_url?: string | null
          email?: string | null
          father_name?: string | null
          father_phone?: string | null
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relation?: string | null
          height?: string | null
          id?: string
          medical_conditions?: string | null
          mother_name?: string | null
          mother_phone?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          pincode?: string | null
          roll_number?: string
          section?: string
          session?: string | null
          state?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string
          weight?: string | null
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
    }
    Views: {
      mock_questions_public: {
        Row: {
          created_at: string | null
          difficulty: string | null
          id: string | null
          marks: number | null
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          position: number | null
          question_text: string | null
          question_type: string | null
          test_id: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          id?: string | null
          marks?: number | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          position?: number | null
          question_text?: string | null
          question_type?: string | null
          test_id?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          id?: string | null
          marks?: number | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          position?: number | null
          question_text?: string | null
          question_type?: string | null
          test_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mock_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "mock_tests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_mock_attempt: {
        Args: {
          p_answers: Json
          p_student_class: string
          p_student_name: string
          p_student_roll: string
          p_test_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "teacher"
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
      app_role: ["admin", "moderator", "user", "teacher"],
    },
  },
} as const
