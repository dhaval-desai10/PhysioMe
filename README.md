# PhysioMe - Physiotherapy Booking Management System

A comprehensive full-stack web application designed to bridge the gap between physiotherapists and patients, providing a seamless platform for appointment booking, exercise management, and progress tracking.

## 🚀 Project Overview

PhysioMe is a modern physiotherapy management system that I developed from scratch to solve real-world problems in the healthcare industry. The platform facilitates efficient communication between physiotherapists and patients while providing robust administrative tools for managing the entire ecosystem.

## ✨ Key Features

### For Patients
- **User Registration & Authentication** - Secure login with JWT tokens
- **Therapist Discovery** - Browse and find approved physiotherapists
- **Appointment Booking** - Easy scheduling with real-time availability
- **Exercise Plans** - Personalized workout routines and tracking
- **Progress Monitoring** - Visual progress reports and analytics
- **Video Consultation** - Built-in video chat functionality
- **Profile Management** - Complete profile customization

### For Physiotherapists
- **Professional Profile** - Detailed therapist profiles with specializations
- **Availability Management** - Flexible scheduling system
- **Patient Management** - Comprehensive patient records and history
- **Exercise Plan Creation** - Custom exercise routines for patients
- **Appointment Management** - Calendar and scheduling tools
- **Progress Tracking** - Monitor patient recovery progress

### For Administrators
- **User Management** - Approve and manage therapist accounts
- **System Analytics** - Dashboard with key metrics and insights
- **Content Management** - Manage platform content and settings
- **Support Tools** - Handle user queries and system issues

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Framer Motion** - Smooth animations and transitions
- **React Hook Form** - Form validation and handling
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing and security
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage and management
- **Nodemailer** - Email service integration
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **Nodemon** - Development server with auto-restart

## 📁 Project Structure

```
PhysioMe/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── layouts/        # Layout components
│   │   ├── lib/           # Utility functions
│   │   └── services/      # API services
│   ├── public/            # Static assets
│   └── package.json
├── Backend/                # Node.js backend application
│   ├── controllers/       # Route controllers
│   ├── model/            # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/           # Utility functions
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhaval-desai10/PhysioMe_.git
   cd PhysioMe
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` file in the Backend directory:
   ```env
   PORT=8080
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/physiome

# JWT Configuration
JWT_SECRET=43543efdfr3
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dv3yn0q6f
CLOUDINARY_API_KEY=421592261941143
CLOUDINARY_API_SECRET=apMHajWwMIwf8uzJdZEsAqnpuBEMQi
   ```

5. **Running the Application**
   
   **Backend (Terminal 1):**
   ```bash
   cd Backend
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd Frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Patients
- `GET /api/patient/profile` - Get patient profile
- `PUT /api/patient/profile` - Update patient profile
- `GET /api/patient/appointments` - Get patient appointments
- `POST /api/patient/book-appointment` - Book new appointment

### Therapists
- `GET /api/therapist/profile` - Get therapist profile
- `PUT /api/therapist/profile` - Update therapist profile
- `GET /api/therapist/patients` - Get therapist's patients
- `POST /api/therapist/exercise-plan` - Create exercise plan

### Admin
- `GET /api/admin/therapists` - Get all therapists
- `PUT /api/admin/approve-therapist` - Approve therapist
- `GET /api/admin/analytics` - Get system analytics

## 🎨 Features in Detail

### Responsive Design
The application is fully responsive and works seamlessly across desktop, tablet, and mobile devices.

### Real-time Updates
- Live appointment status updates
- Real-time notification system
- Dynamic availability management

### Security Features
- JWT-based authentication
- Password encryption with bcrypt
- Protected API routes
- Input validation and sanitization

### File Management
- Image upload for profiles
- Document sharing capabilities
- Cloud storage integration

## 🤝 Contributing

This is a personal project, but I welcome feedback and suggestions for improvements. Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📝 License

This project is developed as a personal portfolio piece. All rights reserved.

## 👨‍💻 About the Developer

**Dhaval Desai**
- Full-stack developer passionate about creating meaningful applications
- Specialized in React, Node.js, and modern web technologies
- Committed to writing clean, maintainable code
- Focused on user experience and accessibility

## 📞 Contact

- **GitHub**: [@dhaval-desai10](https://github.com/dhaval-desai10)
- **Project Link**: [https://github.com/dhaval-desai10/PhysioMe_](https://github.com/dhaval-desai10/PhysioMe_)

---

**Built with ❤️ and ☕ by Dhaval Desai**

*This project represents my journey in mern-stack development and my commitment to creating solutions that make a real difference in people's lives.* 