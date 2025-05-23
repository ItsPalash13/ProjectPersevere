import { useState } from 'react';

function PingButton() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePing = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ping`, {
        credentials: 'include'
      });
      const data = await response.json();
      setResponse(data.message);
      if (data.user) {
        console.log('User data:', data.user);
      }
    } catch (error) {
      setResponse('Error: Could not connect to server');
      console.error('Ping error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ping-container">
      <button 
        onClick={handlePing} 
        disabled={isLoading}
        className="ping-button"
      >
        {isLoading ? 'Pinging...' : 'Ping Server'}
      </button>
      {response && (
        <div className="ping-response">
          Server response: {response}
        </div>
      )}
    </div>
  );
}

export default PingButton; 