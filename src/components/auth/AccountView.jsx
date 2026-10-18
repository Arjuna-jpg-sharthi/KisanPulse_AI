import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginView from './LoginView';
import { Card, CardBody, CardHeader } from '../shared/Card';
import { Button } from '../shared/Button';

export default function AccountView() {
  const { user, ready, logout } = useAuth();
  if (!ready) return <p role="status" style={{ padding: 24 }}>Loading your account…</p>;
  if (!user) return <LoginView />;
  return <div style={{ maxWidth: 760, margin: '24px auto' }}>
    <Card>
      <CardHeader title="Your KisanPulse account" subtitle="Your account is stored securely on this app’s server." />
      <CardBody>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Account type:</strong> {user.role === 'admin' ? 'Administrator' : user.role === 'buyer' ? 'Buyer' : 'Farmer / Seller'}</p>
        <Button variant="outline" onClick={logout}>Sign out</Button>
      </CardBody>
    </Card>
  </div>;
}
