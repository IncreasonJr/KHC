import apiFetch from './api';

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
  // Fetch list of all members
  async getMembers() {
    try {
      const res = await apiFetch('/api/members');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[PostgreSQL DB Warning]: Falling back to local storage for getMembers:', err.message);
      return getMockMembers().sort((a, b) => a.last_name.localeCompare(b.last_name));
    }
  },

  // Fetch stats summary
  async getMemberStats() {
    try {
      const res = await apiFetch('/api/members/stats');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[PostgreSQL DB Warning]: Falling back to local storage stats calculation:', err.message);
      const members = getMockMembers();
      return {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'Active').length,
        visitors: members.filter(m => m.status === 'Visitor').length,
        ministryLeaders: members.filter(m => m.role && m.role !== 'Member').length
      };
    }
  },

  // Fetch individual member by primary ID
  async getMemberById(id) {
    try {
      const res = await apiFetch(`/api/members/${id}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[PostgreSQL DB Warning]: Falling back to local storage for getMemberById:', err.message);
      const members = getMockMembers();
      const member = members.find((m) => m.id === id);
      if (!member) throw new Error('Member record not found in system database');
      return member;
    }
  },

  // Add new member record
  async createMember(memberData) {
    try {
      const res = await apiFetch('/api/members', {
        method: 'POST',
        body: JSON.stringify(memberData)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[PostgreSQL DB Warning]: Falling back to local storage for createMember:', err.message);
      const members = getMockMembers();
      const newMember = {
        ...memberData,
        id: memberData.id || 'mock-uuid-' + Math.random().toString(36).substring(2, 10),
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
    try {
      const res = await apiFetch(`/api/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(memberData)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[PostgreSQL DB Warning]: Falling back to local storage for updateMember:', err.message);
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
    try {
      const res = await apiFetch(`/api/members/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return true;
    } catch (err) {
      console.warn('[PostgreSQL DB Warning]: Falling back to local storage for deleteMember:', err.message);
      const members = getMockMembers();
      const filtered = members.filter((m) => m.id !== id);
      saveMockMembers(filtered);
      return true;
    }
  },

  // Upload and compress profile photo to square data URL avatar (max 400x400)
  async uploadPhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with 0.85 quality (~30-50KB)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to process image file format.'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  }
};

export default memberService;
