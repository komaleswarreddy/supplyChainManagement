import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditPaymentPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to payment detail page since payment editing is typically handled there
    if (paymentId) {
      navigate(`/orders/payments/${paymentId}`, { replace: true });
    } else {
      navigate('/orders/payments', { replace: true });
    }
  }, [paymentId, navigate]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to payment details...</p>
        </div>
      </div>
    </div>
  );
} 