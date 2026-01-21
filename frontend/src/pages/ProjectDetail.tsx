import { useParams } from 'react-router-dom';

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Detail #{id}</h1>
        <p className="text-gray-600 mt-2">Project tasks and details will appear here</p>
      </div>
    </div>
  );
};
