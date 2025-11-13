import React from 'react';

const NewItem = ({ title, description, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {title || 'New Item'}
        </h3>
        <p className="text-gray-600 text-sm">
          {description || 'Click to interact with this item'}
        </p>
        <div className="mt-4 w-full h-1 bg-gray-200 rounded-full">
          <div className="h-1 bg-blue-500 rounded-full w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export default NewItem;
