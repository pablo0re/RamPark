// "use client";
// import {useState} from 'react';
// import {useRouter} from 'next/navigate';
// import {useAuth} from '@/contexts/AuthContext';
// import {Button} from '@/components/ui/button';

// export default function LoginPage() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [login, isFSCUser] = useAuth();
//     const router = useRouter();

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         try {
//             await login(email,password);
//             if (isFSCUser) {
//                 router.push('/');
//             } else {
//                 setError('Access restricted to farmingdale emails');
//             }
//         } catch (err: any) {
//             setError(err.message);
//         }
//         setLoading(false);
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center px-4">
//             <div className="bg-slate-900 rounded-xl p-8 w-full max-w-md border border-slate-800">
//                 <div className="text-center mb-8">
//                     <h1 className="text-3xl font-bold mb-2">Ram Park</h1>
//                     <p className="text-slate-400">@farmingdale.edu login required</p>
//                 </div>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div>
//                         <label className="block text-sm font-medium mb-2">Email</label>
//                         <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         className="w-full bg-slate-800 border border-slate-700 rounded-lg
//                         px-4 py-2 focus:ring-2 focus:ring-blue-500"
//                         required
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium mb-2">Password</label>
//                         <input
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="w-full bg-slate-800 border border-slate-700 rounded-lg
//                         px-4 py-2 focus:ring-2 focus:ring-blue-500"
//                         required
//                         />
//                     </div>
//                     {error && <p className="text-red-400 text-sm">{error}</p>}
//                     <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full bg-blue-500 hover:bg-blue-600 disabled:o[acity-50
//                     py-2 rounded-lg font-medium"
//                     >
//                         {loading ? 'Signing in...' : 'Sign In'}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }
