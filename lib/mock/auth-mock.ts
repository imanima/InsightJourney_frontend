// Mock authentication data

export const mockUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    password: "password123", // In a real app, this would be hashed
    is_admin: true,
    role: "admin",
    picture: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    name: "Coach User",
    email: "coach@example.com",
    password: "password123",
    is_admin: false,
    role: "coach",
    picture: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: 3,
    name: "Demo User",
    email: "demo@example.com",
    password: "password",
    is_admin: false,
    role: "user",
    picture: "https://randomuser.me/api/portraits/men/3.jpg",
  },
]

// Helper function to find a user by email
export function findUserByEmail(email: string) {
  return mockUsers.find((user) => user.email === email)
}

// Helper function to find a user by ID
export function findUserById(id: number) {
  return mockUsers.find((user) => user.id === id)
}

// Helper function to create a user
export function createUser(name: string, email: string, password: string) {
  const newUser = {
    id: mockUsers.length + 1,
    name,
    email,
    password, // In a real app, this would be hashed
    is_admin: false,
    role: "user",
    picture: null,
  }

  mockUsers.push(newUser)
  return newUser
}

// Helper function to create a user via Google auth
export function createGoogleUser(email: string, name: string, picture: string, googleId: string) {
  const existingUser = findUserByEmail(email)

  if (existingUser) {
    // Update existing user with Google info
    existingUser.picture = picture
    return existingUser
  }

  const newUser = {
    id: mockUsers.length + 1,
    name,
    email,
    password: null, // Google auth users don't have passwords
    is_admin: false,
    role: "user",
    picture,
    googleId,
  }

  mockUsers.push(newUser)
  return newUser
}

// Helper function to update user role
export function updateUserRole(id: number, role: string) {
  const user = findUserById(id)
  if (user) {
    user.role = role
    user.is_admin = role === "admin"
    return true
  }
  return false
}

// Helper function to delete a user
export function deleteUser(id: number) {
  const index = mockUsers.findIndex((user) => user.id === id)
  if (index !== -1) {
    mockUsers.splice(index, 1)
    return true
  }
  return false
}

