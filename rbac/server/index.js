import express, { json } from 'express';
import { connect, Schema, model } from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
const { sign } = jwt;

import bcrypt from 'bcryptjs';
const { genSalt, hash, compare } = bcrypt;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(json());
app.use(cors());

// MongoDB connection
connect('mongodb://localhost:27017/rbac', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userSchema = new Schema({
    username: String,
    password: String,
    role: String,
});

const User = model('User', userSchema);

// Authentication middleware
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Access denied' });

    const token = authHeader.split(' ')[1]; // Extract the token from "Bearer token"
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, 'secret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

// Role-based access control middleware
const roleMiddleware = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    };
  };
  
  // Routes
  app.get('/data', authMiddleware, roleMiddleware(['manager', 'teamleader', 'user']), (req, res) => {
    res.json({ message: 'Read data' });
  });
  
  app.post('/data', authMiddleware, roleMiddleware(['manager', 'teamleader']), (req, res) => {
    res.json({ message: 'Write data' });
  });
  
  app.put('/data', authMiddleware, roleMiddleware(['manager', 'teamleader']), (req, res) => {
    res.json({ message: 'Modify data' });
  });
  
  app.delete('/data', authMiddleware, roleMiddleware(['manager']), (req, res) => {
    res.json({ message: 'Delete data' });
  });
  

// Routes
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const user = new User({ username, password: hashedPassword, role });
    try {
        await user.save();
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });
  
    const token = jwt.sign({ _id: user._id, role: user.role }, 'secret');
    res.header('authorization', token).json({ token });
  });
  
  


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
