// /home/caleb/Desktop/PROJECTS/KHC/src/services/memberService.js
import { supabase, isSupabaseConfigured } from './supabase';

const MOCK_MEMBERS = [
  {
    id: 'elijah-manning-1111',
    first_name: 'Elijah',
    last_name: 'Manning',
    email: 'elijah.m@email.com',
    phone: '024 019 2834',
    address: '124 Grace Ave, Graceville',
    date_of_birth: '1982-04-12',
    join_date: '2018-05-10',
    status: 'Active',
    role: 'Pastor',
    photo_url: '',
    notes: 'Senior Pastor of KHC. Dedicated to community outreach and youth ministries.'
  },
  {
    id: 'sarah-jenkins-2222',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    email: 'sarah.j@email.com',
    phone: '020 021 9876',
    address: '45 Redemption St, Graceville',
    date_of_birth: '1990-11-23',
    join_date: '2020-01-15',
    status: 'Active',
    role: 'Ministry Leader',
    photo_url: '',
    notes: 'Worship director. Organizes weekly musical rehearsals and audio setup.'
  },
  {
    id: 'david-koffi-3333',
    first_name: 'David',
    last_name: 'Koffi',
    email: 'david.k@email.com',
    phone: '055 098 1122',
    address: '777 Glory Rd, Graceville',
    date_of_birth: '1975-08-05',
    join_date: '2015-09-01',
    status: 'Active',
    role: 'Elder',
    photo_url: '',
    notes: 'Church Board Treasurer. Manages financial logs and regulatory checks.'
  },
  {
    id: 'hannah-peterson-4444',
    first_name: 'Hannah',
    last_name: 'Peterson',
    email: 'hannah.p@email.com',
    phone: '027 045 3344',
    address: '32 Trinity Lane, Graceville',
    date_of_birth: '1995-02-18',
    join_date: '2022-03-10',
    status: 'Active',
    role: 'Volunteer',
    photo_url: '',
    notes: 'Sunday school curriculum developer and assistant teacher.'
  },
  {
    id: 'james-ocampo-5555',
    first_name: 'James',
    last_name: 'Ocampo',
    email: 'james.o@email.com',
    phone: '050 012 7788',
    address: '89 Hope Blvd, Graceville',
    date_of_birth: '1988-06-30',
    join_date: '2021-08-20',
    status: 'Visitor',
    role: 'Member',
    photo_url: '',
    notes: 'Regular attendee looking to transition into a formal ministry volunteer role.'
  }
];

const getMockMembers = () => {
  const data = localStorage.getItem('khc_mock_members');
  if (!data) {
    localStorage.setItem('khc_mock_members', JSON.stringify(MOCK_MEMBERS));
    return MOCK_MEMBERS;
  }
  try {
    const parsed = JSON.parse(data);
    const hasLegacyPhone = parsed.some(m => m.phone && m.phone.includes('(555)'));
    if (hasLegacyPhone) {
      localStorage.setItem('khc_mock_members', JSON.stringify(MOCK_MEMBERS));
      return MOCK_MEMBERS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse mock members from localStorage, resetting database:', err);
    localStorage.setItem('khc_mock_members', JSON.stringify(MOCK_MEMBERS));
    return MOCK_MEMBERS;
  }
};

const saveMockMembers = (members) => {
  localStorage.setItem('khc_mock_members', JSON.stringify(members));
};

export const memberService = {
  // Fetch list of members
  async getMembers() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('last_name', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return getMockMembers().sort((a, b) => a.last_name.localeCompare(b.last_name));
    }
  },

  // Fetch individual member by primary ID key
  async getMemberById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const members = getMockMembers();
      const member = members.find((m) => m.id === id);
      if (!member) throw new Error('Member record not found in system database');
      return member;
    }
  },

  // Add new member record
  async createMember(memberData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('members')
        .insert([memberData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const members = getMockMembers();
      const newMember = {
        ...memberData,
        id: crypto.randomUUID ? crypto.randomUUID() : 'mock-uuid-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      members.push(newMember);
      saveMockMembers(members);
      return newMember;
    }
  },

  // Update existing member record by ID
  async updateMember(id, memberData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('members')
        .update(memberData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const members = getMockMembers();
      const idx = members.findIndex((m) => m.id === id);
      if (idx === -1) throw new Error('Member record not found in database');
      const updatedMember = {
        ...members[idx],
        ...memberData,
        updated_at: new Date().toISOString()
      };
      members[idx] = updatedMember;
      saveMockMembers(members);
      return updatedMember;
    }
  },

  // Remove member from registry
  async deleteMember(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const members = getMockMembers();
      const filtered = members.filter((m) => m.id !== id);
      saveMockMembers(filtered);
      return true;
    }
  },

  // Upload photo using Supabase Storage or Base64 encoding in local mock storage
  async uploadPhoto(file) {
    if (isSupabaseConfigured) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Bucket 'member-photos'
      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Fetch public link url
      const { data } = supabase.storage
        .from('member-photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } else {
      // Return a base64 data URL for local storage preview
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read and process profile image file'));
        };
        reader.readAsDataURL(file);
      });
    }
  }
};

export default memberService;
