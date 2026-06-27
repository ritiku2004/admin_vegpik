import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--bg-input)',
    borderColor: state.isFocused ? 'var(--accent-primary)' : 'var(--glass-border)',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(34, 197, 94, 0.15)' : 'none',
    borderRadius: '10px',
    minHeight: '46px',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--accent-primary)' : 'rgba(34, 197, 94, 0.25)'
    }
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 16px'
  }),
  input: (provided) => ({
    ...provided,
    color: 'var(--text-primary)',
    margin: '0px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--text-primary)'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--text-secondary)'
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: 'var(--text-secondary)',
    '&:hover': {
      color: 'var(--accent-primary)'
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? 'var(--accent-primary)' 
      : state.isFocused 
        ? 'var(--accent-light)' 
        : 'transparent',
    color: state.isSelected ? '#ffffff' : 'var(--text-primary)',
    cursor: 'pointer',
    padding: '12px 16px',
    '&:active': {
      backgroundColor: 'var(--accent-primary)',
      color: '#ffffff'
    }
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: 'var(--glass-shadow)',
    border: '1px solid var(--glass-border)',
    zIndex: 9999,
    marginTop: '4px'
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0
  })
};

export default function CustomSelect({ options, value, onChange, placeholder, isRequired, name, style }) {
  const selectedOption = options.find(opt => String(opt.value) === String(value)) || null;

  const handleChange = (selected) => {
    // Mimic the standard event signature for our generic handleInputChange
    onChange({
      target: {
        name: name,
        value: selected ? selected.value : ''
      }
    });
  };

  return (
    <div style={{ flex: 1, ...style }}>
      <Select
        name={name}
        value={selectedOption}
        onChange={handleChange}
        options={options}
        styles={customStyles}
        placeholder={placeholder || "Select..."}
        isSearchable={true}
        required={isRequired}
      />
    </div>
  );
}
