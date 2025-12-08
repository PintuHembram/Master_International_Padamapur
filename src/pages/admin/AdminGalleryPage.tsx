import { AdminLayout } from '@/components/admin/AdminLayout';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { Helmet } from 'react-helmet-async';

const AdminGalleryPage = () => {
  return (
    <AdminLayout title="Gallery Management">
      <Helmet>
        <title>Gallery Management - Admin | Master International School</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <GalleryManager />
    </AdminLayout>
  );
};

export default AdminGalleryPage;
