const EvidenceManagementPage = () => {
  const [serviceError, setServiceError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const onServiceError = (e) => {
      if (e.detail?.module === 'assessment-evidence') {
        setServiceError('Evidence service unavailable');
      }
    };
    window.addEventListener('service-error', onServiceError);
    return () => window.removeEventListener('service-error', onServiceError);
  }, []);

  const retry = async () => {
    setLoading(true);
    try {
      await apiServices.evidence.getStats();
      setServiceError(null);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Evidence Management</h1>
        {serviceError && (
          <div className="mt-4 rounded-lg p-4 bg-red-50 border border-red-200 flex items-center justify-between">
            <p className="text-sm text-red-800">{serviceError}</p>
            <div className="flex gap-3">
              <button onClick={retry} disabled={loading} className="text-red-700 underline">Retry</button>
              <button onClick={() => setServiceError(null)} className="text-red-700 underline">Dismiss</button>
            </div>
          </div>
        )}
        <p className="text-gray-600 mt-4">Under Construction</p>
      </div>
    </div>
  );
};

export default EvidenceManagementPage;