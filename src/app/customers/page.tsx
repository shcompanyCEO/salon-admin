'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/locales/useTranslation';
import { Customer } from '@/types';
import { formatDate, generateCustomerNumber } from '@/lib/utils';
import { Plus, Search } from 'lucide-react';

export default function CustomersPage() {
  const { t } = useTranslation();
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const [customers] = useState<Customer[]>([
    {
      id: 'c1',
      customerNumber: '001',
      name: '홍길동',
      phone: '010-1234-5678',
      email: 'hong@example.com',
      notes: 'VIP 고객',
      lastVisit: new Date('2024-11-10'),
      totalVisits: 15,
      salonId: 's1',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-10'),
    },
    {
      id: 'c2',
      customerNumber: '002',
      name: '김영희',
      phone: '010-2345-6789',
      email: 'kim@example.com',
      lastVisit: new Date('2024-11-08'),
      totalVisits: 8,
      salonId: 's1',
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-11-08'),
    },
    {
      id: 'c3',
      customerNumber: '003',
      name: '박민수',
      phone: '010-3456-7890',
      lastVisit: new Date('2024-11-05'),
      totalVisits: 23,
      salonId: 's1',
      createdAt: new Date('2023-12-10'),
      updatedAt: new Date('2024-11-05'),
    },
  ]);

  const columns = [
    {
      key: 'customerNumber',
      header: t('customer.customerNumber'),
      width: 'w-24',
    },
    {
      key: 'name',
      header: t('customer.name'),
      render: (customer: Customer) => (
        <div>
          <p className="font-medium">{customer.name}</p>
          {customer.notes && (
            <p className="text-xs text-secondary-500">{customer.notes}</p>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: t('customer.phone'),
    },
    {
      key: 'email',
      header: t('customer.email'),
      render: (customer: Customer) => customer.email || '-',
    },
    {
      key: 'totalVisits',
      header: t('customer.totalVisits'),
      render: (customer: Customer) => `${customer.totalVisits}회`,
    },
    {
      key: 'lastVisit',
      header: t('customer.lastVisit'),
      render: (customer: Customer) =>
        customer.lastVisit ? formatDate(customer.lastVisit, 'yyyy-MM-dd') : '-',
    },
  ];

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.customerNumber.includes(searchQuery)
  );

  const handleAddCustomer = () => {
    // Get the last customer number and generate next one
    const lastNumber = customers.length > 0
      ? customers[customers.length - 1].customerNumber
      : '0';
    const nextNumber = generateCustomerNumber(lastNumber);
    console.log('New customer number:', nextNumber);
    
    setShowNewCustomerModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              {t('customer.title')}
            </h1>
            <p className="text-secondary-600 mt-1">
              고객 정보를 관리하고 히스토리를 확인하세요
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleAddCustomer}
          >
            <Plus size={20} className="mr-2" />
            {t('customer.addCustomer')}
          </Button>
        </div>

        {/* Search */}
        <Card>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400"
              size={20}
            />
            <Input
              placeholder="고객 이름, 전화번호, 고객번호로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900">
                {customers.length}
              </p>
              <p className="text-sm text-secondary-600 mt-1">총 고객 수</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900">
                {customers.filter(c => c.totalVisits >= 10).length}
              </p>
              <p className="text-sm text-secondary-600 mt-1">단골 고객 (10회 이상)</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900">
                {customers.filter(c => {
                  if (!c.lastVisit) return false;
                  const daysSince = Math.floor(
                    (new Date().getTime() - c.lastVisit.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return daysSince <= 30;
                }).length}
              </p>
              <p className="text-sm text-secondary-600 mt-1">최근 방문 고객 (30일 이내)</p>
            </div>
          </Card>
        </div>

        {/* Customers Table */}
        <Card>
          <Table
            data={filteredCustomers}
            columns={columns}
            onRowClick={(customer) => console.log('View customer:', customer)}
            emptyMessage="검색 결과가 없습니다"
          />
        </Card>
      </div>

      {/* New Customer Modal */}
      <Modal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        title={t('customer.addCustomer')}
        size="md"
      >
        <form className="space-y-4">
          <Input
            label={t('customer.customerNumber')}
            value={generateCustomerNumber(
              customers.length > 0 ? customers[customers.length - 1].customerNumber : '0'
            )}
            disabled
            helperText="자동으로 생성됩니다"
          />

          <Input
            label={t('customer.name')}
            required
            placeholder="고객 이름을 입력하세요"
          />

          <Input
            label={t('customer.phone')}
            required
            placeholder="010-0000-0000"
          />

          <Input
            label={t('customer.email')}
            type="email"
            placeholder="email@example.com (선택)"
          />

          <Input
            label={t('customer.notes')}
            placeholder="메모를 입력하세요 (선택)"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowNewCustomerModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
