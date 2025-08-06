import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditFulfillmentPage() {
  const { fulfillmentId } = useParams<{ fulfillmentId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to fulfillment detail page since fulfillment editing is typically handled there
    if (fulfillmentId) {
      navigate(`/orders/fulfillments/${fulfillmentId}`, { replace: true });
    } else {
      navigate('/orders/fulfillments', { replace: true });
    }
  }, [fulfillmentId, navigate]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to fulfillment details...</p>
        </div>
      </div>
    </div>
  );
} 