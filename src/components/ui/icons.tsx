"use client";

import React from 'react';
import { Icon, IconProps } from '@chakra-ui/react';
import { 
  MdSettings, 
  MdEdit, 
  MdSave, 
  MdClose, 
  MdAdd,
  MdCheck,
  MdWarning,
  MdError,
  MdInfo,
  MdStar,
  MdStarBorder
} from 'react-icons/md';
import { GoNumber } from 'react-icons/go';

// Define common icon sizes
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

type IconSize = keyof typeof ICON_SIZES;

interface CustomIconProps extends Omit<IconProps, 'size'> {
  size?: IconSize | number;
}

// Helper function to get icon size
const getIconSize = (size: IconSize | number = 'md'): number => {
  if (typeof size === 'number') return size;
  return ICON_SIZES[size];
};

// Unified trash/delete icon component - using the striped trash can design
export const TrashIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => {
  const iconSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <Icon size={iconSize as "sm" | "md" | "lg" | "xl" | "xs" | "inherit"} {...props}>
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path 
          fillRule="evenodd" 
          d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53L15.986 5.952l.149.022a.75.75 0 00.23-1.482A48.16 48.16 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" 
          clipRule="evenodd" 
        />
      </svg>
    </Icon>
  );
};

// Settings icon
export const SettingsIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon {...props}>
    <MdSettings size={getIconSize(size)} />
  </Icon>
);

// Edit icon
export const EditIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon {...props}>
    <MdEdit size={getIconSize(size)} />
  </Icon>
);

// Save icon
export const SaveIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon {...props}>
    <MdSave size={getIconSize(size)} />
  </Icon>
);

// Close icon
export const CloseIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon {...props}>
    <MdClose size={getIconSize(size)} />
  </Icon>
);

// Number icon
export const NumberIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon {...props}>
    <GoNumber size={getIconSize(size)} />
  </Icon>
);

// Add icon
export const AddIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon {...props}>
    <MdAdd size={getIconSize(size)} />
  </Icon>
);

// Status icons for toasts and notifications
export const CheckIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon {...props}>
    <MdCheck size={getIconSize(size)} />
  </Icon>
);

export const WarningIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon {...props}>
    <MdWarning size={getIconSize(size)} />
  </Icon>
);

export const ErrorIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon {...props}>
    <MdError size={getIconSize(size)} />
  </Icon>
);

export const InfoIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon {...props}>
    <MdInfo size={getIconSize(size)} />
  </Icon>
);

// Star icons for admin promotion/demotion
export const StarIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon {...props}>
    <MdStar size={getIconSize(size)} />
  </Icon>
);

export const StarOutlineIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon {...props}>
    <MdStarBorder size={getIconSize(size)} />
  </Icon>
);

// Custom star icons using the exact same path as used in the dashboard
export const AdminStarIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => {
  const iconSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <Icon size={iconSize as "sm" | "md" | "lg" | "xl" | "xs" | "inherit"} {...props}>
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2L13 7l5.5 1-4 4 1 5.5L10 15l-5.5 2.5 1-5.5-4-4L7 7l3-5z" clipRule="evenodd" />
      </svg>
    </Icon>
  );
};

// Crossed star for demoting admin
export const DemoteStarIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => {
  const iconSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <Icon size={iconSize as "sm" | "md" | "lg" | "xl" | "xs" | "inherit"} {...props}>
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2L13 7l5.5 1-4 4 1 5.5L10 15l-5.5 2.5 1-5.5-4-4L7 7l3-5z" clipRule="evenodd" opacity="0.5" />
        <path stroke="currentColor" strokeWidth="2" d="M5 5L15 15M15 5L5 15" fill="none" strokeLinecap="round"/>
      </svg>
    </Icon>
  );
};

// Custom SVG icons that are used across the site
export const MenuIcon: React.FC<IconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2Z"
    />
  </Icon>
);

export const UserIcon: React.FC<IconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
    />
  </Icon>
);

// Drag handle icon (three horizontal lines)
export const DragHandleIcon: React.FC<CustomIconProps> = ({ 
  size = 'md', 
  ...props 
}) => (
  <Icon boxSize={getIconSize(size)} {...props}>
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" />
    </svg>
  </Icon>
);

// Export all icons as a single object for easy importing
export const Icons = {
  Trash: TrashIcon,
  Settings: SettingsIcon,
  Edit: EditIcon,
  Save: SaveIcon,
  Close: CloseIcon,
  Number: NumberIcon,
  Add: AddIcon,
  Check: CheckIcon,
  Warning: WarningIcon,
  Error: ErrorIcon,
  Info: InfoIcon,
  Star: StarIcon,
  StarOutline: StarOutlineIcon,
  AdminStar: AdminStarIcon,
  DemoteStar: DemoteStarIcon,
  Menu: MenuIcon,
  User: UserIcon,
  DragHandle: DragHandleIcon,
} as const;

// Type for icon names
export type IconName = keyof typeof Icons;
