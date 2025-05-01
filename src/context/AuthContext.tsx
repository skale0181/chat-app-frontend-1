// import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
// import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// // Define auth state types
// type UserType = {
//   id: string;
//   email: string;
//   username: string;
//   avatar?: string;
// };

// type AuthContextType = {
//   user: UserType | null;
//   token: string | null;
//   supabaseUser: SupabaseUser | null;
//   supabase: SupabaseClient;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   register: (email: string, password: string, username: string) => Promise<void>;
//   logout: () => Promise<void>;
//   isAuthenticated: boolean;
// };

// // Create context
// const AuthContext = createContext<AuthContextType | null>(null);

// // Validate and get Supabase credentials
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// // Validate environment variables
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables. Please check your .env file.');
// }

// try {
//   // Test if URL is valid
//   new URL(supabaseUrl);
// } catch (error) {
//   throw new Error('Invalid Supabase URL. Please check your VITE_SUPABASE_URL environment variable.');
// }

// // Initialize Supabase client
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// // Create provider
// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<UserType | null>(null);
//   const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
//   const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // Check for existing session on load
//   useEffect(() => {
//     const initAuth = async () => {
//       setLoading(true);

//       // Check Supabase session
//       const { data } = await supabase.auth.getSession();
      
//       if (data.session) {
//         setSupabaseUser(data.session.user);
        
//         if (token) {
//           try {
//             // Verify token with backend
//             const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
//               headers: {
//                 Authorization: `Bearer ${token}`
//               }
//             });
            
//             setUser(response.data);
//             setIsAuthenticated(true);
//           } catch (error) {
//             // Token invalid, try to get a new one
//             await refreshToken(data.session.user);
//           }
//         } else {
//           // No token, try to get one
//           await refreshToken(data.session.user);
//         }
//       }
      
//       setLoading(false);
//     };

//     initAuth();

//     // Set up auth state change listener
//     const { data: authListener } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         if (event === 'SIGNED_IN' && session) {
//           setSupabaseUser(session.user);
//           await refreshToken(session.user);
//         } else if (event === 'SIGNED_OUT') {
//           setSupabaseUser(null);
//           setUser(null);
//           setToken(null);
//           setIsAuthenticated(false);
//           localStorage.removeItem('token');
//         }
//       }
//     );

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, [token]);

//   const refreshToken = async (supabaseUser: SupabaseUser) => {
//     try {
//       // Get token from backend using Supabase ID
//       const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
//         supabaseId: supabaseUser.id,
//         email: supabaseUser.email,
//         username: supabaseUser.email?.split('@')[0] || 'user' // Default username from email
//       });
      
//       const { token, user } = response.data;
      
//       localStorage.setItem('token', token);
//       setToken(token);
//       setUser(user);
//       setIsAuthenticated(true);
//     } catch (error) {
//       console.error('Failed to verify with backend:', error);
//       toast.error('Authentication failed. Please log in again.');
//       await supabase.auth.signOut();
//     }
//   };

//   const register = async (email: string, password: string, username: string) => {
//     try {
//       setLoading(true);
//       // Register with Supabase
//       const { data, error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: {
//             username
//           }
//         }
//       });
      
//       if (error) throw error;
      
//       if (data.user) {
//         // Supabase auth successful, register with backend
//         await refreshToken(data.user);
//         toast.success('Registration successful!');
//       }
//     } catch (error: any) {
//       console.error('Registration error:', error);
//       toast.error(error.message || 'Registration failed. Please try again.');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email: string, password: string) => {
//     try {
//       setLoading(true);
//       // Login with Supabase
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password
//       });
      
//       if (error) throw error;
      
//       if (data.user) {
//         // Supabase auth successful, verify with backend
//         await refreshToken(data.user);
//         toast.success('Login successful!');
//       }
//     } catch (error: any) {
//       console.error('Login error:', error);
//       toast.error(error.message || 'Login failed. Please check your credentials.');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = async () => {
//     try {
//       setLoading(true);
//       await supabase.auth.signOut();
//       localStorage.removeItem('token');
//       setToken(null);
//       setUser(null);
//       setIsAuthenticated(false);
//       toast.info('Logged out successfully');
//     } catch (error: any) {
//       console.error('Logout error:', error);
//       toast.error(error.message || 'Logout failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         supabaseUser,
//         supabase,
//         loading,
//         login,
//         register,
//         logout,
//         isAuthenticated
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Custom hook for using auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };


import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import axios from 'axios';
import { toast } from 'react-toastify';

// Define auth state types
type UserType = {
  id: string;
  email: string;
  username: string;
  avatar?: string;
};

type AuthContextType = {
  user: UserType | null;
  token: string | null;
  supabaseUser: SupabaseUser | null;
  supabase: SupabaseClient;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Validate and get Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error('Invalid Supabase URL. Please check your VITE_SUPABASE_URL environment variable.');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (data.session) {
        const supabaseUser = data.session.user;
        setSupabaseUser(supabaseUser);

        if (token) {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!isMounted) return;
            setUser(response.data);
            setIsAuthenticated(true);
          } catch (error) {
            await refreshToken(supabaseUser);
          }
        } else {
          await refreshToken(supabaseUser);
        }
      }

      if (isMounted) setLoading(false);
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSupabaseUser(session.user);
        await refreshToken(session.user);
      } else if (event === 'SIGNED_OUT') {
        setSupabaseUser(null);
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshToken = async (supabaseUser: SupabaseUser) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        username: supabaseUser.email?.split('@')[0] || 'user',
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to verify with backend:', error);

      // Reset state but avoid looping
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);

      toast.error('Authentication failed. Please log in again.');
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await refreshToken(data.user);
        toast.success('Registration successful!');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await refreshToken(data.user);
        toast.success('Login successful!');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      toast.info('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        supabaseUser,
        supabase,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
