# Generic Content Primitives

Load this resource for repeatable/queryable content such as articles, directories, courses, listings,
or user-contributed records.

## Model

`PostIdentifier` is a website-scoped generic collection/type. `MdPost` is one generic structured
record. ELEMS does not assign vertical meaning: a course, property, job, article, directory entry, or
social post can use the same primitives when their generic fields and relationships satisfy the need.

The MCP workflow is:

```text
list/create PostIdentifier -> query active MdPosts -> retain canonical ID/hash
-> create or CAS-update one record -> query again
-> optionally configure an inspected posts function for list/detail rendering
```

Fields are a bounded flat string map: at most 100 safe keys, 20,000 characters per value, and 100,000
combined key/value characters. Values are not nested objects and cannot contain Liquid or scripts.
An optional slug is one normalized safe segment and unique among active records in its collection.
`parent_id` must reference an active same-website record and cannot create a cycle; it may cross
collections within that website. `position` is a bounded finite decimal string.

Queries return active records only with deterministic ordering and fresh hashes. Updates replace the
complete fields map, so include every field that must remain. Use the fresh hash; deletion is soft,
does not cascade, and leaves active children unchanged.

## Rendering and protected resources

Inspect `posts_function_targets[]`, then use `elems_configure_posts_function` with the exact target and
configuration hash. Select one same-website collection, `list` or `detail` mode, and
`access_mode="all"` or `"granted"`. The latter filters records server-side for the current
authenticated Client's same-website resource grants before rendering.

Product variants can configure future grants to `md_post` resources with
`elems_update_product_variant_resource_grants`. Protected files attached to a record use the separate
multipart `ResourceAsset` lifecycle and are never public Media Library assets. Signed part URLs are
short-lived authorization values and must not be logged or persisted.

Do not request a domain-specific core model when these generic primitives express the requirement.
If required querying, relationships, field types, or behavior are not exposed, stop and report the
missing platform capability instead of fabricating a schema or runtime function.
