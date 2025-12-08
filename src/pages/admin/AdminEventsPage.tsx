import { AdminLayout } from '@/components/admin/AdminLayout';
import { EventsManager } from '@/components/admin/EventsManager';
import { Helmet } from 'react-helmet-async';

const AdminEventsPage = () => {
  return (
    <AdminLayout title="Events Management">
      <Helmet>
        <title>Events Management - Admin | Master International School</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <EventsManager />
    </AdminLayout>
  );
};

export default AdminEventsPage;
