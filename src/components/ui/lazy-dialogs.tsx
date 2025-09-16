import dynamic from 'next/dynamic';

// Pre-configured lazy dialogs for performance optimization
export const LazyCreateIndsatsrappeDialog = dynamic(
  () => import('@/components/indsatstrappe/create-indsatstrappe-dialog').then(mod => ({ default: mod.CreateIndsatsrappeDialog })),
  { ssr: false }
);

export const LazyEditIndsatsrappeDialog = dynamic(
  () => import('@/components/indsatstrappe/edit-indsatstrappe-dialog').then(mod => ({ default: mod.EditIndsatsrappeDialog })),
  { ssr: false }
);

export const LazyAddMultipleStepsDialog = dynamic(
  () => import('@/components/indsatstrappe/add-multiple-steps-dialog').then(mod => ({ default: mod.AddMultipleStepsDialog })),
  { ssr: false }
);

export const LazyCreateBarometerDialog = dynamic(
  () => import('@/components/barometer/create-barometer-dialog').then(mod => ({ default: mod.CreateBarometerDialog })),
  { ssr: false }
);

export const LazyEditBarometerDialog = dynamic(
  () => import('@/components/barometer/edit-barometer-dialog').then(mod => ({ default: mod.EditBarometerDialog })),
  { ssr: false }
);

export const LazyCreateDagensSmileyDialog = dynamic(
  () => import('@/components/dagens-smiley/create-dagens-smiley-dialog').then(mod => ({ default: mod.CreateDagensSmileyDialog })),
  { ssr: false }
);

export const LazyEditDagensSmileyDialog = dynamic(
  () => import('@/components/dagens-smiley/edit-dagens-smiley-dialog').then(mod => ({ default: mod.EditDagensSmileyDialog })),
  { ssr: false }
);

export const LazyInviteUserDialog = dynamic(
  () => import('@/components/ui/invite-user-dialog').then(mod => ({ default: mod.InviteUserDialog })),
  { ssr: false }
);

export const LazyDeleteChildDialog = dynamic(
  () => import('@/components/ui/delete-child-dialog').then(mod => ({ default: mod.DeleteChildDialog })),
  { ssr: false }
);
