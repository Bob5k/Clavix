#!/bin/bash

# Find all test files without @jest/globals import
find tests -name "*.test.ts" -type f | while read file; do
  if ! grep -q "@jest/globals" "$file"; then
    echo "Fixing: $file"

    # Check which Jest globals are used in the file
    uses_describe=$(grep -q "^describe(" "$file" && echo "yes" || echo "no")
    uses_it=$(grep -q "^\s*it(" "$file" && echo "yes" || echo "no")
    uses_expect=$(grep -q "expect(" "$file" && echo "yes" || echo "no")
    uses_beforeEach=$(grep -q "beforeEach(" "$file" && echo "yes" || echo "no")
    uses_afterEach=$(grep -q "afterEach(" "$file" && echo "yes" || echo "no")
    uses_beforeAll=$(grep -q "beforeAll(" "$file" && echo "yes" || echo "no")
    uses_afterAll=$(grep -q "afterAll(" "$file" && echo "yes" || echo "no")
    uses_jest=$(grep -q "jest\." "$file" && echo "yes" || echo "no")

    # Build import list
    imports="describe, it, expect"
    [ "$uses_beforeEach" = "yes" ] && imports="$imports, beforeEach"
    [ "$uses_afterEach" = "yes" ] && imports="$imports, afterEach"
    [ "$uses_beforeAll" = "yes" ] && imports="$imports, beforeAll"
    [ "$uses_afterAll" = "yes" ] && imports="$imports, afterAll"
    [ "$uses_jest" = "yes" ] && imports="$imports, jest"

    # Add import after the last existing import or at the top
    # Find the line number of the last import
    last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)

    if [ -n "$last_import_line" ]; then
      # Insert after last import
      sed -i "" "${last_import_line}a\\
import { $imports } from '@jest/globals';\\
" "$file"
    else
      # No imports found, add at the top (after comments)
      # Find first non-comment, non-empty line
      first_code_line=$(grep -n -v "^[[:space:]]*\(\/\/\|\/\*\|\*\)" "$file" | grep -v "^[[:space:]]*$" | head -1 | cut -d: -f1)
      if [ -n "$first_code_line" ]; then
        sed -i "" "${first_code_line}i\\
import { $imports } from '@jest/globals';\\
\\
" "$file"
      fi
    fi
  fi
done

echo "Done! Fixed test imports."
