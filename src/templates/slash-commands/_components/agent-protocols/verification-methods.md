## Verification Methods by Category

### Functionality
**Checklist items about:** Code works, features implemented, requirements met

**Verification approach:**
1. Run the implemented code/feature
2. Check expected behavior matches requirements
3. Verify all user flows complete successfully

**Commands to use:**
- Run application: `npm start`, `npm run dev`
- Execute specific feature manually
- Check output matches expected

**Evidence examples:**
- "Feature X works as specified"
- "Login flow completes successfully"
- "API returns expected response format"

---

### Testing
**Checklist items about:** Tests pass, coverage met, test quality

**Verification approach:**
1. Run test suite
2. Check coverage report
3. Verify no failing tests

**Commands to use:**
- `npm test` or project test command
- `npm run coverage` for coverage report
- Look for test output in terminal

**Evidence examples:**
- "npm test - 47 tests passing, 0 failed"
- "Coverage: 85% (exceeds 80% threshold)"
- "All integration tests pass"

---

### Robustness/Edge Cases
**Checklist items about:** Error handling, edge cases, graceful degradation

**Verification approach:**
1. Test with edge case inputs (empty, null, max values)
2. Check error messages are user-friendly
3. Verify system recovers gracefully

**Manual testing:**
- Input empty values
- Input invalid data types
- Test boundary conditions (min/max values)
- Test with large datasets

**Evidence examples:**
- "Empty input shows validation error"
- "Invalid email format displays helpful message"
- "System handles 10,000 records without timeout"

---

### Quality
**Checklist items about:** Code style, conventions, no warnings

**Verification approach:**
1. Run linter
2. Check for console errors
3. Review code style

**Commands to use:**
- `npm run lint` or equivalent
- Check browser console for errors
- Review PR diff for style

**Evidence examples:**
- "npm run lint - 0 errors, 0 warnings"
- "No console errors in browser"
- "Code follows project conventions"

---

### Accessibility
**Checklist items about:** Keyboard navigation, screen reader, WCAG

**Verification approach:**
1. Tab through interface
2. Check color contrast
3. Verify alt text on images

**Manual testing:**
- Navigate using only keyboard
- Check focus indicators visible
- Test with screen reader (optional)

**Evidence examples:**
- "All interactive elements keyboard accessible"
- "Focus order is logical"
- "Color contrast meets WCAG AA"

---

### Security
**Checklist items about:** Auth, input sanitization, data protection

**Verification approach:**
1. Verify authentication required where expected
2. Test input sanitization
3. Check sensitive data handling

**Manual testing:**
- Try accessing protected routes without auth
- Submit potentially malicious input
- Check network tab for sensitive data exposure

**Evidence examples:**
- "Protected routes redirect to login"
- "SQL injection attempts are sanitized"
- "Passwords not logged or exposed"

---

### Performance
**Checklist items about:** Response times, resource usage

**Verification approach:**
1. Check response times
2. Monitor memory/CPU usage
3. Test with realistic data volumes

**Tools:**
- Browser DevTools Performance tab
- Network tab for response times
- Lighthouse performance score

**Evidence examples:**
- "Page load time < 2s"
- "API response time < 200ms"
- "Memory usage stable under load"

---

### Documentation
**Checklist items about:** Docs updated, comments present

**Verification approach:**
1. Check README updates
2. Verify JSDoc/comments on complex functions
3. Review API documentation

**Commands to use:**
- `cat README.md` - check for updates
- Review changed files for comments

**Evidence examples:**
- "README updated with new feature"
- "API endpoints documented"
- "Complex logic has explanatory comments"

---

## Verification Type Detection

**Automated items contain keywords:**
- compiles, builds, tests pass, lint, typecheck, no errors

**Semi-automated items contain keywords:**
- renders, displays, console errors, responsive, visual

**Manual items contain keywords:**
- requirements, edge cases, handles, correctly, properly

---

## Confidence Levels

| Level | When to use | Example |
|-------|-------------|---------|
| HIGH | Automated tool verification | npm test exit code 0 |
| MEDIUM | Manual verification with clear evidence | Code review shows implementation |
| LOW | General assessment without specific evidence | "Looks correct" |

Always prefer higher confidence verification when possible.
