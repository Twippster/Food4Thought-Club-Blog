---
name: OpenAPI date responses
description: A contract detail for API routes that validate generated date schemas.
---

Generated Zod response schemas can coerce OpenAPI date and date-time strings into `Date` objects before Express serializes them. Keep response validation, but explicitly serialize calendar dates back to `YYYY-MM-DD` and timestamps to ISO strings after parsing so the JSON wire format still matches the OpenAPI contract.

**Why:** A date-only database field was returned as a midnight ISO timestamp after generated response validation, which made the frontend contract less precise even though typechecking passed.

**How to apply:** Whenever `useDates` or date coercion is enabled in the API codegen config, inspect the actual JSON response and normalize validated output before sending it.