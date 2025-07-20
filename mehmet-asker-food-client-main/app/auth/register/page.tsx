'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../lib/store';
import { registerUser } from '../../../lib/slices/authSlice';
import translations from '../../lib/translations/common/auth.json';

export default function RegisterPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        rePassword: '',
        phone: '',
        addresses: [{
            title: '',
            street: '',
            city: '',
            district: '',
            postalCode: '',
            phone: '',
            isDefault: true
        }]
    });

    const [passwordError, setPasswordError] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [passwordMatchError, setPasswordMatchError] = useState('');

    useEffect(() => {
        if (formData.password || formData.rePassword) {
            if (formData.password !== formData.rePassword) {
                setPasswordMatchError('Passwords do not match');
            } else {
                setPasswordMatchError('');
            }
        }
    }, [formData.password, formData.rePassword]);

    useEffect(() => {
        const isValid =
            formData.username.trim() !== '' &&
            formData.email.trim() !== '' &&
            formData.password.trim() !== '' &&
            formData.rePassword.trim() !== '' &&
            formData.addresses[0].title.trim() !== '' &&
            formData.addresses[0].street.trim() !== '' &&
            formData.addresses[0].city.trim() !== '' &&
            formData.addresses[0].district.trim() !== '' &&
            formData.addresses[0].phone.trim() !== '' &&
            !passwordMatchError &&
            formData.password.length >= 6;

        setIsFormValid(isValid);
    }, [formData, passwordMatchError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            return;
        }

        if (formData.password.length < 6) {
            setPasswordError(translations.register.passwordNotMatch);
            return;
        }

        setPasswordError('');

        try {
            await dispatch(registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                addresses: formData.addresses
            })).unwrap();

            router.push('/auth/login');
        } catch (error) {
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                addresses: [{
                    ...prev.addresses[0],
                    [field]: value
                }]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
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
                            {translations.register.title}
                        </h2>
                        <p className="mt-2 text-center text-sm text-neutral-600">
                            {translations.register.description}
                            <Link
                                href="/auth/login"
                                className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
                            >
                                {translations.register.signin}
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-3" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-md bg-red-50 p-3">
                                <div className="text-sm text-red-700">{error}</div>
                            </div>
                        )}

                        {passwordError && (
                            <div className="rounded-md bg-red-50 p-3">
                                <div className="text-sm text-red-700">{passwordError}</div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-neutral-700">
                                    {translations.register.username}
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter username"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                                    {translations.register.email}
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
                                    placeholder="Enter email"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                                    {translations.register.phone}
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div>
                                <label htmlFor="address.title" className="block text-sm font-medium text-neutral-700">
                                    {translations.register.address}
                                </label>
                                <input
                                    id="address.title"
                                    name="address.title"
                                    type="text"
                                    required
                                    value={formData.addresses[0].title}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                    placeholder="e.g. Home, Work"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address.street" className="block text-sm font-medium text-neutral-700">
                                {translations.register.street}
                            </label>
                            <input
                                id="address.street"
                                name="address.street"
                                type="text"
                                required
                                value={formData.addresses[0].street}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                placeholder="Enter street name"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label htmlFor="address.city" className="block text-sm font-medium text-neutral-700">
                                    {translations.register.city}
                                </label>
                                <input
                                    id="address.city"
                                    name="address.city"
                                    type="text"
                                    required
                                    value={formData.addresses[0].city}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter city"
                                />
                            </div>

                            <div>
                                <label htmlFor="address.district" className="block text-sm font-medium text-neutral-700">
                                    District
                                </label>
                                <input
                                    id="address.district"
                                    name="address.district"
                                    type="text"
                                    required
                                    value={formData.addresses[0].district}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter district"
                                />
                            </div>

                            <div>
                                <label htmlFor="address.postalCode" className="block text-sm font-medium text-neutral-700">
                                    {translations.register.postalCode}
                                </label>
                                <input
                                    id="address.postalCode"
                                    name="address.postalCode"
                                    type="text"
                                    value={formData.addresses[0].postalCode}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter postal code"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address.phone" className="block text-sm font-medium text-neutral-700">
                                {translations.register.addressPhone}
                            </label>
                            <input
                                id="address.phone"
                                name="address.phone"
                                type="tel"
                                required
                                value={formData.addresses[0].phone}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                placeholder="Enter phone number for address"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                                    {translations.register.password}
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                    placeholder="At least 6 characters"
                                />
                            </div>

                            <div>
                                <label htmlFor="rePassword" className="block text-sm font-medium text-neutral-700">
                                    {translations.register.confirmPassword}
                                </label>
                                <input
                                    id="rePassword"
                                    name="rePassword"
                                    type="password"
                                    required
                                    value={formData.rePassword}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                    placeholder="Re-enter password"
                                />
                                {passwordMatchError && (
                                    <p className="mt-1 text-sm text-red-600">{passwordMatchError}</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 transition-colors cursor-pointer"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <span className="text-white">{translations.register.signup}</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right side - Image */}
            <div className="hidden lg:flex flex-1 relative rotate-24">
                <Image
                    src="/bg-register.svg"
                    alt="Register illustration"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        </div>
    );
}
