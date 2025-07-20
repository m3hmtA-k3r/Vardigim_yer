'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../lib/store';
import { loginUser, registerUser } from '../../../lib/slices/authSlice';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import translations from '../../lib/translations/common/auth.json';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch<AppDispatch>()
    const { isLoading, error } = useSelector((state: RootState) => state.auth)
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    })

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isLogin) {
                await dispatch(loginUser({ email: formData.email, password: formData.password })).unwrap()
                router.push('/')
            } else {
                await dispatch(registerUser({ username: formData.username, email: formData.email, password: formData.password })).unwrap()
            }
        } catch (error) {
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="h-screen w-screen overflow-hidden flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center px-8 overflow-y-auto">
                <div className="w-full max-w-xl py-6">
                    <div className="mb-6">
                        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100">
                            <span className="text-2xl">🍕</span>
                        </div>
                        <h2 className="mt-4 text-center text-2xl font-bold text-neutral-900">
                            {translations.login.title}
                        </h2>
                        <p className="mt-2 text-center text-sm text-neutral-600">
                            {translations.login.description}
                            <Link
                                href="/auth/register"
                                className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
                            >
                                {translations.login.signup}
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-md bg-red-50 p-3">
                                <div className="text-sm text-red-700">{error}</div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                                {translations.login.email}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                placeholder={translations.login.placeholder.email}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                                {translations.login.password}
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm pr-10"
                                    placeholder={translations.login.placeholder.password}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-neutral-500 hover:text-neutral-600"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                   

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <span className="text-white">{translations.login.login}</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right side - Image */}
            <div className="hidden lg:flex flex-1 relative rotate-24">
                <Image
                    src="/bg-register.svg"
                    alt="Login illustration"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        </div>
    );
} 