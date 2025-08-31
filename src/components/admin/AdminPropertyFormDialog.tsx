import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Property } from '@/types/database';
import { PropertyForm } from '@/components/admin/PropertyForm';

interface AdminPropertyFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  onSave: () => void;
}

export const AdminPropertyFormDialog = ({ isOpen, onClose, property, onSave }: AdminPropertyFormDialogProps) => {
  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden p-0">
        <div className="h-full overflow-y-auto">
          <PropertyForm property={property || null} onSave={handleSave} onCancel={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
