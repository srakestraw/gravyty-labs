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

export type NavItem = { name: string; href: string; icon: string; id?: string; external?: boolean };

export type NavSection = {
  id: string;
  title?: string;
  items: NavItem[];
};



