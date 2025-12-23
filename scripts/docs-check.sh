#!/bin/bash

# Documentation validation script
# Checks for required files, broken links, and required headings

set -e

DOCS_DIR="docs"
ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Checking documentation structure..."

# Check required root files
check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}❌ Missing required file: $1${NC}"
        ((ERRORS++))
        return 1
    else
        echo -e "${GREEN}✅ Found: $1${NC}"
        return 0
    fi
}

# Check required headers in markdown files
check_headers() {
    local file=$1
    local required_headers=("Purpose" "Audience" "Last Updated")
    
    for header in "${required_headers[@]}"; do
        if ! grep -q "^\*\*${header}\*\*" "$file" 2>/dev/null; then
            echo -e "${YELLOW}⚠️  Missing header '${header}' in: $file${NC}"
            ((WARNINGS++))
        fi
    done
}

# Check requirements doc headers
check_requirements_headers() {
    local file=$1
    local required=("Problem Statement" "Users and Jobs-to-Be-Done" "Outcomes and Success Metrics" "MVP Requirements")
    
    for header in "${required[@]}"; do
        if ! grep -q "^## ${header}" "$file" 2>/dev/null && ! grep -q "^### ${header}" "$file" 2>/dev/null; then
            echo -e "${YELLOW}⚠️  Requirements doc missing '${header}' in: $file${NC}"
            ((WARNINGS++))
        fi
    done
}

# Check for broken markdown links (basic check)
check_links() {
    local file=$1
    local dir=$(dirname "$file")
    
    # Find all markdown links using grep
    grep -oE '\[([^\]]+)\]\(([^)]+)\)' "$file" 2>/dev/null | while IFS= read -r match; do
        # Extract link part (between parentheses)
        local link=$(echo "$match" | sed -E 's/.*\]\(([^)]+)\).*/\1/')
        # Skip external links
        if [[ ! "$link" =~ ^https?:// ]]; then
            # Resolve relative path
            local target="$dir/$link"
            # Remove anchor if present
            target="${target%%#*}"
            if [ ! -f "$target" ] && [ ! -d "$target" ]; then
                echo -e "${YELLOW}⚠️  Possible broken link in $file: $link${NC}"
                ((WARNINGS++))
            fi
        fi
    done
}

# Check root files
echo ""
echo "📄 Checking root documentation files..."
check_file "$DOCS_DIR/README.md"
check_file "$DOCS_DIR/CLAUDE.md"

# Check section files
echo ""
echo "📁 Checking section files..."
check_file "$DOCS_DIR/product/README.md"
check_file "$DOCS_DIR/product/CLAUDE.md"
check_file "$DOCS_DIR/design/README.md"
check_file "$DOCS_DIR/design/CLAUDE.md"
check_file "$DOCS_DIR/tech/README.md"
check_file "$DOCS_DIR/tech/CLAUDE.md"
check_file "$DOCS_DIR/shared-services/README.md"
check_file "$DOCS_DIR/shared-services/CLAUDE.md"

# Check domain structure
echo ""
echo "🏢 Checking domain structure..."
DOMAINS=("admissions" "advancement" "ai-assistants" "sis" "student-lifecycle" "community" "career" "admin" "dashboard" "data")

for domain in "${DOMAINS[@]}"; do
    echo "  Checking domain: $domain"
    check_file "$DOCS_DIR/product/domains/$domain/README.md"
    check_file "$DOCS_DIR/design/domains/$domain/README.md"
    check_file "$DOCS_DIR/tech/domains/$domain/README.md"
done

# Check shared services structure
echo ""
echo "🔧 Checking shared services structure..."
SERVICES=("auth" "data-provider" "communication" "guardrails" "do-not-engage" "segments" "contacts" "banner" "command-center" "agent-ops" "assignments" "features")

for service in "${SERVICES[@]}"; do
    if [ -d "$DOCS_DIR/shared-services/$service" ]; then
        echo "  Checking service: $service"
        check_file "$DOCS_DIR/shared-services/$service/README.md"
    fi
done

# Check headers in key files
echo ""
echo "📋 Checking required headers..."
find "$DOCS_DIR" -name "README.md" -type f | while read -r file; do
    check_headers "$file"
done

# Check requirements docs
echo ""
echo "📝 Checking requirements documentation..."
find "$DOCS_DIR/product/domains" -name "*.md" -path "*/requirements/*" -type f | while read -r file; do
    check_requirements_headers "$file"
done

# Check links (basic)
echo ""
echo "🔗 Checking links (basic validation)..."
find "$DOCS_DIR" -name "*.md" -type f | while read -r file; do
    check_links "$file"
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Documentation check passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Documentation check completed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}❌ Documentation check failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    exit 1
fi

