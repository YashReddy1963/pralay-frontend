export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: 'user' | 'state_chairman' | 'district_chairman' | 'nagar_panchayat_chairman' | 'village_sarpanch' | 'other' | 'admin' | 'team_member';
    state?: string;
    district?: string;
    nagar_panchayat?: string;
    village?: string;
    current_designation?: string;
    authority_level?: string;
    can_view_reports?: boolean;
    can_approve_reports?: boolean;
    can_manage_teams?: boolean;
    // Additional fields for team members
    designation?: string;
    authority?: string;
    // Additional fields for sub-authorities
    creator?: string;
  }
  
  export interface TeamMember {
    id: number;
    member_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role: string;
    custom_role: string;
    designation: string;
    permissions: any;
    assigned_date: string;
  }
  
  export interface SubAuthority {
    id: number;
    authority_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role: string;
    custom_role: string;
    state: string;
    district: string;
    nagar_panchayat: string;
    village: string;
    current_designation: string;
    created_date: string;
  }
  