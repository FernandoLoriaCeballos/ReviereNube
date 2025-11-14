```javascript
const handleSocialLogin = (provider) => {
    let clientId = "";
    // Cambia el redirectUri para que apunte a la ruta de callback
    let redirectUri = `http://localhost:5173/auth/callback/${provider}`;
    let authUrl = "";

    switch (provider) {
      case "google":
        clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
        break;
      // ...existing code...
    }

    window.location.href = authUrl;
  };
```