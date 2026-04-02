---
name: Trace data flows end-to-end at build time
description: When building a data pipeline, verify the data reaches its consumer on first implementation, not after user reports it's broken
type: feedback
---

Always trace data flows end-to-end immediately when implementing a pipeline.

**Why:** In this session, `exportConfig` sent only file names instead of `{name, content}` objects. The bug lived through the entire Knowledge Base implementation and wasn't caught until the user tested with real data. The pipeline was: UI → exportConfig → POST /api/flow → flowEngine → ctx.knowledgeContext → AI system prompt. Checking the POST body at the server on first deploy would have exposed it immediately.

**How to apply:** When adding any new data to a flow (knowledge files, settings, credentials), immediately verify the JSON at the receiving end before building the consumer logic. `console.log(req.body)` first, consumer code second.
