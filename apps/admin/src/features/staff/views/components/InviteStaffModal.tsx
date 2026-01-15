'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { supabase } from '@/lib/supabase/client';
import { inviteStaff } from '@/actions/staff';

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteStaffModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteStaffModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STAFF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('직원을 초대하려면 로그인해야 합니다.');
      }

      const result = await inviteStaff({
        email,
        name,
        role,
        accessToken: session.access_token,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      onSuccess();
      onClose();
      setRole('STAFF');
    } catch (err: any) {
      if (
        err.message?.includes('User from sub claim') ||
        err.message?.toLowerCase().includes('unauthorized')
      ) {
        await supabase.auth.signOut();
        window.location.href = '/login';
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="직원 초대" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            이메일 주소
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="example@salon.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            이름
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="홍길동"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            역할
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="STAFF">직원 (Staff)</option>
            <option value="MANAGER">매니저 (Manager)</option>
            <option value="ADMIN">관리자 (Admin)</option>
          </select>
          <p className="text-xs text-gray-500">
            시스템 접근 권한을 결정합니다.
          </p>
        </div>

        <div className="flex justify-end pt-4 space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? '발송 중...' : '초대장 발송'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
