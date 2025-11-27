import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export function DataSnapshotInfo() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="w-4 h-4" />
      <span>Data snapshot: November 23, 2024</span>
      <Badge variant="secondary" className="text-xs">5-hour collection</Badge>
    </div>
  );
}
