# Smart Home Energy Management System (SHEMS) - Frontend

A modern React + Vite frontend for managing smart home energy consumption.

## Features

- **User Authentication**: Register, Login, and Password Recovery
- **Device Management**: Add, view, and manage smart home devices
- **Energy Dashboard**: Real-time energy consumption tracking
- **Statistics**: Monitor daily consumption, costs, and carbon savings
- **Responsive Design**: Mobile-friendly and modern UI
- **CORS Integration**: Connected with backend API

## Pages

### 1. Register Page
- First Name, Last Name
- Email Address
- Mobile Number
- Primary Interest Selection
- Password & Confirm Password
- Form validation
- Success/Error messages

### 2. Login Page
- Email & Password login
- Forgot Password functionality
- Link to registration page
- Session management

### 3. Dashboard
- Energy Statistics (Today's consumption, Monthly average, Costs, Carbon saves)
- Device Management
  - View all connected devices
  - Add new devices
  - Remove devices
  - Device status indicator
- Consumption Analytics
- User Settings
- Energy Saving Tips

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components (Login, Register, Dashboard)
│   ├── services/       # API client and backend communication
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # React entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML entry point
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration with CORS proxy
└── README.md           # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Step 3: Build for Production
```bash
npm run build
```

### Step 4: Preview Production Build
```bash
npm run preview
```

## CORS Configuration

The frontend is configured to communicate with the backend at `http://localhost:8080`. The proxy is set up in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### Update Backend URL

If your backend is running on a different port/URL, modify `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://your-backend-url/api'
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Password recovery

### Devices
- `GET /devices` - Get all devices
- `POST /devices` - Add new device
- `PUT /devices/:id` - Update device
- `DELETE /devices/:id` - Delete device
- `GET /devices/:id/consumption` - Get device consumption

### Dashboard
- `GET /dashboard/energy-stats` - Get energy statistics
- `GET /dashboard/today-consumption` - Today's consumption
- `GET /dashboard/monthly-data` - Monthly data

## Technologies Used

- **React 18.2** - UI library
- **Vite 5.0** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Modern styling with gradients and animations

## Features Breakdown

### Authentication Flow
1. Users can register with personal details
2. Email and password validation
3. JWT token-based authentication
4. Automatic redirect on unauthorized access
5. Password recovery via email

### Device Management
- CRUD operations on smart home devices
- Device categorization (Light, AC, Fan, etc.)
- Location-based device organization
- Real-time device status

### Energy Tracking
- Daily consumption tracking
- Monthly and yearly analytics
- Cost calculation
- Carbon footprint monitoring
- Consumption charts and graphs

## Styling & UI/UX

- **Color Scheme**: Purple gradient (Primary), Blue (Secondary)
- **Components**: Cards, Forms, Statistics panels
- **Animations**: Smooth transitions and fade-ins
- **Responsive**: Mobile-first design approach
- **Accessibility**: Semantic HTML, proper labels, focus states

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME="SHEMS"
```

## Troubleshooting

### CORS Issues
- Ensure backend is running on the correct port
- Check that backend has CORS enabled
- Verify the proxy configuration in `vite.config.js`

### Login Not Working
- Check if backend API is accessible
- Verify credentials are correct
- Check browser console for error messages
- Ensure JWT token is being stored in localStorage

### Devices Not Loading
- Verify backend is running
- Check API endpoint URLs
- Ensure user is authenticated
- Check network tab in DevTools

## Development Workflow

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Make changes to components and files

# Test in browser at http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is part of the Smart Home Energy Management System (SHEMS).

## Support

For issues or questions, please open an issue in the repository.

---

Happy coding! ⚡
