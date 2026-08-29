// /home/caleb/Desktop/PROJECTS/KHC/src/utils/validators.js

export const validators = {
  email: {
    required: 'Email address is required',
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: 'Please enter a valid email address (e.g. name@domain.com)'
    }
  },
  phone: {
    pattern: {
      value: /^(?:\+233[-. ]*[235]\d|0[235]\d)[-. ]*\d{3}[-. ]*\d{4}$/,
      message: 'Please enter a valid Ghana phone number (e.g. 024 123 4567 or +233 24 123 4567)'
    }
  },
  name: {
    required: 'This field is required',
    minLength: {
      value: 2,
      message: 'Name must contain at least 2 characters'
    },
    pattern: {
      value: /^[a-zA-Z\s\-']+$/,
      message: 'Names can only contain alphabetical characters, hyphens, and apostrophes'
    }
  },
  givingAmount: {
    required: 'Giving amount is required',
    min: {
      value: 0.01,
      message: 'Amount must be greater than $0.00'
    },
    pattern: {
      value: /^\d+(\.\d{1,2})?$/,
      message: 'Please enter a valid monetary amount (e.g. 100 or 100.50)'
    }
  }
};

export default validators;
