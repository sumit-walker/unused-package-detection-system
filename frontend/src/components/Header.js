import React from 'react';

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🔍</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Unused Package Detection
              </h1>
              <p className="text-sm text-gray-500">
                Analyze, visualize, and optimize your dependencies
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Cross-language tool for dependency management
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

