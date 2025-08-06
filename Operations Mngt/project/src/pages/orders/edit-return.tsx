import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditReturnPage() {
  const { returnId } = useParams<{ returnId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to return detail page since return editing is typically handled there
    if (returnId) {
      navigate(`/orders/returns/${returnId}`, { replace: true });
    } else {
      navigate('/orders/returns', { replace: true });
    }
  }, [returnId, navigate]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to return details...</p>
        </div>
      </div>
    </div>
  );
} 