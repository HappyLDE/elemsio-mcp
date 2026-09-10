# Website Selection and Creation

Load this resource when selecting an account website or creating a new one.

## Normal external-user flow

```text
create/sign in to ELEMS account
-> create a personal MCP/API token
-> connect to https://api.elems.io/mcp with ELEMS_MCP_TOKEN
-> elems_list_websites or elems_find_website
-> elems_create_website only when the user explicitly requests a new site
-> retain returned website_id -> elems_get_context
-> list/create pages and continue with focused authoring resources
```

`elems_list_websites` returns only websites accessible to the authenticated account.
`elems_find_website` searches that same authorized set by name, domain, identifier, or exact ID and
returns a small candidate list when ambiguous. Do not guess or ask the user for an internal ID that
these tools can resolve.

`elems_create_website` accepts a bounded name and optional managed subdomain, locale, and country
hints. It accepts no owner/user/entity identity, arbitrary custom domain, privilege, subscription, or
publication override. The authenticated user becomes owner through the normal account creation flow;
existing cooldown, blueprint, locale, domain, and product rules remain authoritative.

Success is returned only after the new website is selectable through the authenticated website
lookup. Keep its `website_id` as working scope, call `elems_get_context`, inspect active locales and
the default/effective template, then use the normal page and element tools. Creating a website does
not create arbitrary templates, publish content, or bypass account restrictions.

If creation is blocked, report the server's sanitized account/capability limitation. Do not choose a
different owner, invoke admin operations, or work around the normal creation flow.
