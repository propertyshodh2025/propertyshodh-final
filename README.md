# Property Shodh Aurangabad

A comprehensive property search and discovery platform for Aurangabad, Maharashtra. Find the best properties with advanced search, filtering, and property management features.

## Features

- **Advanced Property Search**: Search properties by location, type, price range, and more
- **Property Management**: Admin dashboard for property listing and management
- **User Authentication**: Secure user registration and login system
- **Property Details**: Comprehensive property information with images and details
- **Responsive Design**: Mobile-first design that works on all devices
- **Multi-language Support**: Support for multiple languages
- **Real-time Updates**: Live property updates and notifications

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **UI Components**: Radix UI, Shadcn/ui
- **Build Tool**: Vite
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd property-radar-aurangabad-26-main
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:8080`

## Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── integrations/       # External service integrations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
