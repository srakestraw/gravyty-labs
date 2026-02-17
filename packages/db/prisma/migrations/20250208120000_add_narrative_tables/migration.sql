-- CreateTable
CREATE TABLE "narrative_assets" (
    "id" TEXT NOT NULL,
    "workspace" TEXT NOT NULL,
    "domainScope" TEXT NOT NULL,
    "subDomainScope" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "moment" TEXT NOT NULL,
    "messageIntent" TEXT NOT NULL,
    "channelFit" TEXT[],
    "voice" TEXT NOT NULL,
    "complianceRiskLevel" TEXT NOT NULL,
    "piiTier" TEXT NOT NULL,
    "approvalState" TEXT NOT NULL,
    "relationshipType" TEXT,
    "contentRef" TEXT,
    "embedding" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "approvedById" TEXT,

    CONSTRAINT "narrative_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "narrative_modules" (
    "id" TEXT NOT NULL,
    "narrativeAssetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contentRef" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "narrative_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proof_blocks" (
    "id" TEXT NOT NULL,
    "workspace" TEXT NOT NULL,
    "proofType" TEXT NOT NULL,
    "claimSupportLevel" TEXT NOT NULL,
    "claimClass" TEXT NOT NULL,
    "freshnessWindow" TEXT NOT NULL,
    "allowedVoice" TEXT[],
    "content" TEXT NOT NULL,
    "restrictedChannels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proof_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "narrative_proof_links" (
    "id" TEXT NOT NULL,
    "narrativeAssetId" TEXT NOT NULL,
    "proofBlockId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "narrative_proof_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_plays" (
    "id" TEXT NOT NULL,
    "workspace" TEXT NOT NULL,
    "subWorkspace" TEXT NOT NULL,
    "playCategory" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "cadencePolicy" TEXT NOT NULL,
    "suppressionPolicyId" TEXT,
    "eligibilityJson" JSONB,
    "successEventsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_plays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "narrative_assets_workspace_idx" ON "narrative_assets"("workspace");

-- CreateIndex
CREATE INDEX "narrative_assets_domainScope_subDomainScope_idx" ON "narrative_assets"("domainScope", "subDomainScope");

-- CreateIndex
CREATE INDEX "narrative_assets_approvalState_idx" ON "narrative_assets"("approvalState");

-- CreateIndex
CREATE INDEX "narrative_assets_outcome_moment_idx" ON "narrative_assets"("outcome", "moment");

-- CreateIndex
CREATE INDEX "narrative_modules_narrativeAssetId_idx" ON "narrative_modules"("narrativeAssetId");

-- CreateIndex
CREATE INDEX "proof_blocks_workspace_idx" ON "proof_blocks"("workspace");

-- CreateIndex
CREATE INDEX "proof_blocks_claimClass_idx" ON "proof_blocks"("claimClass");

-- CreateIndex
CREATE UNIQUE INDEX "narrative_proof_links_narrativeAssetId_proofBlockId_key" ON "narrative_proof_links"("narrativeAssetId", "proofBlockId");

-- CreateIndex
CREATE INDEX "narrative_proof_links_narrativeAssetId_idx" ON "narrative_proof_links"("narrativeAssetId");

-- CreateIndex
CREATE INDEX "narrative_proof_links_proofBlockId_idx" ON "narrative_proof_links"("proofBlockId");

-- CreateIndex
CREATE INDEX "delivery_plays_workspace_subWorkspace_idx" ON "delivery_plays"("workspace", "subWorkspace");

-- CreateIndex
CREATE INDEX "delivery_plays_playCategory_idx" ON "delivery_plays"("playCategory");

-- AddForeignKey
ALTER TABLE "narrative_modules" ADD CONSTRAINT "narrative_modules_narrativeAssetId_fkey" FOREIGN KEY ("narrativeAssetId") REFERENCES "narrative_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "narrative_proof_links" ADD CONSTRAINT "narrative_proof_links_narrativeAssetId_fkey" FOREIGN KEY ("narrativeAssetId") REFERENCES "narrative_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "narrative_proof_links" ADD CONSTRAINT "narrative_proof_links_proofBlockId_fkey" FOREIGN KEY ("proofBlockId") REFERENCES "proof_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
