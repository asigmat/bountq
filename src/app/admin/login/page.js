'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../context/ToastContext';

export default function AdminLoginPage() {
    const { notify } = useToast();
    const [form, setForm] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                window.location.href = '/admin';
            } else {
                notify(data.error || 'Giriş başarısız.', 'error');
            }
        } catch (error) {
            notify('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
            >
                <h1 className="text-2xl font-bold text-center mb-6">Admin Girişi</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">E-posta</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Şifre</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={form.password}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <motion.button
                        type="submit"
                        className="w-full bg-rose-600 text-white py-2 rounded-md hover:bg-rose-700"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Giriş Yap
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
