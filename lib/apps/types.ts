export type AppId = string;

export type AppPill = {
  id: string;
  label: string;
  href: string;
};

export type AppGroup = 'main' | 'sim';

export type AppDefinition = {
  id: AppId;
  label: string;
  description?: string;
  icon?: any;
  href: string;
  pills?: AppPill[];

  // Internal metadata used by the current UI (kept optional so registry can stay minimal)
  group?: AppGroup;
  color?: string;
  requiresRole?: boolean;
  poweredBy?: string | string[];
};

export type NavItem = { 
  name: string; 
  href: string; 
  icon: string; 
  id?: string; 
  external?: boolean;
  children?: NavItem[]; // For expandable groups
};

export type NavSection = {
  id: string;
  title?: string;
  href?: string; // Parent link href for collapsible groups
  icon?: string; // Parent icon for collapsible groups
  items: NavItem[];
};





