export type SegmentDefinition = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  scope?: {
    suiteId?: string;
    workspaceId?: string;
  };
};

export type SegmentTemplate = {
  id: string;
  title: string;
  prompt: string;
  tags?: string[];
};









