import { User } from '../types';

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  preferredFaction?: string;
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

const USERS_KEY = 'warhammer_users';

const getUsers = (): Record<string, User & { password: string }> => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : {};
};

const saveUsers = (users: Record<string, User & { password: string }>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const userDb = {
  createUser: (userData: CreateUserData): User => {
    const users = getUsers();

    // Check if email already exists
    const existingEmail = Object.values(users).find(user => user.email === userData.email);
    if (existingEmail) {
      throw new DatabaseError('Email already registered');
    }

    // Check if username already exists
    const existingUsername = Object.values(users).find(user => user.username === userData.username);
    if (existingUsername) {
      throw new DatabaseError('Username already taken');
    }

    // Generate unique ID
    const id = Math.random().toString(36).substr(2, 9);
    const dateJoined = new Date().toISOString();

    const newUser = {
      id,
      email: userData.email,
      username: userData.username,
      password: userData.password, // In a real app, this should be hashed
      preferredFaction: userData.preferredFaction,
      dateJoined
    };

    users[id] = newUser;
    saveUsers(users);

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  verifyUser: (email: string, password: string): User => {
    const users = getUsers();
    
    const user = Object.values(users).find(u => u.email === email);
    
    if (!user || user.password !== password) {
      throw new DatabaseError('Invalid email or password');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};