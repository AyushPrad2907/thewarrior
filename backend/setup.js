const fs = require('fs');
const path = require('path');

// Create necessary directories
const directories = [
  'uploads',
  'uploads/covers',
  'uploads/previews',
  'uploads/fullbooks',
  'uploads/screenshots'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/THE_WARRIOR

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173
`;
  fs.writeFileSync(envPath, envContent);
  console.log('Created .env file');
} else {
  console.log('.env file already exists');
}

console.log('\nSetup complete!');
console.log('Please update the .env file with your MongoDB connection string and JWT secret.');
