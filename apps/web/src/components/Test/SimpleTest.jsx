import React from 'react';

const SimpleTest = () => {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🎉 Advanced Features Test Page
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        margin: '20px auto',
        maxWidth: '600px'
      }}>
        <h2 style={{ color: '#667eea' }}>✅ React is Working!</h2>
        <p>If you can see this page, the basic React setup is functioning correctly.</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>🔤 Arabic Text Test:</h3>
          <p style={{ 
            fontSize: '18px', 
            direction: 'rtl', 
            fontFamily: 'Arial Unicode MS, Tahoma',
            border: '1px solid #ddd',
            padding: '10px',
            borderRadius: '5px'
          }}>
            مرحباً بكم في نظام الحوكمة والمخاطر والامتثال المتقدم
          </p>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <h3>✨ Animation Test:</h3>
          <button 
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#764ba2';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#667eea';
              e.target.style.transform = 'scale(1)';
            }}
            onClick={() => alert('Button clicked! Animations are working!')}
          >
            Test Interactive Button
          </button>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <h3>🕌 Cultural Features Test:</h3>
          <p>Current Date: {new Date().toLocaleDateString()}</p>
          <p>Arabic Numerals: ١٢٣٤٥٦٧٨٩٠</p>
          <p>Western Numerals: 1234567890</p>
        </div>
        
        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          backgroundColor: '#e8f5e8',
          borderRadius: '5px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#2d5016' }}>
            ✅ If you can see this page with proper Arabic text and the button works, 
            the foundation is ready for the advanced features!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;
