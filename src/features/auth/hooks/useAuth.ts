import { useState } from 'react';
import { authApi } from '../api';
import { CheckStatus } from '../types';

export const useRegistration = () => {
  const [emailStatus, setEmailStatus] = useState<CheckStatus>('idle');
  const [salonNameStatus, setSalonNameStatus] = useState<CheckStatus>('idle');
  const [emailMessage, setEmailMessage] = useState('');
  const [salonNameMessage, setSalonNameMessage] = useState('');

  const checkDuplicate = async (type: 'email' | 'salonName', value: string) => {
    if (!value) return;

    const setStatus = type === 'email' ? setEmailStatus : setSalonNameStatus;
    const setMessage = type === 'email' ? setEmailMessage : setSalonNameMessage;

    setStatus('checking');
    setMessage('');

    try {
      const data = await authApi.checkDuplicate({ type, value });

      if (data.available) {
        setStatus('available');
        setMessage(data.message || '사용 가능합니다.');
      } else {
        setStatus('taken');
        setMessage(data.message || '이미 사용 중입니다.');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage('중복 확인 중 오류가 발생했습니다.');
    }
  };

  return {
    emailStatus,
    salonNameStatus,
    emailMessage,
    salonNameMessage,
    setEmailStatus,
    setSalonNameStatus,
    setEmailMessage,
    setSalonNameMessage,
    checkDuplicate,
    registerOwner: authApi.registerOwner,
  };
};
