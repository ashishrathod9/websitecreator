import React, { useState } from 'react';

const RequirementForm = ({ onSubmit }) => {
  const [requirements, setRequirements] = useState({
    collegeName: '',
    features: {
      studentPortal: false,
      facultyPortal: false,
      attendanceSystem: false,
      examManagement: false,
      courseManagement: false,
      libraryManagement: false,
      feeManagement: false,
      eventsCalendar: false,
    },
    colorScheme: '#1a365d',
    additionalFeatures: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRequirements(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [name]: checked
        }
      }));
    } else {
      setRequirements(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(requirements);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">College Website Requirements</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">College Name</label>
          <input
            type="text"
            name="collegeName"
            value={requirements.collegeName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Required Features</label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(requirements.features).map(([feature, checked]) => (
              <div key={feature} className="flex items-center">
                <input
                  type="checkbox"
                  name={feature}
                  checked={checked}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Color Scheme</label>
          <input
            type="color"
            name="colorScheme"
            value={requirements.colorScheme}
            onChange={handleChange}
            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Additional Features</label>
          <textarea
            name="additionalFeatures"
            value={requirements.additionalFeatures}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter any additional features or requirements..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate Website
        </button>
      </form>
    </div>
  );
};

export default RequirementForm; 