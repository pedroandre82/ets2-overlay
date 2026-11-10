import { OverlayEngine } from '@/components/layout/OverlayEngine';
import { defaultLayout } from '@/config/layouts/defaultLayout';

export default function Home() {
  return <OverlayEngine layout={defaultLayout} />;
}