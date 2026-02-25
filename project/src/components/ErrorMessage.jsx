import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
    return (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-red-400 mb-4">{message || 'Something went wrong'}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
