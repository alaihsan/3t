import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, User as UserIcon, Lock, Check } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    username: string;
    password: string;
    remember: boolean;
    [key: string]: any;
}

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        username: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const fillCredentials = (user: string) => {
        setData((prev) => ({
            ...prev,
            username: user,
            password: 'passwd',
        }));
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-emerald-950 px-4 py-12 sm:px-6 lg:px-8">
            {/* Simple but Elegant Islamic Geometric Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden">
                <svg className="w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] text-amber-400 fill-none stroke-current" strokeWidth="1.5" viewBox="0 0 100 100">
                    <path d="M 50 0 L 65 35 L 100 50 L 65 65 L 50 100 L 35 65 L 0 50 L 35 35 Z" />
                    <rect x="15" y="15" width="70" height="70" transform="rotate(45 50 50)" />
                    <circle cx="50" cy="50" r="25" />
                    <circle cx="50" cy="50" r="15" />
                    <circle cx="50" cy="50" r="5" />
                    <path d="M 0 50 H 100 M 50 0 V 100" />
                    <path d="M 15 15 L 85 85 M 15 85 L 85 15" />
                </svg>
            </div>

            {/* Subtle glow effects */}
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-700/20 blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl"></div>

            <div className="relative z-10 w-full max-w-md space-y-8">
                {/* Brand / Logo Card */}
                <div className="flex flex-col items-center text-center">
                    {/* Golden Islamic Emblem / Star */}
                    <div className="relative mb-2 flex h-20 w-20 items-center justify-center">
                        {/* Custom 8-point Islamic Star (Rub el Hizb) */}
                        <svg className="absolute inset-0 h-full w-full animate-[spin_100s_linear_infinite] text-amber-500 fill-current opacity-80" viewBox="0 0 100 100">
                            <path d="M 50 0 L 65 35 L 100 50 L 65 65 L 50 100 L 35 65 L 0 50 L 35 35 Z" />
                            <path d="M 50 10 L 60 40 L 90 50 L 60 60 L 50 90 L 40 60 L 10 50 L 40 40 Z" className="text-emerald-950 fill-current" />
                        </svg>
                        <span className="relative text-2xl font-bold text-amber-400">3T</span>
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Aplikasi Al Quran <span className="text-amber-400">3T</span>
                    </h1>
                    <p className="mt-2 text-sm text-emerald-200">
                        Takhasus • Tahsin • Tahfizh
                    </p>
                </div>

                {/* Login Form Card */}
                <div className="overflow-hidden rounded-2xl border border-emerald-800 bg-emerald-900/40 p-8 shadow-2xl backdrop-blur-md">
                    <h2 className="mb-6 text-xl font-semibold text-emerald-100 text-center">
                        Masuk sebagai Ustadz / Ustadzah
                    </h2>

                    <form className="space-y-6" onSubmit={submit}>
                        <div className="space-y-4">
                            {/* Username Input */}
                            <div className="grid gap-2">
                                <Label htmlFor="username" className="text-emerald-200 font-medium">Username</Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <UserIcon className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <Input
                                        id="username"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="Nama pengguna"
                                        className="pl-10 bg-emerald-950/80 border-emerald-700 text-emerald-50 focus:border-amber-500 focus:ring-amber-500 placeholder:text-emerald-600/80 rounded-lg"
                                    />
                                </div>
                                <InputError message={errors.username} className="text-amber-400 text-xs mt-1" />
                            </div>

                            {/* Password Input */}
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-emerald-200 font-medium">Password</Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={2}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Kata sandi"
                                        className="pl-10 bg-emerald-950/80 border-emerald-700 text-emerald-50 focus:border-amber-500 focus:ring-amber-500 placeholder:text-emerald-600/80 rounded-lg"
                                    />
                                </div>
                                <InputError message={errors.password} className="text-amber-400 text-xs mt-1" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked === true)}
                                    className="border-emerald-600 data-[state=checked]:bg-amber-500 data-[state=checked]:text-emerald-950"
                                />
                                <Label htmlFor="remember" className="text-sm text-emerald-200 cursor-pointer">
                                    Ingat saya
                                </Label>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-emerald-950 hover:text-emerald-950 font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]"
                            disabled={processing}
                        >
                            {processing ? (
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                            ) : (
                                'Masuk ke Aplikasi'
                            )}
                        </Button>
                    </form>

                    {/* Quick Credentials Evaluator Panel */}
                    <div className="mt-8 border-t border-emerald-800/80 pt-6">
                        <p className="text-center text-xs font-semibold uppercase tracking-wider text-emerald-400">
                            Pilih Akun Guru (Klik untuk Isi otomatis):
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {['syawqi', 'hafiz', 'laila'].map((user) => {
                                const isActive = data.username === user;
                                return (
                                    <button
                                        key={user}
                                        type="button"
                                        onClick={() => fillCredentials(user)}
                                        className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition duration-200 ${
                                            isActive
                                                ? 'bg-amber-500/25 border-amber-500 text-amber-300'
                                                : 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-950/80 hover:border-emerald-700'
                                        }`}
                                    >
                                        <span className="text-xs font-semibold capitalize">{user}</span>
                                        <span className="mt-0.5 text-[9px] opacity-65">passwd</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer text */}
                <p className="text-center text-xs text-emerald-400">
                    &copy; 2026 Aplikasi Al Quran 3T. Hak Cipta Dilindungi.
                </p>
            </div>
        </div>
    );
}
