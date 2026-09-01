// /home/caleb/Desktop/PROJECTS/KHC/src/components/members/MemberForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { validators } from '../../utils/validators';
import { memberService } from '../../services/memberService';

export const MemberForm = ({ onSubmit, defaultValues = {}, isLoading = false }) => {
  const [photoUrl, setPhotoUrl] = useState(defaultValues.photo_url || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      first_name: defaultValues.first_name || '',
      last_name: defaultValues.last_name || '',
      email: defaultValues.email || '',
      phone: defaultValues.phone || '',
      address: defaultValues.address || '',
      date_of_birth: defaultValues.date_of_birth || '',
      join_date: defaultValues.join_date || new Date().toISOString().split('T')[0],
      status: defaultValues.status || 'Active',
      role: defaultValues.role || 'Member',
      notes: defaultValues.notes || '',
      photo_url: defaultValues.photo_url || ''
    }
  });

  // Sync photoUrl state and form values if defaultValues updates asynchronously
  React.useEffect(() => {
    if (defaultValues.photo_url) {
      setPhotoUrl(defaultValues.photo_url);
      setValue('photo_url', defaultValues.photo_url);
    }
  }, [defaultValues.photo_url, setValue]);

  // Dropzone Setup for image uploads
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const publicUrl = await memberService.uploadPhoto(file);
      setPhotoUrl(publicUrl);
      setValue('photo_url', publicUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false
  });

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      photo_url: photoUrl
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="glass-panel animate-slide-up" style={{ padding: '2rem' }}>
      
      {/* Photo Upload Section */}
      <div style={{ marginBottom: '2rem' }}>
        <label className="form-label">Profile Photo</label>
        <div 
          {...getRootProps()} 
          className={`dropzone-container ${isDragActive ? 'active' : ''}`}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={28} className="dropzone-icon" style={{ animation: 'spin 1.5s linear infinite' }} />
              <p className="dropzone-text">Uploading profile photo...</p>
            </div>
          ) : photoUrl ? (
            <div className="dropzone-preview">
              <img src={photoUrl} alt="Preview" />
              <div style={{ textAlign: 'left' }}>
                <p className="dropzone-text" style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Check size={16} /> Photo uploaded successfully
                </p>
                <p className="dropzone-text" style={{ fontSize: '0.75rem' }}>Drag & drop or click to replace</p>
              </div>
            </div>
          ) : (
            <>
              <Upload size={28} className="dropzone-icon" />
              {isDragActive ? (
                <p className="dropzone-text" style={{ color: 'var(--gold-primary)' }}>Drop the image here...</p>
              ) : (
                <p className="dropzone-text">
                  Drag & drop profile picture, or <span style={{ color: 'var(--gold-primary)', fontWeight: '600' }}>browse files</span>
                </p>
              )}
              <p className="dropzone-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Supports JPG, PNG, WEBP (Max 5MB)</p>
            </>
          )}
        </div>
        {uploadError && (
          <span className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <AlertCircle size={14} /> {uploadError}
          </span>
        )}
      </div>

      {/* Grid Layout for Personal Information */}
      <h3 style={{ fontSize: '1.15rem', color: 'var(--gold-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
        Personal Information
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        <div className="form-group">
          <label className="form-label">First Name *</label>
          <input
            type="text"
            className="form-control"
            placeholder="John"
            {...register('first_name', validators.name)}
          />
          {errors.first_name && <span className="form-error">{errors.first_name.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Last Name *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Doe"
            {...register('last_name', validators.name)}
          />
          {errors.last_name && <span className="form-error">{errors.last_name.message}</span>}
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            className="form-control"
            placeholder="john.doe@email.com"
            {...register('email', validators.email)}
          />
          {errors.email && <span className="form-error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-control"
            placeholder="024 123 4567"
            {...register('phone', validators.phone)}
          />
          {errors.phone && <span className="form-error">{errors.phone.message}</span>}
        </div>

      </div>

      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label className="form-label">Home Address</label>
        <input
          type="text"
          className="form-control"
          placeholder="123 Grace Way, Graceville"
          {...register('address')}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="form-group">
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            className="form-control"
            {...register('date_of_birth')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Date Joined *</label>
          <input
            type="date"
            className="form-control"
            {...register('join_date', { required: 'Date joined is required' })}
          />
          {errors.join_date && <span className="form-error">{errors.join_date.message}</span>}
        </div>

      </div>

      {/* Grid Layout for Church Administration */}
      <h3 style={{ fontSize: '1.15rem', color: 'var(--gold-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
        Church Administration
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="form-group">
          <label className="form-label">Membership Status *</label>
          <select className="form-control" {...register('status', { required: true })}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Visitor">Visitor</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Church Role *</label>
          <select className="form-control" {...register('role', { required: true })}>
            <option value="Member">Member</option>
            <option value="Pastor">Pastor</option>
            <option value="Elder">Elder</option>
            <option value="Deacon">Deacon</option>
            <option value="Ministry Leader">Ministry Leader</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Staff">Staff</option>
          </select>
        </div>

      </div>

      <div className="form-group" style={{ marginBottom: '2rem' }}>
        <label className="form-label">Administrative Notes (Optional)</label>
        <textarea
          className="form-control"
          rows="4"
          placeholder="Optional details on background check, family details, counseling history, or special skills..."
          {...register('notes')}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <button 
          type="submit" 
          disabled={isLoading || uploading}
          className="btn btn-primary"
          style={{ minWidth: '140px' }}
        >
          {isLoading ? (
            <>
              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Saving...
            </>
          ) : (
            'Save Member Record'
          )}
        </button>
      </div>

    </form>
  );
};

export default MemberForm;
