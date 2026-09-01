// /home/caleb/Desktop/PROJECTS/KHC/src/pages/ImportMembers.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, ArrowLeft, CheckCircle2 } from 'lucide-react';
import FileUploader from '../components/import/FileUploader';
import ColumnMapper from '../components/import/ColumnMapper';
import ImportPreview from '../components/import/ImportPreview';
import ImportProgress from '../components/import/ImportProgress';
import ImportResults from '../components/import/ImportResults';
import importService from '../services/importService';

export const ImportMembers = () => {
  const navigate = useNavigate();

  // Wizard Step: 1 ('upload') | 2 ('map') | 3 ('preview') | 4 ('progress') | 5 ('results')
  const [step, setStep] = useState(1);

  // Import State
  const [rawRows, setRawRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [fileHeaders, setFileHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [validationResult, setValidationResult] = useState({});
  const [duplicateStrategy, setDuplicateStrategy] = useState('update');
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Step 1: File Parsed Callback
  const handleFileParsed = async (parsedRows, fName) => {
    setRawRows(parsedRows);
    setFileName(fName);
    if (parsedRows.length > 0) {
      setFileHeaders(Object.keys(parsedRows[0]));
      setStep(2); // Move to Column Mapping
    }
  };

  // Step 2: Mapping Confirmed Callback
  const handleMappingConfirmed = async (confirmedMapping) => {
    setMapping(confirmedMapping);
    setIsValidating(true);

    // Apply mapping to raw rows
    const mappedRows = rawRows.map(row => {
      const mapped = {};
      Object.keys(confirmedMapping).forEach(fieldKey => {
        const headerInFile = confirmedMapping[fieldKey];
        if (headerInFile && row[headerInFile] !== undefined) {
          mapped[fieldKey] = row[headerInFile];
        }
      });
      return mapped;
    });

    try {
      const result = await importService.validateFile(mappedRows);
      setValidationResult(result);
      setStep(3); // Move to Validation Preview
    } catch (err) {
      alert('Validation error: ' + err.message);
    } finally {
      setIsValidating(false);
    }
  };

  // Step 3: Execute Bulk Import
  const handleExecuteImport = async () => {
    setStep(4); // Move to Progress state
    setImportProgress(10);

    const validRows = validationResult.validRows || [];
    const total = validRows.length;

    try {
      setImportProgress(50);
      const results = await importService.uploadFile(validRows, { duplicateStrategy });
      setImportProgress(100);
      setImportResults(results);
      setStep(5); // Move to Results
    } catch (err) {
      alert('Failed to complete import: ' + err.message);
      setStep(3);
    }
  };

  const handleReset = () => {
    setStep(1);
    setRawRows([]);
    setFileName('');
    setFileHeaders([]);
    setMapping({});
    setValidationResult({});
    setImportProgress(0);
    setImportResults({});
  };

  return (
    <div className="animate-fade-in">
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button 
            onClick={() => navigate('/members')}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.4rem 0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>Members Directory</span>
          </button>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)' }}>
            Bulk Import Congregation Members
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Batch import member records into Kings Heritage Chapel database using CSV or spreadsheet files.
          </p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        {[
          { num: 1, label: 'Upload File' },
          { num: 2, label: 'Column Mapping' },
          { num: 3, label: 'Preview & Validate' },
          { num: 4, label: 'Processing' },
          { num: 5, label: 'Import Summary' }
        ].map((s) => {
          const isActive = step === s.num;
          const isDone = step > s.num;

          return (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? 'var(--color-success)' : isActive ? 'var(--gold-primary)' : 'var(--bg-primary)',
                  color: isDone || isActive ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  border: isDone || isActive ? 'none' : '1px solid var(--border-color)'
                }}
              >
                {isDone ? <CheckCircle2 size={14} /> : s.num}
              </div>
              <span style={{ fontWeight: isActive || isDone ? 600 : 400, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* STEP VIEWS */}
      {step === 1 && <FileUploader onFileParsed={handleFileParsed} />}

      {step === 2 && (
        <ColumnMapper
          fileHeaders={fileHeaders}
          onMappingConfirmed={handleMappingConfirmed}
        />
      )}

      {step === 3 && (
        <ImportPreview
          validationResult={validationResult}
          duplicateStrategy={duplicateStrategy}
          onStrategyChange={setDuplicateStrategy}
          onProceed={handleExecuteImport}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <ImportProgress
          progress={importProgress}
          current={Math.round((importProgress / 100) * (validationResult.validCount || 0))}
          total={validationResult.validCount || 0}
        />
      )}

      {step === 5 && (
        <ImportResults
          results={importResults}
          onReset={handleReset}
        />
      )}

    </div>
  );
};

export default ImportMembers;
