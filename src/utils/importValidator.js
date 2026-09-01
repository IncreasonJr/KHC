// /home/caleb/Desktop/PROJECTS/KHC/src/utils/importValidator.js

/**
 * Normalizes custom header fields to canonical database schema names
 * @param {Object} rawRow 
 * @returns {Object} Normalized row
 */
export const normalizeMemberRow = (rawRow) => {
  const normalized = {
    first_name: rawRow.first_name || rawRow.firstname || rawRow.first || '',
    last_name: rawRow.last_name || rawRow.lastname || rawRow.last || rawRow.surname || '',
    email: rawRow.email || rawRow.email_address || rawRow.mail || '',
    phone: rawRow.phone || rawRow.phone_number || rawRow.phone_mobile || rawRow.mobile || rawRow.telephone || '',
    address: rawRow.address || rawRow.home_address || rawRow.residence || '',
    date_of_birth: rawRow.date_of_birth || rawRow.dob || rawRow.birth_date || '',
    join_date: rawRow.join_date || rawRow.membership_date || rawRow.joined || new Date().toISOString().split('T')[0],
    status: rawRow.status || rawRow.membership_status || 'Active',
    role: rawRow.role || rawRow.ministry_role || 'Member',
    notes: rawRow.notes || rawRow.admin_notes || rawRow.remarks || ''
  };

  return normalized;
};

/**
 * Validates a batch of member rows
 * @param {Array<Object>} rows 
 * @param {Array<Object>} existingMembers - Existing system members to detect duplicates
 * @returns {Object} Validation summary with valid, invalid, and error items
 */
export const validateMemberImports = (rows, existingMembers = []) => {
  const validRows = [];
  const invalidRows = [];
  const errors = [];
  const seenEmails = new Set();
  const seenPhones = new Set();

  const existingEmailMap = new Set(existingMembers.map(m => (m.email || '').toLowerCase()).filter(Boolean));
  const existingPhoneMap = new Set(existingMembers.map(m => (m.phone || '').replace(/\s+/g, '')).filter(Boolean));

  rows.forEach((rawRow, index) => {
    const rowNum = index + 2; // Accounting for 1-indexed line numbers + header
    const row = normalizeMemberRow(rawRow);
    const rowErrors = [];

    // Required Field Validation
    if (!row.first_name) rowErrors.push('First name is required.');
    if (!row.last_name) rowErrors.push('Last name is required.');
    if (!row.email) {
      rowErrors.push('Email address is required.');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email.trim())) {
        rowErrors.push(`Invalid email format (${row.email}).`);
      }
    }

    const emailKey = (row.email || '').toLowerCase().trim();
    if (emailKey) {
      if (seenEmails.has(emailKey)) {
        rowErrors.push('Duplicate email within import file.');
      } else {
        seenEmails.add(emailKey);
      }

      if (existingEmailMap.has(emailKey)) {
        row.isDuplicateInDB = true;
        row.duplicateReason = 'Email already exists in church database.';
      }
    }

    const phoneKey = (row.phone || '').replace(/\s+/g, '');
    if (phoneKey) {
      if (seenPhones.has(phoneKey)) {
        rowErrors.push('Duplicate phone number within import file.');
      } else {
        seenPhones.add(phoneKey);
      }

      if (existingPhoneMap.has(phoneKey)) {
        row.isDuplicateInDB = true;
        row.duplicateReason = 'Phone number already exists in church database.';
      }
    }

    if (rowErrors.length > 0) {
      invalidRows.push({ rowNum, data: row, errors: rowErrors });
      errors.push({ rowNum, email: row.email, error: rowErrors.join(' ') });
    } else {
      validRows.push({ rowNum, data: row });
    }
  });

  return {
    total: rows.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    validRows,
    invalidRows,
    errors
  };
};
