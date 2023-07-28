import React from 'react';

const GoogleLoginButton = () => {
  const handleGoogleLogin = async () => {
    try {
      // Make a request to your backend's 'google-auth' endpoint
      const response = await fetch('http://localhost:5000/auth/google', {
        method: 'GET',
        credentials: 'include', // Include credentials to send cookies (for sessions)
      });

      // Handle the response (you can redirect to the response URL or handle the response data)
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        // Redirect or handle the response data as needed
      } else {
        // Handle the error response
        console.error('Failed to initiate Google authentication');
      }
    } catch (error) {
      console.error('Error during Google authentication:', error);
    }
  };

  return (
    <button onClick={handleGoogleLogin}>Login with Google</button>
  );
};

export default GoogleLoginButton;
