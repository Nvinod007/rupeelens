import { redirect } from 'next/navigation';

/** Old URL — keeps bookmarks working. */
export default function DashboardRedirectPage() {
  redirect('/insights');
}
