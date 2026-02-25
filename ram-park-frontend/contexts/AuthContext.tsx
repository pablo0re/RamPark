"use client";
//import {createContext,useContext, useEffect, useState, ReactNode } from 'react';
//import {onAuthStateChanged,User, signInWithEmailAndPassword, signout } from 'firebase/auth';
//import { auth } from '@/lib/firebase';

//interface AuthContextType {
 //  user: User | null;
  //  isFSCUser: boolean;
  //  loading: boolean;
  //  login: (email: string, password: string) => Promise<void>;
  //  logout: () => Promise<void>;
//}

//const AuthContext = createContext<AuthContextType | undefined> (undefined);

//export function AuthProvider({ children }: { children: ReactNode}){
 //   const [user, setUser] = useState<User | null>(null);
 //   const [isFSCUser, setIsFSCUser] = useState(true);
 //   const [loading,setLoading] = useState(true);

//    useEffect(() => {
 //       const unsubscribe = onAuthStateChanged(auth, (user) => {
 //           setUser(user);
 //           if (user?.email) {
 //               setIsFSCUser(user.email.endsWith('@farmingdale.edu'));
 //           }
 //           setLoading(false);
 //       });
 //       return unsubscribe;
//    }, []);

 //   const login = async (email: string, password: string) => {
 //       await signInWithEmailAndPassword(auth, email, password);
 //   };

 //   const logout = async () => {
//        await signout(auth);
 //   };

 //   return (
 //       <AuthContext.Provider value={{ user, isFSCUser,loading, login, logout}}>
 //           {children}
 //       </AuthContext.Provider>
//    );
//}

//export const useAuth = () => {
//    const context = useContext(AuthContext);
//    if (!context) throw new Error('useAuth must be used within AuthProvider');
//    return context;
//};
