import { AdminLayout } from '@/components/admin/AdminLayout';
import { NewsManager } from '@/components/admin/NewsManager';
import { Helmet } from 'react-helmet-async';

const AdminNewsPage = () => {
  return (
    <AdminLayout title="News Management">
      <Helmet>
        <title>News Management - Admin | Master International School</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <NewsManager />
    </AdminLayout>
  );
};

export default AdminNewsPage;
